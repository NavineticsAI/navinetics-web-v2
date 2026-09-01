#!/usr/bin/env python3
"""
Rebuild the four founder portraits in public/ from their sources.

    python3 tools/founder-portraits.py [--check]

Full spec, and the reasoning behind every constant:
    documentation/dev/shubham/website/11-founder-portraits.md

Requires numpy, scipy and Pillow (not project dependencies - this is an asset
regeneration tool, run by hand, like tools/world-dots.mjs).

Bennet and Oh rebuild from the 2026 camera originals; set ORIGINALS to wherever
they live. Lee and Goerss have no originals - they are cropped from the graded
web exports kept in tools/portraits-src/.

NEVER sharpen these images, and never hand-edit the JPEGs in public/. See s8 of
the spec: unsharp masking on these files produces visible noise, and Lee is
already upscaled 2.34x at display size.
"""
import argparse, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

ROOT      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC    = os.path.join(ROOT, 'public')
SRCDIR    = os.path.join(ROOT, 'tools', 'portraits-src')
ORIGINALS = os.path.expanduser('~/Downloads')

# ---- targets, all measured off Lee + Goerss (the reference pair) -------------
EYE          = 0.25      # eye line, as a fraction of image height
FACE_LUM     = 114.0     # sRGB 0-255, measured in the card crop
WB_RB        = 1.40      # face R/B
WB_GB        = 1.09      # face G/B
SHADOW_LIFT  = 0.04      # was 0.22 - that veiled both faces. Do not raise.
DEGLOW       = 0.55      # veiling-glare removal; 1.0 goes heavy round the eyes
MIDTONE      = 0.16      # S-curve on L*
SKIN_A       = 11.05     # Lee+Goerss mean skin a*
SKIN_B       = 10.35     # ... and b*
DEBLUE_A     = 2.7       # Bennet only - his background measured a* -7.1
DEBLUE_B     = 4.6       #              ... b* -6.2
ANCHOR_LO    = 0.4       # percentiles restored after grading, so the suits stay
ANCHOR_HI    = 99.6      # black and the window stays white

from scipy.ndimage import uniform_filter


GL,GRB,GGB=FACE_LUM,WB_RB,WB_GB

def lum(x): return 0.2126*x[...,0]+0.7152*x[...,1]+0.0722*x[...,2]

def reframe(im, eye, facex):
    """Crop top (to raise) or bottom (to lower) so `eye` lands on EYE, keep 5:4."""
    w,h=im.size
    if eye>EYE:  T=(eye-EYE)/(1-EYE); box=(0,int(T*h),w,h)
    else:        B=1-eye/EYE;         box=(0,0,w,int(h*(1-B)))
    im=im.crop(box); w,h=im.size
    nw=int(h*1.25)
    if nw>w: nw=w; h=int(nw/1.25); im=im.crop((0,0,w,h))
    l=int(np.clip(facex*w-facex*nw,0,w-nw))
    return im.crop((l,0,l+nw,im.size[1]))

