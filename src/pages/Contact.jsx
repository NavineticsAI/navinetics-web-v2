import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { usePageMeta } from '../lib/meta.js';
import { Button, Field, Hero, Reveal, Section, Switch } from '../ui/index.js';

/**
 * Where the form posts.
 *
 * Set VITE_CONTACT_ENDPOINT to a form handler that accepts a JSON POST —
 * Formspree, Netlify Forms and a small serverless function all do, and all
 * work from a static GitHub Pages host. In CI set it as a repository variable
 * and expose it to the build step.
 *
 * When it is unset the form does NOT pretend to send. It hands the message to
 * the visitor's mail client with everything they typed already in it, so the
 * words they wrote survive. The previous behavior — validate, show a success
 * panel, then admit nothing was transmitted — lost every enquiry that arrived
 * through the only conversion point on the site.
 */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || '';
const INBOX = 'info@navinetics.com';

/**
 * A device company needs the complaint path to be a route a person can find,
 * not a line in a footer. Keeping it in the same list as sales enquiries means
 * it cannot be missed and cannot be mistaken for one.
 */
const REASONS = [
  'NRSS inquiry',
  'Surgical tables inquiry',
  'Neuromodulation research',
  'Distribution and partnerships',
  'Product complaint or device issue',
  'Press and media',
  'Careers',
  'Something else',
];

const COMPLAINT = 'Product complaint or device issue';

const details = [
  { Icon: Mail, label: 'Email', value: INBOX, href: `mailto:${INBOX}` },
  { Icon: Phone, label: 'Phone', value: '+1.507.361.3570', href: 'tel:+15073613570' },
  { Icon: MapPin, label: 'Address', value: '206 S Broadway, STE 700\nRochester, MN 55904' },
];

