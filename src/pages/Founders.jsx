import { asset } from '../lib/asset.js';
import { usePageMeta } from '../lib/meta.js';
import { Button, Hero, Reveal, Section } from '../ui/index.js';

/**
 * `focus` is the CSS object-position for the portrait.
 *
 * Every portrait is a landscape frame shown in a 4:5 box, so the browser keeps
 * the full height and crops the sides — and all four subjects sit right of
 * center in their originals, which without this puts each face against the
 * right edge of the card. Moving the crop window is what centers them.
 *
 * It is deliberately not done by cropping to centre each face. The four are
 * cropped for EQUAL HEAD SIZE — measured in the sources, heads ran 384px to
 * 523px, so a shared crop would have put one three-quarter portrait beside
 * three head-and-shoulders ones. Size is matched in the file; horizontal
 * centring happens here.
 *
 * The vertical half stays at 0% — see object-top on the <img>. Percentages are
 * (face − 32) / 36, which is where a 64%-wide window has to start to put the
 * face at its center.
 */
const founders = [
  {
    name: 'Kendall H. Lee, M.D., Ph.D.',
    /* Their title at NaviNetics. The "Co-Director" further down each bio is a
       different job — the Mayo Clinic Neural Engineering and Precision Surgery Laboratories — and is
       correct as written. */
    role: 'Co-CEO & Co-Founder',
    image: asset('/kendall-lee-150-500x400-1.jpg'),
    /* All four `focus` values were recomputed on 2026-08-17, when every
       portrait was replaced by a retouched source and re-cropped for equal head
       size. Per s5 of the portrait spec, focus = (faceX - 0.32) / 0.36, and the
       faceX each one is derived from is in the JOBS table of
       tools/founder-portraits.py. Change a crop there and these must follow, or
       the card's window slides off the face. */
    focus: '56% 0%',
    bio: [
      'Dr. Lee earned his B.A. in biology with a minor in philosophy (Summa Cum Laude) from the University of Colorado at Denver. He attended Yale University Graduate School, where he received his Master of Philosophy, M.D. (Cum Laude) and Ph.D. in neurobiology. He completed an internship in internal medicine at the Hospital of St. Raphael, Yale University School of Medicine and a residency in neurology at Harvard Medical School.',
      'He further trained at Dartmouth Hitchcock Medical Center, completing an internship in general surgery and a residency and chief residency in neurosurgery. In his clinical practice, Dr. Lee is an expert on neurological disorders, seeing patients with Parkinson’s disease, Tourette’s syndrome, dystonia, and other neurodegenerative diseases.',
      'His research focuses on developing deep brain stimulation for the treatment of Parkinson’s disease, tremor, depression, obsessive-compulsive disorder and epilepsy. Dr. Lee is fascinated with the possibility of combining sophisticated electrophysiological and electrochemical recordings with miniaturized analytical elements to augment or repair disrupted function of the brain.',
      'His team was awarded the Mayo Clinic Distinguished Team Science award in 2015. He was a Commander in the US Navy Reserve and in 2013 served a 6-month deployment in Germany, using his neurosurgery skills to treat soldiers wounded in the conflict in the Middle East.',
      'Dr. Lee is a consultant in the Mayo Clinic Rochester, MN Department of Neurologic Surgery with joint appointments in the Department of Physiology and Biomedical Engineering and the Department of Physical Medicine and Rehabilitation. He holds the academic rank of professor of Neurosurgery and Biomedical Engineering, and is a co-founder of the Neural Engineering and Precision Surgery Laboratories, where he currently serves as Co-Director.',
    ],
  },
  {
    name: 'Kevin E. Bennet, MBA, Ph.D.',
    /* Their title at NaviNetics. The "Co-Director" further down each bio is a
       different job — the Mayo Clinic Neural Engineering and Precision Surgery Laboratories — and is
       correct as written. */
    role: 'Co-CEO & Co-Founder',
    image: asset('/kevin-bennet.jpg'),
    focus: '64% 0%',
    bio: [
      'Dr. Bennet has over 30 years of experience in technology development with organizations including Mayo Clinic, W.R. Grace & Co., Exxon International and Amoco Chemicals. He has been a consultant to the National Institutes of Health and served on NIH site visit teams.',
      'He holds patents concerning neurosurgery, diamond, semiconductor and optical technology and has founded several technology-based companies. He received a degree in Chemical Engineering from the Massachusetts Institute of Technology, an MBA from Harvard and his doctorate from Deakin University.',
      'Dr. Bennet joined the Mayo Clinic in 1990 with past appointments as Chair of Strategic Alliances, Vice Chair of Information Technology Architecture Subcommittee, Clinical Practice Committee Equipment Subcommittee, Pharmacy and Therapeutics Committee, and Medical/Industry Relations Committee.',
      'He is also a founder of the Mayo Clinic Neural Engineering and Precision Surgery Laboratories and currently serves as co-director. He holds additional appointments as Administrator of the Mayo Clinic Division of Engineering and Associate Professor of Neurosurgery.',
    ],
  },
  {
    name: 'Stephan J. Goerss',
    role: 'Co-Founder',
    image: asset('/stephan-goerss-150.jpg'),
    focus: '60% 0%',
    bio: [
      'Steve Goerss has 40 years of experience in designing and fabricating neurosurgical devices and stereotactic instrumentation. He has been awarded three patents with two more pending. He joined the Mayo Clinic in 1984 with the Department of Neurologic Surgery until 2016.',
      'During this time, he supported all computer-assisted neurosurgical procedures, trained neurosurgical residents in the use of this technology, and developed custom neurosurgical instruments and systems for the neurosurgical staff. He also became an Assistant Professor of the Mayo Medical School. He has authored and co-authored 51 peer reviewed papers and two book chapters.',
      'He joined the Neural Engineering and Precision Surgery Laboratories at the Mayo Clinic in 2016. During this tenure, he designed and developed a spinal stereotactic device, a relocatable porcine stereotactic headframe/stereotactic device, and the prototype version of the NaviNetics Reusable Stereotactic System now commercialized by NaviNetics.',
      'From 1986 to 1997, Mr. Goerss was a founder of COMPASS International, a computer-assisted stereotactic and medical device company, and served as President.',
    ],
  },
  {
    name: 'Yoonbae Oh, Ph.D.',
    role: 'Co-Founder',
    image: asset('/yoonbae-oh.jpg'),
    focus: '65% 0%',
    /* Short by comparison because it is only what NaviNetics has supplied: the
       three appointments, plus the publication record that is already on this
       site (see src/data/publications.js — Dr. Oh is the senior author on the
       Neurochemistry line). Nothing here is inferred. Replace with the full
       biography when it arrives; the layout takes any number of paragraphs. */
    bio: [
      'Dr. Oh is Associate Director of the Neural Engineering and Precision Surgery Laboratories at Mayo Clinic and an Associate Professor of Neurosurgery at Mayo Clinic. He also holds an appointment as Professor of Biomedical Engineering at Korea University.',
      'He is the senior author on the laboratory’s neurochemical sensing work: tracking tonic dopamine in vivo by multiple cyclic square wave voltammetry, resolving highly similar neurotransmitters using voltammetry and deep learning, and showing that deep brain stimulation alleviates tics in Tourette syndrome through striatal dopamine transmission.',
      'That line of research — measuring what the brain is doing chemically while it is being stimulated — is the science behind the NaviNetics MAVEN neurochemical sensing platform.',
    ],
  },
];