def solve(im, facebox, gl=None, grb=None, ggb=None):
    """Match brightness and face colour to the set (as used for Oh).

    The three targets are arguments rather than the module constants they used
    to read directly. Those constants are section 6's - 114 luminance, R/B 1.40 -
    and they belong to Bennet and Oh. Section 7 gives Lee and Goerss different
    ones and says plainly not to grade them toward the other two, but with the
    targets baked into this function the only way to run the exposure solver on
    Lee was to run it with Bennet's numbers. That was done, and it took his face
    28 luminance points down and his R/B from 1.52 to 1.36 - measurably the
    "dull, dark and blue" it looked.
    """
    gl  = FACE_LUM if gl  is None else gl
    grb = WB_RB    if grb is None else grb
    ggb = WB_GB    if ggb is None else ggb
    a0=np.asarray(im,dtype=np.float32)/255.
    Hh,W,_=a0.shape
    FB=(slice(int(facebox[0]*Hh),int(facebox[1]*Hh)),slice(int(facebox[2]*W),int(facebox[3]*W)))
    f0=lum(a0[FB[0],FB[1]]); f0=f0[(f0>.10)&(f0<.85)].mean()
    L0=lum(a0); lo0,hi0=np.percentile(L0,ANCHOR_LO),np.percentile(L0,ANCHOR_HI)
    def render(t):
        lin=np.where(a0<=.04045,a0/12.92,((a0+.055)/1.055)**2.4)
        g=float(np.clip(np.log((t/255.)**2.2)/np.log(f0**2.2),.30,1.7))
        lin=np.clip(lin,0,1)**g
        Ll=lum(np.clip(lin,0,1))
        lin=lin*(1+SHADOW_LIFT*np.clip((0.34-Ll)/0.34,0,1)**1.6)[...,None]
        fr=lin[FB[0],FB[1]]; m=(lum(fr)>.02)&(lum(fr)<.75)
        Rc,Gc,Bc=[fr[...,i][m].mean() for i in range(3)]
        tr,tg,tb=grb,ggb,1.0
        s=(0.2126*Rc+0.7152*Gc+0.0722*Bc)/(0.2126*tr+0.7152*tg+0.0722*tb)
        for i,(cur,tgt) in enumerate(((Rc,tr*s),(Gc,tg*s),(Bc,tb*s))):
            lin[...,i]*=float(np.clip(tgt/max(cur,1e-6),.80,1.30))
        o=np.clip(lin,0,1); o=np.where(o<=.0031308,o*12.92,1.055*o**(1/2.4)-.055)
        L1=lum(o); lo1,hi1=np.percentile(L1,ANCHOR_LO),np.percentile(L1,ANCHOR_HI)
        return Image.fromarray(np.clip(((o-lo1)*((hi0-lo0)/max(hi1-lo1,1e-6))+lo0)*255+.5,0,255).astype(np.uint8))
    def face(x):
        a=np.asarray(x,dtype=np.float32)
        return lum(a[FB[0],FB[1]])[(lum(a[FB[0],FB[1]])>25)&(lum(a[FB[0],FB[1]])<215)].mean()
    t=gl
    for _ in range(7):
        out=render(t); m=face(out)
        if abs(m-gl)<1.2: break
        t*=(gl/m)**0.85
    return out


# ── colour ────────────────────────────────────────────────────────────────────
def srgb2lab(rgb):
    a=rgb/255.; lin=np.where(a<=.04045,a/12.92,((a+.055)/1.055)**2.4)
    M=np.array([[.4124,.3576,.1805],[.2126,.7152,.0722],[.0193,.1192,.9505]])
    xyz=lin@M.T/np.array([.95047,1.,1.08883])
    f=np.where(xyz>.008856,np.cbrt(xyz),7.787*xyz+16/116)
    return np.stack([116*f[...,1]-16,500*(f[...,0]-f[...,1]),200*(f[...,1]-f[...,2])],-1)

def lab2srgb(lab):
    fy=(lab[...,0]+16)/116; f=np.stack([fy+lab[...,1]/500,fy,fy-lab[...,2]/200],-1)
    xyz=np.where(f**3>.008856,f**3,(f-16/116)/7.787)*np.array([.95047,1.,1.08883])
    M=np.array([[3.2406,-1.5372,-.4986],[-.9689,1.8758,.0415],[.0557,-.2040,1.0570]])
    lin=np.clip(xyz@M.T,0,1)
    return np.clip(np.where(lin<=.0031308,lin*12.92,1.055*lin**(1/2.4)-.055)*255+.5,0,255).astype(np.uint8)

def skinmask(im):
    """YCbCr skin, feathered. Used to keep colour work off the background."""
    y,cb,cr=[np.asarray(im.convert('YCbCr'),dtype=np.float32)[...,i] for i in range(3)]
    return np.clip(gaussian_filter(((cr>133)&(cr<180)&(cb>77)&(cb<130)&(y>45)&(y<235)).astype(np.float32),7),0,1)

def deglow(im,k=DEGLOW,radius=42,thresh=72.0):
    """Subtract the bloom the blown window casts on its surroundings."""
    lab=srgb2lab(np.asarray(im,dtype=np.float32)); L=lab[...,0]
    glow=gaussian_filter(np.clip(L-thresh,0,None)/(100-thresh),radius)
    glow=glow/max(glow.max(),1e-6)
    lo,hi=np.percentile(L,ANCHOR_LO),np.percentile(L,ANCHOR_HI)
    L2=L-k*glow*np.clip((100-L)/100,0,1)*22
    lo2,hi2=np.percentile(L2,ANCHOR_LO),np.percentile(L2,ANCHOR_HI)
    lab[...,0]=np.clip((L2-lo2)*((hi-lo)/max(hi2-lo2,1e-6))+lo,0,100)
    return Image.fromarray(lab2srgb(lab))

def midtone(im,amt=MIDTONE):
    """S-curve on L* only. Restores modelling after the lift - NOT an edge filter."""
    lab=srgb2lab(np.asarray(im,dtype=np.float32)); L=lab[...,0]/100.
    lab[...,0]=np.clip((L+amt*(L-.5)*(1-np.abs(L-.5)*2))*100,0,100)
    return Image.fromarray(lab2srgb(lab))

