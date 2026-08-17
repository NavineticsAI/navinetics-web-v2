#!/usr/bin/env python3
"""
Measure the four founder portraits against the spec's targets.

    python tools/measure-portraits.py [--extra name=path ...]

Spec: documentation/dev/shubham/website/11-founder-portraits.md

WHY THIS EXISTS. The spec's section 8 says, in order: measure inside the card
crop and not the whole image, measure colour in CIELAB and not RGB ratios, and
look at the picture before trusting the number. It gives targets for all of
that - 114 face luminance for Bennet and Oh, 142 for Lee and Goerss, skin a*
11.05 and b* 10.35 - and there was no way to check any of them without
rewriting the measurement by hand each time, which is how a portrait got graded
to the wrong one of those two targets.

The face box is the spec's: 12-45% of height, faceX +/- 7.5% of width. The
building behind these subjects is beige and lands squarely in skin tones, so a
detector run over the whole frame reports the wall rather than the man - the
spec records that happening and reporting 122 for a face that was 76.
"""
import argparse, os, sys
import numpy as np
from PIL import Image

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')

# name, file, faceX (from spec s5), which target set it belongs to
SUBJECTS = [
    # 0.50, not the spec's 0.620. The recrop from the retouched source centres
    # him; leaving the old value here measured the Plummer Building beside his
    # head and produced numbers about the wrong pixels — which is how a bad
    # grade got argued about for an hour. Keep this in step with `focus` in
    # Founders.jsx and the pre-crop in founder-portraits.py.
    ('Lee',    'kendall-lee-150-500x400-1.jpg', 0.500, 'reference'),
    ('Goerss', 'stephan-goerss-150.jpg',        0.600, 'reference'),
    ('Bennet', 'kevin-bennet.jpg',              0.620, 'graded'),
    ('Oh',     'yoonbae-oh.jpg',                0.639, 'graded'),
]

TARGETS = {                     # spec s6.1 / s6.3 and s7
    'graded':    dict(lum=114.0, rb=1.40, gb=1.09),
    'reference': dict(lum=142.0, rb=1.45, gb=None),
}
SKIN_A, SKIN_B = 11.05, 10.35   # spec s6.7, the Lee+Goerss mean


def srgb2lab(a):
    a = a / 255.0
    lin = np.where(a <= .04045, a / 12.92, ((a + .055) / 1.055) ** 2.4)
    M = np.array([[.4124, .3576, .1805], [.2126, .7152, .0722], [.0193, .1192, .9505]])
    xyz = lin @ M.T / np.array([.95047, 1., 1.08883])
    f = np.where(xyz > .008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]),
                     200 * (f[..., 1] - f[..., 2])], -1)


def measure(path, facex):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im, dtype=np.float32)
    H, W, _ = a.shape

    # The card shows the full height and keeps 64% of the width (spec s5).
    keep = 0.64
    left = float(np.clip(facex - keep / 2, 0, 1 - keep))
    card = a[:, int(left * W):int((left + keep) * W)]
    Hc, Wc, _ = card.shape
    fx_card = (facex - left) / keep

    box = card[int(.12 * Hc):int(.45 * Hc),
               int(max(0, fx_card - .075) * Wc):int(min(1, fx_card + .075) * Wc)]

    lum = 0.2126 * box[..., 0] + 0.7152 * box[..., 1] + 0.0722 * box[..., 2]
    m = (lum > 25) & (lum < 220)          # skip the blown window and the black suit
    if m.sum() < 50:
        return None
    R, G, B = [box[..., i][m].mean() for i in range(3)]

    lab = srgb2lab(box)
    sel = m & (lab[..., 0] > 25) & (lab[..., 0] < 92) & (lab[..., 1] > 2)
    aa = lab[..., 1][sel].mean() if sel.sum() > 50 else float('nan')
    bb = lab[..., 2][sel].mean() if sel.sum() > 50 else float('nan')

    # The background, measured separately. Spec s6.8 tracks it as its own
    # quantity - Bennet's read a* -7.1 / b* -6.2 against roughly -4.4 / -1.6 for
    # the others, and that gap is why he alone is de-blued. It is a real
    # difference a viewer sees as the Plummer Building being a different colour
    # from card to card, so it has to be measured, not assumed to follow skin.
    #
    # Sampled from the strip beside the head - left of the face box, upper half -
    # which on all four is window and building rather than suit or skin. The
    # blown window itself is excluded by the luminance gate.
    bg = card[int(.10 * Hc):int(.55 * Hc), 0:int(max(.04, fx_card - .16) * Wc)]
    blum = 0.2126 * bg[..., 0] + 0.7152 * bg[..., 1] + 0.0722 * bg[..., 2]
    bm = (blum > 40) & (blum < 245)
    blab = srgb2lab(bg)
    ba = blab[..., 1][bm].mean() if bm.sum() > 50 else float('nan')
    bb_ = blab[..., 2][bm].mean() if bm.sum() > 50 else float('nan')
    bL = blab[..., 0][bm].mean() if bm.sum() > 50 else float('nan')

    return dict(lum=lum[m].mean(), rb=R / max(B, 1e-6), gb=G / max(B, 1e-6),
                a=aa, b=bb, chroma=float(np.hypot(aa, bb)), size=im.size,
                bgL=bL, bga=ba, bgb=bb_)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--extra', action='append', default=[],
                    help='name=path[,faceX] to measure an extra file alongside')
    args = ap.parse_args()

    rows = [(n, os.path.join(PUBLIC, f), fx, k) for n, f, fx, k in SUBJECTS]
    for e in args.extra:
        name, _, rest = e.partition('=')
        path, _, fx = rest.partition(',')
        rows.append((name, path, float(fx) if fx else 0.50, 'graded'))

    print(f"\n{'subject':<16}{'size':>11}{'face lum':>10}{'target':>8}"
          f"{'R/B':>7}{'target':>8}{'G/B':>7}{'skin a*':>9}{'b*':>7}{'chroma':>8}"
          f"{'bg L*':>8}{'bg a*':>7}{'bg b*':>7}")
    print('-' * 113)
    for name, path, fx, kind in rows:
        if not os.path.exists(path):
            print(f'{name:<16}  MISSING {path}'); continue
        m = measure(path, fx)
        if not m:
            print(f'{name:<16}  could not find enough skin'); continue
        t = TARGETS[kind]
        d = m['lum'] - t['lum']
        flag = '  <-- ' + ('too dark' if d < -8 else 'too bright' if d > 8 else '') if abs(d) > 8 else ''
        print(f"{name:<16}{m['size'][0]}x{m['size'][1]:<6}{m['lum']:>10.1f}{t['lum']:>8.0f}"
              f"{m['rb']:>7.2f}{t['rb']:>8.2f}{m['gb']:>7.2f}"
              f"{m['a']:>9.1f}{m['b']:>7.1f}{m['chroma']:>8.1f}"
              f"{m['bgL']:>8.1f}{m['bga']:>7.1f}{m['bgb']:>7.1f}{flag}")
    print(f"\n  skin targets from spec s6.7: a* {SKIN_A}, b* {SKIN_B}")
    print('  reference pair (Lee, Goerss) target lum 142 / R/B 1.45 — spec s7:')
    print('  "They are the reference; do not grade them toward the other two."\n')
    return 0


if __name__ == '__main__':
    sys.exit(main())