export default function Founders() {
  usePageMeta({
    title: 'Our Founders',
    description:
      'The pioneers behind NaviNetics — decades of expertise in neurosurgery, technology development and medical device innovation.',
  });

  return (
    <>
      {/* "The visionaries." was changed once, on the reading that it is the one
          self-congratulatory heading on an otherwise plain site, and restored on
          the company's instruction. It is a brand decision rather than a defect,
          and it is NaviNetics' to make. Leave it. */}
      <Hero
        eyebrow="Who we are — Our founders"
        title="The visionaries."
        lead="Decades of expertise in neurosurgery, technology development and medical device innovation, brought out of the Mayo Clinic Neural Engineering and Precision Surgery Laboratories."
      />

      <Section wide>
        <div className="flex flex-col gap-24 lg:gap-32">
          {founders.map((f, i) => (
            <Reveal
              key={f.name}
              className={`flex flex-col items-start gap-10 lg:gap-16 ${
                i % 2 ? 'lg:flex-row-reverse' : 'lg:flex-row'
              }`}
            >
              <div className="w-full lg:w-5/12">
                {/* People are not targets — no reticle on portraits. */}
                <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg shadow-e3">
                  <img
                    src={f.image}
                    alt={`Portrait of ${f.name}`}
                    loading="lazy"
                    style={{ objectPosition: f.focus }}
                    className="absolute inset-0 h-full w-full scale-105 object-cover object-top transition-transform duration-1000 ease-out hover:scale-100"
                  />
                </div>
              </div>

              <div className="w-full lg:w-7/12">
                <h2 className="text-d2">{f.name}</h2>
                <p className="mt-2 eyebrow text-action">{f.role}</p>
                <div className="mt-8 flex flex-col gap-5 leading-relaxed text-ink-2">
                  {f.bio.map((p) => (
                    <p key={p.slice(0, 32)} className="max-w-prose">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* The page ended on the last line of the last biography. Someone who has
          read four CVs has just done the work of deciding these people are real
          — which is the single most persuasive thing this site can do for a
          distributor or a surgeon — and then had nowhere to go. */}
      <Section>
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <span className="eyebrow text-action">Come and talk</span>
          <h2 className="text-d2">We would like to hear from you.</h2>
          <p className="max-w-prose text-lead leading-[1.55] text-ink-2">
            Whether you operate, run a laboratory, or cover a territory — the people above are the
            people you would be working with.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button to="/contact" size="lg" arrow>
              Get in touch
            </Button>
            <Button to="/resources/publications" size="lg" variant="secondary">
              Read the published work
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