def chroma_to(im,fx,ta=SKIN_A,tb=SKIN_B,cap=1.35):
    lab=srgb2lab(np.asarray(im,dtype=np.float32)); m=skinmask(im); Hh,W,_=lab.shape
    sel=np.zeros(lab.shape[:2],bool)
    sel[int(.10*Hh):int(.46*Hh),int((fx-.075)*W):int((fx+.075)*W)]=True
    sel&=(lab[...,0]>25)&(lab[...,0]<92)&(lab[...,1]>2)
    ca,cb=lab[...,1][sel].mean(),lab[...,2][sel].mean()
    lab[...,1]*=1+m*(np.clip(ta/max(ca,1e-3),1/cap,cap)-1)
    lab[...,2]*=1+m*(np.clip(tb/max(cb,1e-3),1/cap,cap)-1)
    return Image.fromarray(lab2srgb(lab))

def desat(im,k):
    """Scale chroma evenly, hues held. For a source that arrives over-saturated.

    Used for Lee only. `chroma_to` was tried first and is the wrong instrument
    here: it pushes skin toward a target through a feathered mask, which on a
    file this far out meant a large gain on the face and none on the background,
    and the white balance then over-corrected trying to follow — the background
    came out cyan at a* -13.9 against +2.2 for Oh. Scaling a* and b* together
    moves everything by the same factor, so nothing shifts hue relative to
    anything else and the ground stays where it was."""
    lab=srgb2lab(np.asarray(im,dtype=np.float32))
    lab[...,1]*=k; lab[...,2]*=k
    return Image.fromarray(lab2srgb(lab))


def deblue(im,da=DEBLUE_A,db=DEBLUE_B):
    """Shift neutrals only - weighted by low chroma, so skin and tie stay put."""
    lab=srgb2lab(np.asarray(im,dtype=np.float32))
    wt=np.clip(1-np.hypot(lab[...,1],lab[...,2])/16.,0,1)
    lab[...,1]+=da*wt; lab[...,2]+=db*wt
    return Image.fromarray(lab2srgb(lab))

