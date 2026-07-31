import { usePageMeta } from '../lib/meta.js';
import { partners, partnerKinds } from '../data/partners.js';
import { Card, ComingSoon, Hero, Reveal, Section, SectionHead } from '../ui/index.js';

export default function Partners() {
  usePageMeta({
    title: 'Partners',
    description:
      'The clinical, research, manufacturing and distribution partners NaviNetics works with.',
  });

  return (
    <>
      <Hero
        eyebrow="Company — Partners"
        title="We don't do this alone."
        lead="Medical devices reach patients through a chain of people — surgeons who tell us what's wrong, laboratories that test whether we fixed it, machinists who hold the tolerances, and distributors who get it to an operating room."
      />

      <Section wide>
        {partners.length > 0 ? (
          <>
            <SectionHead eyebrow="Who we work with" title="Partners." />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => (
                <Reveal key={p.id}>
                  <Card lift className="flex h-full flex-col gap-3">
                    <span className="eyebrow text-ink-3">{p.kind}</span>
                    <h2 className="text-xl tracking-[-0.025em]">{p.name}</h2>
                    <p className="flex-1 text-sm leading-relaxed text-ink-2">{p.blurb}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <>
            {/*
              No partners are named yet, and that is deliberate. "We came out of
              Mayo Clinic" and "Mayo Clinic is a named partner" are different
              claims — the second needs confirmation and, usually, permission to
              use another organisation's name and marks.
            */}
            <ComingSoon
              title="Partner names are pending."
              body="We work across four kinds of partnership, described below. Naming specific organisations requires their agreement, so this page stays general until that's in place."
              needs={[
                'Confirmed partner list',
                'Permission to use names and marks',
                'Logo assets at usable resolution',
                'Whether Mayo Clinic is named as a partner or only as origin',
              ]}
              action={false}
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {partnerKinds.map((k, i) => (
                <Reveal key={k.kind} delay={i * 0.05}>
                  <Card className="h-full">
                    <span className="eyebrow text-action">{k.kind}</span>
                    <p className="mt-2.5 leading-relaxed text-ink-2">{k.body}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
}
