import { usePageMeta } from '../lib/meta.js';
import { Button, Card, Hero, Reveal, Section, SectionHead } from '../ui/index.js';
import { LocatorMap } from '../ui/LocatorMap.jsx';

/**
 * Community.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * The stock photograph that used to sit here was hotlinked from a third-party
 * image CDN with no license on file — an uncontrolled dependency on a page
 * NaviNetics owns, and flagged as a known gap in the design language docs. It
 * is gone. The drawn locator that replaces it is built from public-domain
 * Natural Earth borders by tools/locator-map.mjs, weighs a few kilobytes, and
 * follows the theme.
 *
 * CLAIMS NOTICE. Two figures appear on this page and both are checkable: the
 * 124 km is the great-circle distance between the two civic coordinates,
 * computed in that same tool; "about an hour by road" was already on the site.
 * Nothing about Rochester's population, rankings or economy is asserted —
 * those need a source, and the vague "consistently voted one of the best places
 * to live" that used to be in the hero has been dropped for the same reason.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Why the address matters, rather than what is nearby. */
const REASONS = [
  {
    title: 'The clinicians are down the corridor',
    body:
      'A co-founder operates at Mayo Clinic. Design input arrives as a surgeon telling you what was '
      + 'in the way this morning, not as a summary of a survey some months later.',
  },
  {
    title: 'Prototypes travel by hand',
    body:
      'A part can be machined, taken across town, held in gloved hands, criticized and changed '
      + 'again inside a week. Distance is the thing that usually stops that loop closing.',
  },
  {
    title: 'The laboratory is still here',
    body:
      /* Was "where the first reusable stereotactic system was prototyped". That
         is a priority claim, and as written a reader takes it as first anywhere
         rather than first of ours — which is the reading we cannot support.
         Naming the system says the same true thing and claims nothing. */
      'The Neural Engineering and Precision Surgery Laboratories, where the founders work and where '
      + 'the NRSS was prototyped, are in the same city.',
  },
];

const FACTS = [
  { k: 'Address', v: '206 S Broadway, Suite 700', note: 'Downtown Rochester, MN 55904' },
  { k: 'Region', v: 'Southeast Minnesota', note: 'Olmsted County' },
  { k: 'Minneapolis–Saint Paul', v: '124 km', note: 'about an hour by road' },
];

export default function Community() {
  usePageMeta({
    title: 'Community',
    description:
      'NaviNetics is based in downtown Rochester, Minnesota — next door to the clinicians the '
      + 'devices are designed with.',
  });

  return (
    <>
      <Hero
        eyebrow="Company — Community"
        title="Rochester, Minnesota."
        lead="We are in the middle of downtown Rochester, in southeast Minnesota. The address is why the design loop closes as fast as it does."
      />

      <Section wide className="!pt-0">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
          <Reveal>
            <LocatorMap />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex flex-col divide-y divide-hairline-soft border-y border-hairline-soft">
              {FACTS.map((f) => (
                <div key={f.k} className="flex items-baseline justify-between gap-6 py-4">
                  <span className="eyebrow shrink-0 text-ink-3">{f.k}</span>
                  <span className="text-right">
                    <span className="block text-sm font-semibold">{f.v}</span>
                    <span className="block text-xs text-ink-3">{f.note}</span>
                  </span>
                </div>
              ))}
            </div>
            <Button href="https://maps.google.com/?q=206+S+Broadway+Ave+Suite+700,+Rochester,+MN+55904" variant="secondary" className="mt-8" arrow>
              Open in Maps
            </Button>
          </Reveal>
        </div>
      </Section>

      <Section wide band>
        <SectionHead
          eyebrow="Why here"
          title="Proximity is a design tool."
          lead="Being a short walk from the operating theater changes what can be asked, and how
            quickly it can be answered."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.06}>
              {/* No 01/02/03 markers. These three reasons are not a sequence —
                  numbering implied an order the content does not have. */}
              <Card className="flex h-full flex-col gap-3">
                <h3 className="text-lg tracking-[-0.03em]">{r.title}</h3>
                <p className="text-sm leading-relaxed text-ink-2">{r.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* The "Visiting, or joining?" close is removed on NaviNetics'
          instruction, along with the assumption that a reader is coming to
          Rochester at all. Contact and Careers are both one click away in the
          nav and the footer, so nothing is lost by ending on the argument. */}
    </>
  );
}
