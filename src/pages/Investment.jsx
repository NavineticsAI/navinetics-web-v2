import { usePageMeta } from '../lib/meta.js';
import { Button, Hero, Reveal, Section, StatTile, Statement } from '../ui/index.js';

/** Facts drawn from the existing public site. No financial claims. */
const facts = [
  { label: 'Entities', value: 'Two', unit: 'NaviNetics, Inc. and NaviNetics NeuroModulation, Inc.' },
  { label: 'Origin', value: 'Mayo', unit: 'Neural Engineering Laboratories' },
  { label: 'Based in', value: 'Rochester', unit: 'Minnesota, USA' },
];

export default function Investment() {
  usePageMeta({
    title: 'Investment Opportunities',
    description:
      'NaviNetics, Inc. and NaviNetics NeuroModulation, Inc. are seeking investment to further our mission to create medical devices that change lives.',
  });

  return (
    <>
      <Hero
        eyebrow="Investment"
        title="Shaping the future of neuromodulation."
        lead="NaviNetics, Inc. and NaviNetics NeuroModulation, Inc. are both seeking investment to further our mission to create medical devices that change people's lives."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          {facts.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.06}>
              <StatTile {...f} />
            </Reveal>
          ))}
        </div>

        <Statement
          className="mt-12"
          eyebrow="Register interest"
          title="Join us."
          actions={
            <>
              <Button
                href="mailto:info@navinetics.com?subject=Investment%20enquiry"
                size="lg"
                arrow
              >
                Enquire about investing
              </Button>
              <Button to="/what-we-do/navinetics-frame-system" size="lg" variant="secondary">
                See the technology
              </Button>
            </>
          }
        >
          <p>
            We invite interested investors to join us in shaping the future of neuromodulation and
            advanced stereotactic technologies. Together, we can accelerate the development of
            solutions that improve clinical outcomes and patient comfort.
          </p>
        </Statement>
      </Section>
    </>
  );
}
