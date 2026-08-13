import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/meta.js';
import { getProduct } from '../data/products.js';
import { art, getModel, lineup, models, motionsOf, strengths } from '../data/orTables.js';
import * as TABLE_SCENES from '../lib/tableScenes.js';
import { Button, Hero, Reveal, Section, SectionHead } from '../ui/index.js';
import { ScienceBand } from '../ui/ScienceBand.jsx';
import { TableMotion } from '../ui/TableMotion.jsx';

const BUILDERS = { beam: TABLE_SCENES.makeBeam, envelope: TABLE_SCENES.makeEnvelope };

/**
 * Carbon Fiber Surgical Tables.
 *
 * The product record was a ComingSoon page listing five things it was waiting
 * for — photography, dimensions, load ratings, radiolucency characteristics,
 * imaging-system compatibility. Two PDFs arrived carrying four of the five, so
 * the page is built and the fifth is still stated as missing rather than
 * quietly dropped.
 *
 * The center of it is the motion explorer: pick one of the five specified
 * models and the drawing performs the motions that model's own specification
 * gives it, through the ranges it gives them. A CXR-701 offers three buttons
 * and a CXR-70S Tr offers five, because that is what the two tables say — the
 * page cannot show a tilt the brochure does not claim.
 *
 * Same policy as the MAVEN page: an image and an abstract animation beside
 * every explanation, one ground alternating light and bay, and every number
 * traceable. What is deliberately absent, including every radiolucency figure,
 * is in the claims notice in data/orTables.js.
 */
