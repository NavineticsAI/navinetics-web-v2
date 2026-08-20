import { usePageMeta } from '../lib/meta.js';
import { getTechnology } from '../data/technology.js';
import { Button, Reveal, Section, SectionHead } from '../ui/index.js';
// Not from the barrel — see the note there. These imports are what keep the
// volume renderer and the scene generators out of the main bundle.
import { BrainHero } from '../ui/BrainHero.jsx';
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
    /* Was "Try a simulation of the planning workspace, running on a generated
       head" — which advertised a demo this page no longer carries. It now says
       what the software is and what it does, which is also what a search
       result should say about a planning workstation. */
    description:
      'Desktop software for stereotactic neurosurgical planning: CT and MR fusion, automatic '
      + 'frame registration, AC-PC targeting and diffusion tractography in one workspace, on '
      + 'the machine in front of you.',
  });

  return (
    <>
      {/* Every claim here is checked against the application source rather
          than written to sound right. It is a planning workstation, not
          navigation — there is no intraoperative tracking in it. The planning
          panel's own fields are X/Y/Z in 0.1 mm steps and Collar/Arc in 1°
          steps, and each plan carries Stereo and AC-PC tabs, which is where
          "one target, two coordinate systems" comes from. */}
      {/* The title was "Stereotaxis, revolutionized. / Precision, made easier."
          — the most marketing sentence on the site, on the least-validated
          product, four sections above "no submission has been made, and no
          clearance is claimed". Replaced with what the software does. */}
      <BrainHero
        eyebrow="Technology — Software"
        title={'Plan the trajectory.\nIn one workspace.'}
        lead="A desktop workstation for stereotactic neurosurgical planning."
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
          title="The whole job, in one workspace."
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

      {/* AT A GLANCE, before the long-form bands.
          ─────────────────────────────────────────────────────────────────
          The three paragraphs above are the argument; the four bands below
          are the demonstration. Between them a reader had no way to see the
          scope of the thing in one screen, which is the first question a
          department asks. This is that list — short lines, scannable, no
          claim that is not already made and evidenced further down. */}
      <Section band wide>
        <SectionHead
          eyebrow="At a glance"
          title="What it does."
          lead="Every line here is expanded on further down the page."
        />
        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <Reveal key={c.head}>
              <div className="flex flex-col gap-1.5 border-t border-hairline pt-4">
                <h3 className="text-[0.9375rem] font-semibold tracking-[-0.015em]">{c.head}</h3>
                <p className="text-sm leading-relaxed text-ink-2">{c.body}</p>
              </div>
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
            /* The benchmark figure that used to close this row — "around
               0.6 mm deviation" against industry-standard planning software —
               is gone. It was a quantitative comparative claim, with no
               comparator named, no method and no n, published for software the
               row four below states has had no submission and no clearance. It
               does not come back until regulatory has signed off the number
               together with the protocol that produced it, and then it comes
               back as a cited result rather than a sentence. */
            ['In progress', 'action', 'Validating in the real-world OR',
              'Running the pipeline under operating-room conditions rather than on archived cases.'],
            ['Next', 'muted', 'Clinical validation studies',
              'Formal studies. No availability, performance or regulatory claim is made until they exist.'],
            /* The supporting detail is deliberately not on the page: the
               standard it is built to, the requirement and risk sets kept
               alongside the code, and the fact that classification and
               intended use are not yet settled. All of that is true and all
               of it is in the application repository, but a visitor reading a
               status ladder wants the status. What must stay is the last
               clause — the device master record there is explicitly marked
               "not approved" and nothing has been submitted. */
            ['Planned', 'muted', 'Regulatory submission',
              'Developed under a formal software safety process. No submission has been made, '
              + 'and no clearance is claimed.'],
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
      {/* The `note` below was: "Simplified stand-in · synthetic head · no
          patient data · makes no claim about performance, accuracy or
          regulatory status".

          The last clause went: the status ladder further up this page already
          states that no submission has been made and no clearance is claimed,
          so repeating it here read as hedging rather than as information.
          "Simplified stand-in" went too — it says nothing a reader can act on.

          What is LEFT is not boilerplate and should not be trimmed further.
          This demo looks like a working clinical planning workstation; a
          screenshot of it, passed on without context, could be taken for a
          cleared product running on a patient. Saying plainly that the head is
          generated is the one line that prevents that. */}
      {/* THE DEMO IS NOT RENDERED.
          ─────────────────────────────────────────────────────────────────
          What stood here was a DemoLauncher: a browser rebuild of the
          planning workspace on generated anatomy, with a "Synthetic head"
          note and a long disclosure panel explaining exactly what it was and
          was not. It is out at NaviNetics' request; the two ways forward it
          carried are what is left.

          Putting it back is one JSX block — ui/DemoLauncher.jsx is untouched
          and the removed markup, including the disclosure copy, is in this
          file's history. Do restore the note and the disclosure with it: the
          demo looks like a working clinical workstation, and a screenshot of
          it passed on without context could be taken for a cleared product
          running on a patient. */}
      <Section>
        <SectionHead
          eyebrow="Next"
          title="Talk to us about it."
          lead="The software is in development and not cleared for clinical use. If it is relevant
            to your department, the fastest route is a conversation."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="mailto:info@navinetics.com" size="lg" arrow>
            Ask us about it
          </Button>
          {(tech?.readMore ?? []).map((r) => (
            <Button key={r.to} to={r.to} size="lg" variant="secondary">
              {r.label}
            </Button>
          ))}
        </div>
      </Section>

      {/* Closes the page the way the hero opened it. Says only that there is a
          next step and roughly where it sits — no method, no date, no
          capability. Anything more specific would be a claim about something
          that does not exist yet. */}
      <NextSection
        eyebrow="What comes next"
        title={'The future of stereotaxis\nis being developed here.'}
        lead="The next change is to how a patient is brought into the frame’s coordinates, and
          there will be more to share as the work takes shape."
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
/* ── what it does, in one screen ───────────────────────────────────────────
   Nine lines, and not one of them is a new claim: each is the short form of
   something SOFTWARE above or FEATURE_BANDS below already states and evidences
   against the application source. If a line here cannot be traced to one of
   those, it should not be here.

   No accuracy figure, no comparison, no timing. Those are regulated marketing
   claims and are absent from this page on purpose — see the note above
   SOFTWARE and the status ladder in the page body.                        */
const CAPABILITIES = [
  {
    head: 'One workspace',
    body: 'Fusion, registration, targeting and tractography are stages of one application, not '
      + 'separate tools passing files between them.',
  },
  {
    head: 'Runs on the machine in front of you',
    body: 'An ordinary Windows desktop. No cloud service and no upload — the study stays where '
      + 'it is.',
  },
  {
    head: 'Cases reopen as they were left',
    body: 'A case is a single bundle. Plans leave as PDF or CSV.',
  },
  {
    head: 'Staged fusion',
    body: 'Alignment runs in stages, prepared differently for CT and for MR rather than one '
      + 'recipe for both.',
  },
  {
    head: 'Alignment is scored',
    body: 'Four independent checks. A result that fails is rejected rather than quietly drawn '
      + 'on the anatomy.',
  },
  {
    head: 'The frame found automatically',
    body: 'Three localizer points per plate on every slice — hundreds of fiducials across the '
      + 'stack, detected rather than picked.',
  },
  {
    head: 'AC-PC coordinates',
    body: 'The coordinate frame rotates onto the commissural line, so an offset means the same '
      + 'thing between patients.',
  },
  {
    head: 'More than one trajectory',
    body: 'Multiple plans per case, compared side by side, with clearance checked along each.',
  },
  {
    head: 'Diffusion tractography',
    body: 'Tracts reconstructed and shown against the planned approach, so it can be judged '
      + 'against what it passes.',
  },
];

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
      + 'result is the same either way. The localizer’s geometry is configuration rather than '
      + 'code, so a different frame is a change to its data rather than to its software.',
  },
];
/* AboutThisDemo stood here: the disclosure panel the demo opened, stating in
   full what the workspace was and was not. It comes back with the
   DemoLauncher, and both are one commit back in this file's history. */
