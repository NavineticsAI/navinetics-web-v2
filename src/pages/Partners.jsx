import { useCallback, useEffect, useRef, useState } from 'react';
import { usePageMeta } from '../lib/meta.js';
import { territories } from '../data/partners.js';
import { Card, Reveal, Section, TickLine } from '../ui/index.js';
import { Mark, PartnerGlobe } from '../ui/PartnerGlobe.jsx';

/**
 * Partners.
 *
 * The page answers one question — where can a system actually be delivered —
 * and the globe is the answer rather than an ornament above it. Everything the
 * globe holds is repeated as a list below, because a list is what you scan once
 * you already know which territory you want, and because a sphere you have to
 * spin is a poor way to find a phone number.
 */
export default function Partners() {
  usePageMeta({
    title: 'Partners',
    description:
      'The distribution partners and subsidiaries that bring NaviNetics systems to operating '
      + 'rooms in the United States, South America, Greater China, Australia and South Korea.',
  });

  const [selected, setSelected] = useState(null);
  const stageRef = useRef(null);
  const active = territories.find((t) => t.id === selected) ?? null;

  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, close]);

  const pickFromList = (id) => {
    setSelected(id);
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      {/* Deliberately shorter than the site's usual hero: the globe is the
          argument this page makes, and a full-height opener pushes it under
          the fold on a laptop. */}
      {/* pt-36 matches Hero — it is what clears the fixed navbar. The bottom
          padding is what is cut, not the top. */}
      <section className="px-6 pb-10 pt-36 lg:px-8 lg:pb-12">
        <div className="mx-auto max-w-7xl">
          <TickLine className="max-w-[120px]" />
          <span className="eyebrow mt-3.5 block text-action">Company — Partners</span>
          <h1 className="mt-3.5 text-[clamp(2.35rem,5vw,3.9rem)]">Our global presence.</h1>
          <p className="mt-4 max-w-prose text-lead leading-[1.55] tracking-[-0.015em] text-ink-2">
            The organisations we work with, and the territories they cover.
          </p>
        </div>
      </section>

      <section className="px-6 pb-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* The container is dark in both themes, like the globe inside it.
              A lit sphere needs a room to be lit in, and the pale version put
              five territory colours against a near-white ocean where the
              weakest pair fell to 3.6 contrast. */}
          <div className="overflow-hidden rounded-lg border border-[rgb(130_186_217/0.14)]
            bg-[radial-gradient(120%_90%_at_50%_8%,#0a2c40,var(--globe-bay)_70%)]">
            <div
              ref={stageRef}
              className="relative aspect-[16/13] min-h-[560px] w-full lg:aspect-[16/7.6]"
            >
              <PartnerGlobe
                territories={territories}
                selected={selected}
                onSelect={setSelected}
              />
              <Panel territory={active} onClose={close} />
            </div>
          </div>
        </div>
      </section>

      {/* No section head. The cards say what they are, and a heading over them
          only restated the globe above. */}
      <Section wide className="pt-12 lg:pt-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {territories.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05}>
              <Card
                as="button"
                lift
                onClick={() => pickFromList(t.id)}
                className={`flex h-full w-full flex-col gap-3 text-left
                  ${selected === t.id ? '!border-action' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <Mark org={t.orgs[0]} h={20} />
                  <span className="eyebrow text-ink-3">{t.orgs[0].role}</span>
                </div>
                <h3 className="text-lg tracking-[-0.03em]">{t.label}</h3>
                <p className="text-sm leading-relaxed text-ink-2">{t.summary}</p>
                <Coverage cover={t.cover.slice(0, 3)} extra={t.cover.length - 3} className="mt-auto pt-1" />
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}

/** Country chips. A filled one is a primary market, an outlined one secondary. */
function Coverage({ cover, extra = 0, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {cover.map(([name, strength]) => (
        <span
          key={name}
          className={`rounded-instr px-1.5 py-0.5 font-data text-[0.625rem] tracking-[0.08em]
            ${strength === 1
              ? 'bg-action-soft text-action'
              : 'border border-hairline text-ink-2'}`}
        >
          {name}
        </span>
      ))}
      {extra > 0 && (
        <span className="rounded-instr border border-hairline px-1.5 py-0.5 font-data
          text-[0.625rem] tracking-[0.08em] text-ink-2">
          {`+${extra}`}
        </span>
      )}
    </div>
  );
}

/**
 * The detail panel. A card beside the globe on a wide screen, a sheet over the
 * bottom of it on a narrow one — where the globe slides up to meet it.
 */
function Panel({ territory, onClose }) {
  return (
    <div
      role="dialog"
      aria-label="Partner detail"
      aria-hidden={!territory}
      className={`absolute inset-x-3 bottom-3 z-10 flex max-h-[50%] flex-col rounded-md border
        border-hairline bg-surface shadow-e3 transition-[opacity,transform] duration-300
        ease-[cubic-bezier(.16,1,.3,1)] lg:inset-y-5 lg:left-auto lg:right-5 lg:max-h-none
        lg:w-[min(23rem,42%)]
        ${territory
          ? 'pointer-events-auto translate-y-0 opacity-100 lg:translate-x-0'
          : 'pointer-events-none translate-y-3.5 opacity-0 lg:translate-x-3.5 lg:translate-y-0'}`}
    >
      {territory && (
        <>
          <div className="flex items-start justify-between gap-3 border-b border-hairline-soft px-5 py-4">
            <div>
              <span className="eyebrow text-action">{territory.label}</span>
              <h2 className="mt-1.5 text-xl tracking-[-0.03em]">{territory.summary}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 shrink-0 p-1 text-lg leading-none text-ink-3 hover:text-ink"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-5 overflow-auto px-5 pb-6 pt-4">
            {territory.orgs.map((org, i) => (
              <div key={org.name} className="flex flex-col gap-2.5">
                {i > 0 && <div className="-mt-2.5 mb-1 h-px bg-hairline-soft" />}
                <div className="flex items-center gap-3">
                  <Mark org={org} h={22} />
                  <div>
                    <div className="eyebrow text-action">{org.role}</div>
                    <h3 className="text-base tracking-[-0.02em]">{org.name}</h3>
                  </div>
                </div>
                <p className="text-[0.8125rem] leading-relaxed text-ink-2">{org.body}</p>
              </div>
            ))}

            <div className="h-px bg-hairline-soft" />
            <div>
              <span className="eyebrow text-ink-3">Coverage</span>
              <Coverage cover={territory.cover} className="mt-2.5" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
