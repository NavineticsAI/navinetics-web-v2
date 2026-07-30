import { Users, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta.js';
import { Hero, Reveal, Section, PullQuote } from '../ui/index.js';

const cards = [
  {
    to: '/who-we-are/our-founders',
    Icon: Users,
    title: 'The Visionaries',
    body: 'Meet the leaders behind NaviNetics — decades of combined experience in neurosurgery, biomedical engineering and technology development.',
    cta: 'Read their bios',
  },
  {
    to: '/who-we-are/community',
    Icon: MapPin,
    title: 'Our Community',
    body: 'Located in the heart of Downtown Rochester, MN. Learn more about the community that fosters our innovation and growth.',
    cta: 'Explore our location',
  },
];

export default function WhoWeAre() {
  usePageMeta({
    title: 'About NaviNetics',
    description:
      'NaviNetics makes medical devices that change lives, by listening to patients and physicians and translating those conversations into safe, effective devices.',
  });

  return (
    <>
      <Hero
        eyebrow="Who we are"
        title="Devices that change lives."
        lead="We strive to make medical devices that change people's lives. We do this by listening to the patient and physician, and translating these conversations into safe, effective and high-quality device offerings."
      />

      <Section>
        <Reveal>
          <PullQuote attribution="NaviNetics, Inc." detail="Rochester, MN">
            A commitment to quality and simplicity is at the forefront of everything we do.
          </PullQuote>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {cards.map(({ to, Icon, title, body, cta }, i) => (
            <Reveal key={to} delay={i * 0.06}>
              <Link
                to={to}
                className="group/wc flex h-full flex-col rounded-lg border border-hairline-soft bg-sunk p-8 transition-[transform,box-shadow,border-color] duration-[420ms] ease-out hover:-translate-y-1 hover:border-hairline hover:shadow-e2 md:p-10"
              >
                <div className="grid h-14 w-14 place-items-center rounded-md bg-surface text-action shadow-e1 transition-transform duration-500 group-hover/wc:scale-110">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h2 className="mt-8 text-2xl tracking-[-0.03em]">{title}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-ink-2">{body}</p>
                {/* Plain markup, not <LinkAction> — the whole card is already
                    the link, and nesting an <a> inside an <a> is invalid. */}
                <span className="mt-8 inline-flex items-center gap-1.5 font-semibold text-action">
                  {cta}
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out group-hover/wc:translate-x-1"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
