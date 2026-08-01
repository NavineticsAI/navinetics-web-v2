import { usePageMeta } from '../lib/meta.js';
import { getTechnology } from '../data/technology.js';
import { Badge, Reveal, Section, SectionHead } from '../ui/index.js';
// Not from the barrel — see the note there. These imports are what keep the
// volume renderer and the scene generators out of the main bundle.
import { BrainHero } from '../ui/BrainHero.jsx';
import { DemoLauncher } from '../ui/DemoLauncher.jsx';
import { NextSection } from '../ui/NextSection.jsx';
import { FEATURE_BANDS, SceneBand } from '../ui/SceneBand.jsx';

/**
 * NaviNetics AI — stereotactic navigation software.
 *
 * This page has its own route rather than going through the Technology
 * template, because its hero IS the software: the planning workspace runs
 * full-bleed behind the headline and docks into a screen as you scroll.
 *
 * Everything shown is a simulation over a generated head. That is stated on
 * the page, not just in a comment — a visitor should never be left thinking
 * they are looking at a patient, or at a claim about the product.
 */
export default function NaviNeticsAI() {
  const tech = getTechnology('navinetics-ai');

  usePageMeta({
    title: 'NaviNetics AI',
    description:
      'Stereotactic navigation software in development. Try a simulation of the planning workspace, running on a generated head.',
  });

  return (
    <>
      {/* Every claim here is checked against the application source rather
          than written to sound right. It is a planning workstation, not
          navigation — there is no intraoperative tracking in it. The planning
          panel's own fields are X/Y/Z in 0.1 mm steps and Collar/Arc in 1°
          steps, and each plan carries Stereo and AC-PC tabs, which is where
          "one target, two coordinate systems" comes from. */}
      <BrainHero
        eyebrow="Technology — Software"
        title={'Stereotaxis, revolutionised.\nPrecision, made easier.'}
        lead="A desktop workstation for stereotactic neurosurgical planning. Fuse the series,
          find the localiser, set the target — and read back the arc, the collar and the depth
          the frame has to be set to."
        facts={[
          // Together these are a complete stereotactic setting: three to
          // position, two to aim, one to advance.
          { label: 'Three linear axes', value: 'X Y Z' },
          { label: 'Two rotations', value: 'Collar · Arc' },
          { label: 'One depth', value: 'Entry → target' },
        ]}
      />

      {/* What it actually is, at the level a surgeon or a department reads.
          The named methods behind each of these claims are in "Underneath"
          further down — this section states the outcome, that one proves it.
          Every statement is checked against the application itself. */}
      <Section>
        <SectionHead
          eyebrow="The software"
          title="One workspace, from import to plan."
          lead="NaviNetics AI is a standalone desktop application for stereotactic neurosurgical
            planning. It covers the whole job in one place, and everything stays on the machine
            in front of you."
        />
        <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {/* Headings, not bold lead-ins. These are named strengths rather
              than the first phrase of a sentence, so running them inline left
              "Portable by design It runs on…" with nothing between the two. */}
          {SOFTWARE.map((s) => (
            <Reveal key={s.head}>
              <h3 className="text-lg tracking-[-0.025em]">{s.head}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-ink-2">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {FEATURE_BANDS.map((band) => (
        <SceneBand key={band.scene} {...band} />
      ))}

      <Section band>
        <SectionHead
          eyebrow="Where the software is"
          title="From prototype to clinical validation."
          lead="The core pipeline works today. What follows is proving it in real-world surgical conditions."
        />
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline">
          {[
            ['Complete', 'ok', 'Functional prototype built and working',
              'Fusion, registration, targeting and tractography run end to end.'],
            ['In progress', 'action', 'Validating in the real-world OR',
              'Running the pipeline under operating-room conditions rather than on archived cases. '
              + 'Benchmarking against industry-standard planning software currently shows around '
              + '0.6 mm deviation.'],
            ['Next', 'muted', 'Clinical validation studies',
              'Formal studies. No availability, performance or regulatory claim is made until they exist.'],
            /* Stated the way the repository states it. Development follows
               IEC 62304 Class C practice and the requirements and risk sets
               are maintained alongside the code, but the device master record
               is explicitly marked "not approved", the classification is not
               a controlled statement yet, and nothing has been submitted. */
            ['Planned', 'muted', 'Regulatory submission',
              'Built to IEC 62304 Class C software practice, with requirements, risk management '
              + 'and traceability maintained alongside the code. Classification and intended use '
              + 'are not yet settled, no submission has been made, and no clearance or approval '
              + 'is claimed or implied.'],
          ].map(([stage, tone, head, body]) => (
            <Reveal key={stage} className="flex flex-wrap items-start gap-5 bg-surface px-6 py-5">
              <span
                // Fixed width so the four headings start on one line rather
                // than stepping in and out with the length of each chip.
                className={`eyebrow w-[6.75rem] shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-center ${
                  tone === 'ok' ? 'bg-ok-soft text-ok'
                    : tone === 'action' ? 'bg-action-soft text-action'
                      : 'bg-hairline-soft text-ink-3'
                }`}
              >
                {stage}
              </span>
              <div className="min-w-[220px] flex-1">
                <h3 className="text-lg tracking-[-0.02em]">{head}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* One section, one place to go next.
          The demo, the enquiry and the deeper reading were three separate
          sections competing for the same moment at the end of the page. They
          are the same decision — "what now?" — so they are one block of
          buttons, and the demo opens over the page rather than by scroll. */}
      <DemoLauncher
        eyebrow="Try it yourself"
        title="A glimpse of the workspace."
        lead="Not the application — a small demonstration of it, rebuilt to run in a browser on
          generated anatomy. It covers one thing: setting a trajectory against the geometry an
          arc-centred frame imposes."
        note="Simplified stand-in · synthetic head · no patient data · makes no claim about
          performance, accuracy or regulatory status"
        actions={[
          { label: 'Ask us about it', href: 'mailto:info@navinetics.com', arrow: true },
          ...(tech?.readMore ?? []).map((r) => ({ label: r.label, to: r.to, arrow: true })),
        ]}
        about={<AboutThisDemo />}
      />

      {/* Closes the page the way the hero opened it. Says only that there is a
          next step and roughly where it sits — no method, no date, no
          capability. Anything more specific would be a claim about something
          that does not exist yet. */}
      <NextSection
        eyebrow="What comes next"
        title={'The future of stereotaxis\nis being developed here.'}
        lead="The next change is to how a patient is brought into the frame’s coordinates. It is
          in development, and there will be more to share as the work takes shape."
      />
    </>
  );
}

/* ── the software's three strengths ───────────────────────────────────────
   This is now the only place the page describes how any of it works, so each
   claim carries its own evidence rather than deferring to a section further
   down. All three are checked against the application source: the engines
   and preprocessing under backend/registration_engines and
   backend/registration_preprocess, the QA signals under
   backend/registration_qa, and the GPU policy in config.

   Deliberately absent: any accuracy figure. The repository states a ±1 mm
   placement tolerance against ASTM F2554-18, and the OR benchmark below is a
   comparative claim. Both are regulated marketing claims and need NaviNetics
   sign-off before they appear as specifications.                          */
const SOFTWARE = [
  {
    head: 'A unified, intuitive interface',
    body: 'Fusion, registration, diffusion and planning happen in one workspace — stages of the '
      + 'same application, not separate tools passing files between them. A case is a single '
      + 'bundle that reopens exactly as it was left, and plans leave as a PDF or CSV. Nothing '
      + 'is exported and re-imported between steps, and the views keep up with the gesture.',
  },
  {
    head: 'Modern fusion and registration',
    body: 'Alignment runs in stages, prepared differently for CT and for MR rather than one '
      + 'recipe for both. Every result is scored by four independent checks before it is '
      + 'accepted, and one that fails is rejected rather than quietly drawn on the anatomy. '
      + 'Transforms are kept as a chain between spaces, so every step can be checked on its own.',
  },
  {
    head: 'Portable by design',
    body: 'It runs on an ordinary Windows machine, with no cloud service and no upload — the '
      + 'study stays where it is. A GPU is used when one is present and never required, and the '
      + 'result is the same either way. The localiser’s geometry is configuration rather than '
      + 'code, so a different frame is a change to its data rather than to its software.',
  },
];

/**
 * Shown on request, from the button beside "Try it out".
 *
 * The always-visible disclosure is elsewhere: the "Synthetic dataset" chip in
 * the workstation's own title bar, and the word "simulation" in the hero lead.
 * This is the long form for anyone who wants to know exactly what they are
 * looking at.
 */
function AboutThisDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Badge tone="warn" dot>
          Simulated interface · synthetic dataset
        </Badge>
        <h2 className="text-d2">A simulation, not a scan.</h2>
        <p className="text-lead leading-[1.55] text-ink-2">
          The workspace is a real reconstruction running in your browser, driven by the same
          arc-centred geometry the frame imposes. The anatomy is not.
        </p>
      </div>

      <div className="grid gap-6 border-t border-hairline-soft pt-6 sm:grid-cols-2">
        <div>
          <h3 className="text-base tracking-[-0.025em]">What is real</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Coronal, sagittal and axial planes are re-sliced live as you move the crosshair,
            and the probe&rsquo;s-eye view is reconstructed perpendicular to the current track.
            Entry, target, collar and arc are related the way a stereotactic frame relates
            them: every trajectory passes through one focus.
          </p>
        </div>
        <div>
          <h3 className="text-base tracking-[-0.025em]">What is generated</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            The head is synthetic — ellipsoids and noise, given two tissue palettes so it can
            be shown as MR or CT. It is nobody&rsquo;s anatomy, so there is no scan to
            de-identify. The interface is a simplified stand-in for the application, and makes
            no claim about performance, accuracy or regulatory status.
          </p>
        </div>
      </div>
    </div>
  );
}