# ── the four ──────────────────────────────────────────────────────────────────
# name, source, pre-crop, eye line now, face x, output size, full grade, quality
JOBS=[
  # ── ALL FOUR ARE RETOUCHED SOURCES, AND NONE OF THEM IS GRADED HERE. ────────
  # Every portrait now arrives from the same retouching pass at 1402x1122, which
  # is already 5:4. They are internally consistent — same window, same light,
  # and Goerss is no longer the flash-lit odd one out — so the colour work this
  # file was built to do has nothing left to correct. Grading them would
  # overwrite decisions someone made deliberately.
  #
  # `False` in the grade column means: crop, reframe, resize, encode. Nothing
  # else. See s6/s7 of the spec for what is being skipped and why it no longer
  # applies.
  #
  # THE CROPS ARE SOLVED FOR ONE THING: EQUAL HEAD SIZE. Measured in the sources,
  # heads run 384px (Lee), 520 (Bennet), 523 (Oh) and 468 (Goerss) — Lee sits
  # noticeably further from the camera. Each box is sized so the head lands at
  # ~49.5% of the output, which is the largest common value the four can reach.
  #
  # Headroom cannot also be equalised, and that is a property of the sources:
  # Lee's crown is 29px from the top edge and Goerss's is 19px, while Bennet has
  # 174px and Oh 145px. There is nothing above the first two to crop to, so they
  # keep a tighter top. Head size is the difference a reader sees on a row of
  # four cards; headroom is not.
  #
  # name, source, pre-crop, eye (0.25 = passthrough), face x in the crop,
  # output size, grade, jpeg quality
  ('kendall-lee-150-500x400-1.jpg', ('orig','dr_lee_enhanced_final.png'), (327,0,1297,776),   .25,.520,(1200,960), False, 92),
  # Bennet and Oh are cropped from the top, not from the frame edge like the
  # other two. Their sources leave 174px and 140px above the crown where Lee has
  # 29 and Goerss 19, so a crop starting at y=0 sat them visibly LOWER in the
  # card than the other two — the top of the head reads as the thing that is
  # out of line, more than head size does. Taking the difference off the top
  # brings all four crowns to roughly 3.5%.
  # New source, 2026-09-01. Its crown sits at y=174 of 1122 - 15.5% headroom,
  # where Lee's is 3.6% and Goerss's 2.2% - so it is cropped DOWN to meet
  # them rather than taken at the frame edge. Solved for crown 3.0%: the box
  # can be at most 977 tall before it runs past the bottom of the file, which
  # puts his head at 53% against Lee's 51% and Goerss's 50%.
  ('kevin-bennet.jpg',              ('orig','kevin_enhanced_gpt.png'),    (129,145,1350,1122),.25,.550,(1200,960), False, 92),
  ('yoonbae-oh.jpg',                ('orig','oh_enhanced_gpt.png'),       (278,108,1403,1008),.25,.553,(1200,960), False, 92),
  ('stephan-goerss-150.jpg',        ('orig','steve_enhanced_gpt.png'),    (221,0,1402,945),   .25,.535,(1200,960), False, 92),
]

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--originals',default=ORIGINALS,help='where the 2026 camera files live')
    ap.add_argument('--check',action='store_true',help='report only, write nothing')
    ap.add_argument('--only',default=None,
                    help='rebuild just the portraits whose filename contains this')
    a=ap.parse_args()

    jobs=[j for j in JOBS if not a.only or a.only.lower() in j[0].lower()]
    if not jobs:
        print(f'--only {a.only!r} matched none of: '
              + ', '.join(j[0] for j in JOBS),file=sys.stderr); return 1

    # The originals check applies to the SELECTED jobs only. It used to run
    # across all four and abort if any was absent, which meant re-cropping one
    # portrait required every founder's camera original on the machine. Those
    # are large files that stay on whichever laptop imported the shoot, so in
    # practice the script refused to run at all on a second machine.
    missing=[n for _,(k,n),*_ in jobs if k=='orig' and not os.path.exists(os.path.join(a.originals,n))]
    if missing:
        print(f'missing originals in {a.originals}: {", ".join(missing)}',file=sys.stderr)
        print('pass --originals /path/to/them, or --only <name> to rebuild one',file=sys.stderr); return 1
    for name,(kind,fn),pre,eye,fx,size,full,q in jobs:
        im=Image.open(os.path.join(a.originals if kind=='orig' else SRCDIR,fn)).convert('RGB')
        if pre: im=im.crop(pre)
        im=reframe(im,eye,fx)
        if size: im=im.resize(size,Image.LANCZOS)
        if full:
            # `full` is either True, meaning section 6's targets, or a dict of
            # per-subject ones. Lee needs the second: he is graded to the pair
            # he was photographed with, not to the constants at the top of this
            # file, which are Bennet's and Oh's.
            g = full if isinstance(full, dict) else {}
            im=solve(im,(0.06,0.42,fx-.09,fx+.09),
                     g.get('lum'), g.get('rb'), g.get('gb'))   # exposure + white balance
            # De-glow is OPTIONAL, and for Lee it is off. It models the bloom a
            # blown window throws onto the face and subtracts it, which is right
            # for Bennet and Oh. On Lee's frame the window is smaller and the
            # Plummer Building fills the space instead, so the filter read a
            # correctly-exposed building as glare and took the background from
            # L* 85.9 to 58.8 - the "weirdly dark" in the report, and 30 points
            # below Oh's 89. His ungraded crop already sits at the set's
            # luminance; it only ever needed its colour bringing in.
            if g.get('deglow', True): im=deglow(im)
            if g.get('midtone', True): im=midtone(im)
            if g.get('desat'):                          # even chroma scale, hues held
                im=desat(im,g['desat'])
            if g.get('skin'):                           # bring skin chroma to the
                im=chroma_to(im,fx)                     # s6.7 mean, without the de-blue
            if g.get('neutral'):
                # Same mechanism as s6.8's de-blue, opposite direction. Matching
                # Lee's face pulled his background to a* -9.9, the greenest in
                # the set against -4.9 to +2.2, and it shows as a green cast on
                # the Plummer Building and the sky. Shifting neutrals only, by
                # low chroma weight, moves the building and leaves his face and
                # the red tie where the steps above put them.
                im=deblue(im,*g['neutral'])
            if name.startswith('kevin'):                # Bennet was the desaturated,
                im=deblue(chroma_to(im,fx))             # cyan one - see s6.7 / s6.8
        print(f'  {name:<34} -> {im.size[0]}x{im.size[1]}' + ('' if not a.check else '  (check only)'))
        if not a.check:
            im.save(os.path.join(PUBLIC,name),quality=q,optimize=True,progressive=True)
    print('done' if not a.check else 'check only - nothing written')
    return 0

if __name__=='__main__':
    sys.exit(main())