export default function SurgicalTables() {
  const product = getProduct('carbon-fiber-surgical-tables');
  const [modelId, setModelId] = useState(models[0].id);
  const model = getModel(modelId);

  usePageMeta({
    title: 'Carbon Fiber Surgical Tables',
    description:
      'Carbon-fiber operating tables for imaging-guided procedures — a range from one to six '
      + 'motions, built so the table stays out of the picture.',
  });

  return (
    <>
      <Hero
        size="lg"
        tone="dark"
        eyebrow="Products — Surgical Tables"
        title={product.tagline}
        lead="Carbon technology for clearer imaging. An imaging-guided procedure is only as good as
          what the imaging can see through, and the table is the one thing always in the way."
      >
        <img
          src={art.table}
          alt="A carbon-fiber operating table, seen from the side"
          width={1500}
          height={571}
          className="mt-10 block h-auto w-full max-w-2xl"
        />
      </Hero>

      {/* ── why carbon ─────────────────────────────────────────────────────── */}
      <ScienceBand
        builders={BUILDERS}
        scene="beam"
        ground="light"
        tone="ephys"
        eyebrow="Radiolucency"
        title={'Stay out of\nthe picture.'}
        lead="Everything between the source and the detector is in the image, whether you wanted it
          there or not. Carbon fiber is far less absorbing than the steel or aluminium a table
          would otherwise be built from, so the structure holding the patient up contributes very
          little to what comes back."
        points={[
          {
            label: 'The top is the whole argument.',
            body: 'It is the one part always between the beam and the anatomy, which is why it is '
              + 'the part made of carbon.',
          },
          {
            label: 'Lightweight, for the same reason.',
            body: 'The property that makes carbon fiber transparent to X-rays is the same one '
              + 'that makes it light: there is not much there to absorb anything.',
          },
          /* The absent radiolucency figure is no longer explained to the
             reader. Why there isn't one belongs in the claims notice in
             data/orTables.js, which is where it still is — a page should not
             narrate its own restraint. */
        ]}
        meta={[
          { label: 'Top', value: 'Carbon fiber' },
          { label: 'In the beam', value: 'Always' },
        ]}
        figure={{
          src: art.tableSide, w: 1400, h: 672,
          alt: 'A carbon-fiber table in side elevation, its top cantilevered clear of the column '
            + 'so nothing but carbon sits over the base.',
          caption: 'The top, cantilevered clear of the column',
        }}
      />

      {/* ── the interactive middle ─────────────────────────────────────────── */}
      <Section wide className="!bg-[var(--mv-bay)] text-nn-50">
        <Reveal>
          <div className="flex flex-col gap-3.5">
            <div className="h-px w-full bg-[var(--mv-rule)]" aria-hidden="true" />
            <span className="eyebrow text-sg-300">The range</span>
            <h2 className="text-d2">Five tables, and what each one can do.</h2>
            <p className="max-w-prose text-sm leading-relaxed text-nn-200">
              Pick a model and the drawing performs the motions its specification gives it, through
              the ranges it gives them. The buttons change with the table, because a one-motion
              table has one thing to show.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
          <div className="flex flex-col gap-2">
            {models.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModelId(m.id)}
                aria-pressed={m.id === modelId}
                className={`flex flex-col gap-0.5 rounded-md border px-4 py-3 text-left
                  transition-colors ${
                  m.id === modelId
                    ? 'border-sg-300 bg-white/[0.07]'
                    : 'border-[var(--mv-rule-2)] hover:border-[var(--mv-rule)]'
                }`}
              >
                <span className="font-data text-sm tracking-[0.02em] text-nn-50">{m.name}</span>
                <span className="font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
                  {m.motionCount}
                </span>
                <span className="mt-1 text-[0.8125rem] leading-snug text-nn-200">{m.role}</span>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-[var(--mv-rule-2)] bg-white/[0.03] p-6 sm:p-8">
            {/* The explorer keeps the page's light-on-dark register by sitting
                on its own pale plate — a technical drawing is ink on paper. */}
            <div className="rounded-md bg-surface p-5 text-ink sm:p-7">
              <TableMotion model={model} />
            </div>
            <Specs model={model} />
          </div>
        </div>
      </Section>

      {/* ── motion ─────────────────────────────────────────────────────────── */}
      <ScienceBand
        builders={BUILDERS}
        scene="envelope"
        ground="light"
        tone="soft"
        eyebrow="Motion"
        title={'Bring the\nanatomy to\nthe beam.'}
        lead="A C-arm is heavy, sterile-draped and awkward to reposition mid-procedure. A table that
          floats, slides and tilts lets the anatomy be brought to the beam instead — which is why
          the range runs from one motion up to six."
        points={[
          {
            label: 'Height, on every model.',
            body: 'The one motion every table in the range has, and the one the imaging chain is '
              + 'set up around.',
          },
          {
            label: 'Float is two travels at once.',
            body: 'The top moves in X and Y over the column, so a target can be centered without '
              + 'moving the patient or the arm.',
          },
          {
            label: 'Trendelenburg and lateral tilt.',
            body: 'Where a model has them, the specification states the angle each way, and the '
              + 'drawing above is limited to exactly that.',
          },
        ]}
        meta={[
          { label: 'Range', value: '1 to 6 motions' },
          { label: 'Specified here', value: '5 models' },
        ]}
        figure={{
          src: art.tableMotion, w: 1400, h: 856,
          alt: 'The same table photographed with its tilt positions ghosted over one another, '
            + 'showing the arc the top sweeps through.',
          caption: 'The tilt positions, superimposed',
        }}
      />

      {/* ── the rest of the range ──────────────────────────────────────────── */}
      <Section wide band>
        <SectionHead
          eyebrow="Also in the line-up"
          title="Premium, and made to order."
          lead="Named in the range sheet without a specification behind them, so they are named here
            the same way — and nothing is claimed about any of them."
        />
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {lineup.map((g) => (
            <Reveal key={g.group}>
              <div className="h-full rounded-lg border border-hairline-soft bg-surface p-6 md:p-7">
                <span className="eyebrow text-action">{g.group}</span>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{g.blurb}</p>
                <ul className="mt-5 flex flex-col divide-y divide-hairline-soft border-t border-hairline-soft">
                  {g.items.map((it) => (
                    <li key={it.name} className="flex flex-wrap items-baseline justify-between gap-x-6 py-2.5">
                      <span className="font-data text-sm">{it.name}</span>
                      <span className="text-[0.8125rem] text-ink-3">{it.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          {strengths.map((s) => (
            <span key={s} className="font-data text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
              {s}
            </span>
          ))}
        </Reveal>
      </Section>

      {/* ── close ──────────────────────────────────────────────────────────── */}
      <Section>
        <Reveal className="flex flex-col items-center gap-6 text-center">
          {/* This close used to be headed "What is still open" and explain
              which figures were absent from which supplier document and why.
              That is a note to NaviNetics about the state of the content, not
              something a surgeon or a purchasing manager needs — a buyer
              reading a product page wants to know what to do next. The
              discipline it recorded is real and still holds; it belongs in the
              claims notice in data/orTables.js, which is where it now lives
              alone. */}
          <span className="eyebrow text-action">Next step</span>
          <h2 className="text-d2">Find the table for your room.</h2>
          <p className="max-w-prose text-lead leading-[1.55] text-ink-2">
            Five models, each specified for a different procedure and imaging setup. Tell us
            the room and the workload and we will point you to the right one.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button to="/contact?reason=tables" size="lg" arrow>
              Request a quote
            </Button>
            <Button to="/company/partners" size="lg" variant="secondary">
              Where they come from
            </Button>
          </div>
          <p className="mt-4 max-w-prose text-[0.8125rem] leading-relaxed text-ink-3">
            Built by our Korean subsidiary — see{' '}
            <Link to="/company/partners" className="text-action underline-offset-4 hover:underline">
              NaviNetics Asia
            </Link>
            .
          </p>
        </Reveal>
      </Section>
    </>
  );
}

/** The selected model's specification, as the brochure gives it. */
function Specs({ model }) {
  const rows = [
    ['Table top', `${model.top.w} × ${model.top.d} mm`],
    ...motionsOf(model).map((m) => [m.label, m.value]),
    ['Table weight', `${model.weight} kg`],
    ['Load capacity', `${model.load} kg`],
    ['Mattress', model.mattress],
    ['Control', model.control],
  ];
  return (
    <div className="mt-7">
      <dl className="grid gap-x-8 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-baseline justify-between gap-4 border-b border-[var(--mv-rule-2)] py-2.5"
          >
            <dt className="text-[0.8125rem] text-nn-200">{k}</dt>
            <dd className="font-data text-[0.8125rem] tabular-nums text-nn-50">{v}</dd>
          </div>
        ))}
      </dl>
      {model.conflict && (
        <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-3">
          <b className="font-semibold text-nn-200">One figure to confirm. </b>
          {model.conflict.note} The specification table is what is shown above.
        </p>
      )}
    </div>
  );
}