export default function Contact() {
  usePageMeta({
    title: 'Contact',
    description:
      'Get in touch with NaviNetics about the NaviNetics Reusable Stereotactic System (NRSS), '
      + 'surgical tables, neuromodulation '
      + 'research, distribution, careers, or to report a product issue.',
  });

  /* Product pages link here with ?reason=… so the form arrives set to the
     right enquiry — "Request a quote" on the D1 page should not land a visitor
     on a generic form they have to re-classify themselves. */
  const [params] = useSearchParams();
  /* Every ?reason= value used anywhere on the site must appear here. A key that
     is missing does not fail loudly — it silently falls through to REASONS[0],
     so the partners page's "Enquire about distribution" landed a distributor on
     an NRSS enquiry form. Keys map to the REASONS list by name, not index, so
     reordering that list cannot quietly re-point them. */
  const PRESET = {
    d1: 'NRSS inquiry',
    nrss: 'NRSS inquiry',
    tables: 'Surgical tables inquiry',
    maven: 'Neuromodulation research',
    distribution: 'Distribution and partnerships',
    press: 'Press and media',
    careers: 'Careers',
    complaint: COMPLAINT,
  };
  const [form, setForm] = useState({
    name: '', email: '', organization: '',
    reason: PRESET[params.get('reason')] ?? REASONS[0],
    message: '',
  });
  const [updates, setUpdates] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | handoff | failed

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Add your name so we know who to reply to.';
    if (!form.email.trim()) next.email = 'Add an email address so we can reply.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      next.email = 'Add the part after the @ — for example hospital.org';
    if (!form.message.trim()) next.message = 'Tell us briefly what you need.';
    return next;
  };

  /** Everything typed, in a body a mail client will carry intact. */
  const mailtoHref = () => {
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.organization.trim() ? `Organization: ${form.organization}` : null,
      `Reason: ${form.reason}`,
      updates ? 'Research updates: yes, please subscribe me' : null,
      '',
      form.message,
    ].filter(Boolean).join('\n');
    return `mailto:${INBOX}?subject=${encodeURIComponent(`${form.reason} — ${form.name}`)}`
      + `&body=${encodeURIComponent(body)}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (!ENDPOINT) {
      window.location.href = mailtoHref();
      setStatus('handoff');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, updates }),
      });
      setStatus(res.ok ? 'sent' : 'failed');
    } catch {
      setStatus('failed');
    }
  };

  const isComplaint = form.reason === COMPLAINT;

  return (
    <>
      <Hero
        eyebrow="Contact"
        title="Talk to the people who built it."
        lead="We make devices by listening to patients and physicians, then translating those conversations into safe, effective, high-quality products. Start the conversation."
      />

      <Section wide>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <h2 className="text-2xl tracking-[-0.03em]">Direct</h2>
            <dl className="mt-8 flex flex-col gap-7">
              {details.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-action-soft text-action"
                    aria-hidden="true"
                  >
                    <Icon size={18} />
                  </span>
                  <div>
                    <dt className="eyebrow text-ink-3">{label}</dt>
                    <dd className="mt-1 whitespace-pre-line">
                      {href ? (
                        <a href={href} className="text-ink transition-colors hover:text-action">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            {/* A complaint route stated in plain words, separate from sales. */}
            <div className="mt-10 rounded-md border border-hairline-soft bg-surface p-5">
              <h3 className="text-sm font-semibold">Reporting a problem with a device</h3>
              <p className="mt-2 text-sm text-ink-2">
                If a NaviNetics device did not perform as expected, tell us. Choose
                “{COMPLAINT}” in the form, or email{' '}
                <a href={`mailto:${INBOX}`} className="font-semibold text-action">{INBOX}</a>{' '}
                with the device, the date, and what happened. If a patient or user has been
                harmed, contact us by phone as well so we see it the same day.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <form
              onSubmit={onSubmit}
              noValidate
              className="rounded-lg border border-hairline-soft bg-surface p-6 md:p-8"
            >
              <h2 className="text-2xl tracking-[-0.03em]">Send a message</h2>

              {status === 'sent' ? (
                <div role="status" className="mt-8 rounded-md border border-ok bg-ok-soft p-6 text-center">
                  <p className="font-semibold text-ok">Message sent.</p>
                  <p className="mt-2 text-sm text-ink-2">
                    Thank you — we read every message and will reply to {form.email}.
                  </p>
                </div>
              ) : status === 'handoff' ? (
                <div role="status" className="mt-8 rounded-md border border-ok bg-ok-soft p-6 text-center">
                  <p className="font-semibold text-ok">Your email client is opening.</p>
                  <p className="mt-2 text-sm text-ink-2">
                    Everything you wrote is in the draft — press send there. If nothing
                    opened,{' '}
                    {/* mailtoHref(), not a bare mailto: — the bare form opens an
                        EMPTY draft, so the one visitor whose mail client failed
                        to launch would lose everything they typed at exactly the
                        moment they are trying to recover it. */}
                    <a href={mailtoHref()} className="font-semibold text-action">try again</a>{' '}
                    or write to{' '}
                    <a href={`mailto:${INBOX}`} className="font-semibold text-action">{INBOX}</a>.
                    Your message is still in the form — press Back to the form below to copy it.
                  </p>
                  <Button variant="secondary" className="mt-5" onClick={() => setStatus('idle')}>
                    Back to the form
                  </Button>
                </div>
              ) : (
                <div className="mt-7 flex flex-col gap-5">
                  {status === 'failed' && (
                    <p role="alert" className="rounded-md border border-crit bg-crit-soft p-4 text-sm text-ink-2">
                      That did not send. Please email{' '}
                      <a href={mailtoHref()} className="font-semibold text-action">{INBOX}</a>{' '}
                      — your message is already in the draft.
                    </p>
                  )}

                  <Field
                    label="Full name"
                    value={form.name}
                    onChange={set('name')}
                    error={errors.name}
                    /* Placeholders are formats, never examples of a person. The
                       three here were "Dr. Jane Okafor", "jane.okafor@hospital.org"
                       and "Mayo Clinic, Department of Neurosurgery" — an invented
                       clinician with an invented address, and an affiliation this
                       company licenses from rather than belongs to. On a medical
                       device site both read as claims. */
                    placeholder="First and last name"
                    autoComplete="name"
                  />
                  <Field
                    label="Email address"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    error={errors.email}
                    placeholder="you@organization.org"
                    autoComplete="email"
                  />
                  <Field
                    label="Hospital or organization"
                    hint="Optional"
                    value={form.organization}
                    onChange={set('organization')}
                    placeholder="Hospital, clinic or company"
                    autoComplete="organization"
                  />
                  <Field as="select" label="I'm reaching out about" value={form.reason} onChange={set('reason')}>
                    {REASONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Field>

                  {isComplaint && (
                    <p className="rounded-md border border-warn bg-warn-soft p-4 text-sm text-ink-2">
                      Please include the device, the approximate date, and what happened. Do not
                      include patient names or other identifying details.
                    </p>
                  )}

                  <Field
                    as="textarea"
                    label="Message"
                    value={form.message}
                    onChange={set('message')}
                    error={errors.message}
                    rows={5}
                    placeholder="How can we help?"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <Switch
                      checked={updates}
                      onChange={setUpdates}
                      label="Send me research updates"
                    />
                    <Button type="submit" arrow disabled={status === 'sending'}>
                      {status === 'sending' ? 'Sending…' : 'Send message'}
                    </Button>
                  </div>

                  {/* Stating what happens to what they typed, where they type it. */}
                  <p className="text-xs leading-relaxed text-ink-3">
                    We use what you send here only to answer you. We do not sell it or pass it
                    to anyone outside NaviNetics.{' '}
                    {updates && 'Research updates are occasional and you can stop them from any email. '}
                    Ask us at{' '}
                    <a href={`mailto:${INBOX}`} className="underline hover:text-action">{INBOX}</a>{' '}
                    for a copy of what we hold about you, or to have it deleted.
                  </p>
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
