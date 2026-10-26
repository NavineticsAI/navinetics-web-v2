import { usePageMeta } from '../lib/meta.js';
import { Button, Hero, Reveal, Section } from '../ui/index.js';
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

const FACTS = [
  { k: 'Address', v: '206 S Broadway, Suite 700', note: 'Downtown Rochester, MN 55904' },
  { k: 'Region', v: 'Southeast Minnesota', note: 'Olmsted County' },
  { k: 'Minneapolis–Saint Paul', v: '80 miles / 124 km', note: 'about an hour by road' },
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
        /* NO LEAD. This read lead="." - a single full stop, rendered at
           lead type size as the page opening paragraph, which is the
           largest body text on it. It was the residue of a deleted
           sentence, not restraint. Hero guards `lead &&`, so omitting the
           prop renders nothing. */
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
            {/* NaviNetics' own Google Maps listing, on review, rather than a
                search for the street address. */}
            <Button href="https://maps.app.goo.gl/Yx3JPRkuzbwsXGiCA" variant="secondary" className="mt-8" arrow>
              Open in Maps
            </Button>
          </Reveal>
        </div>
      </Section>

      {/* The "Why here — Proximity is a design tool." section (three cards:
          clinicians down the corridor, prototypes by hand, the laboratory)
          was removed on review. */}

      {/* The "Visiting, or joining?" close is removed on NaviNetics'
          instruction, along with the assumption that a reader is coming to
          Rochester at all. Contact and Careers are both one click away in the
          nav and the footer, so nothing is lost by ending on the argument. */}
    </>
  );
}
