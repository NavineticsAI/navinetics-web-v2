import { usePageMeta } from '../lib/meta.js';
import { Button, Hero, Reveal, Section, StatTile } from '../ui/index.js';

const facts = [
  { label: 'Location', value: 'Rochester', unit: 'Southeast Minnesota' },
  { label: 'To the Twin Cities', value: '~1 hr', unit: 'by road' },
  { label: 'Neighbourhood', value: 'Downtown', unit: '206 S Broadway' },
];

export default function Community() {
  usePageMeta({
    title: 'Community',
    description:
      'NaviNetics is based in the heart of downtown Rochester, Minnesota — a community that fosters innovation and supports medical advancement.',
  });

  return (
    <>
      <Hero
        eyebrow="Who we are — Community"
        title="Rochester, Minnesota."
        lead="NaviNetics is located in southeast Minnesota, in the heart of downtown Rochester — consistently voted one of the best places to live, with growing arts and entertainment and an hour's drive to the Twin Cities."
      />

      <Section wide>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <div className="flex flex-col gap-5 leading-relaxed text-ink-2">
              <p className="max-w-prose">
                We are proud to be part of a vibrant community that fosters innovation and supports
                medical advancements — and to be neighbours to one of the world's leading medical
                centres.
              </p>
              <p className="max-w-prose">
                It is not incidental to the work. Proximity to clinicians is what lets us design by
                listening, and it is why the company exists here rather than anywhere else.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {facts.map((f) => (
                <StatTile key={f.label} {...f} />
              ))}
            </div>

            <Button
              href="https://homeia.com/city-living-guide/what-is-it-like-to-live-in-rochester-mn/"
              variant="secondary"
              className="mt-8"
              arrow
            >
              Learn more about Rochester
            </Button>
          </Reveal>

          <Reveal delay={0.08}>
            {/*
              TODO — asset licence. This image is hotlinked from Unsplash's CDN:
              an uncontrolled third-party dependency on a page NaviNetics owns.
              Replace with a local asset with a licence on file. Tracked in
              /design-language-info/07-accessibility.md (Known gaps).
            */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl shadow-e3">
              <img
                src="https://images.unsplash.com/photo-1579720313437-14283ce2f036?auto=format&fit=crop&q=80&w=800&h=1000"
                alt="Downtown Rochester, Minnesota"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-nn-950/55 to-transparent"
                aria-hidden="true"
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
