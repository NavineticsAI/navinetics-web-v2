import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { usePageMeta } from '../lib/meta.js';
import { Button, Field, Hero, Reveal, Section, Switch } from '../ui/index.js';

const REASONS = [
  'Frame System enquiry',
  'Neuromodulation research',
  'Careers',
  'Something else',
];

const details = [
  { Icon: Mail, label: 'Email', value: 'info@navinetics.com', href: 'mailto:info@navinetics.com' },
  { Icon: Phone, label: 'Phone', value: '+1.507.361.3570', href: 'tel:+15073613570' },
  { Icon: MapPin, label: 'Address', value: '206 S Broadway, STE 700\nRochester, MN 55904' },
];

export default function Contact() {
  usePageMeta({
    title: 'Contact',
    description:
      'Get in touch with NaviNetics about the Frame System, neuromodulation research or careers.',
  });

  const [form, setForm] = useState({ name: '', email: '', reason: REASONS[0], message: '' });
  const [updates, setUpdates] = useState(false);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

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

  const onSubmit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    // NOTE: no backend yet. States are wired; submission is a stub.
    if (Object.keys(next).length === 0) setSent(true);
  };

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
          </Reveal>

          <Reveal delay={0.08}>
            <form
              onSubmit={onSubmit}
              noValidate
              className="rounded-lg border border-hairline-soft bg-surface p-6 md:p-8"
            >
              <h2 className="text-2xl tracking-[-0.03em]">Send a message</h2>

              {sent ? (
                <div
                  role="status"
                  className="mt-8 rounded-md border border-ok bg-ok-soft p-6 text-center"
                >
                  <p className="font-semibold text-ok">Message ready to send.</p>
                  <p className="mt-2 text-sm text-ink-2">
                    This form has no backend yet, so nothing was transmitted. Email{' '}
                    <a href="mailto:info@navinetics.com" className="font-semibold text-action">
                      info@navinetics.com
                    </a>{' '}
                    directly in the meantime.
                  </p>
                  <Button variant="secondary" className="mt-5" onClick={() => setSent(false)}>
                    Edit message
                  </Button>
                </div>
              ) : (
                <div className="mt-7 flex flex-col gap-5">
                  <Field
                    label="Full name"
                    value={form.name}
                    onChange={set('name')}
                    error={errors.name}
                    placeholder="Dr. Jane Okafor"
                    autoComplete="name"
                  />
                  <Field
                    label="Email address"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    error={errors.email}
                    placeholder="jane.okafor@hospital.org"
                    autoComplete="email"
                  />
                  <Field as="select" label="I'm reaching out about" value={form.reason} onChange={set('reason')}>
                    {REASONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Field>
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
                    <Button type="submit" arrow>
                      Send message
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
