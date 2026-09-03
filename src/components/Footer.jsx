import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { nav } from '../data/nav.js';
import { IsoMark } from '../ui/Reticle.jsx';
import { Logo } from '../ui/Logo.jsx';
import { ReviewStamp } from '../ui/ReviewStamp.jsx';

/**
 * Footer columns mirror the navbar, both read from data/nav.js — so a new page
 * appears in the footer without a second edit.
 */
export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-nn-950 px-6 pb-10 pt-20 text-nn-50 lg:px-8">
      <IsoMark
        className="absolute -right-20 -top-24 w-80 text-nn-300 opacity-[0.12]"
        aria-hidden="true"
      />

      <div className="nn-frame relative mx-auto">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div>
            {/* The lockup, not a typographic stand-in — this used to be
                "Navi<span>Netics</span>" set in the body face. `reversed`
                because the footer band is near-black in BOTH themes, so the
                master artwork (deep navy) would be unreadable here. */}
            <Logo height={30} reversed />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-nn-200">
              NaviNetics strives to make medical devices that change people's lives — by listening to
              the patient and the physician, and translating those conversations into safe,
              effective, high-quality devices.
            </p>
            <p className="mt-4 eyebrow text-sg-300">
              Quality and simplicity, in everything we do
            </p>
            {/* The legal entity. navinetics.com named two — NaviNetics, Inc.
                and NaviNetics NeuroModulation, Inc. — but they have since
                merged, and NaviNetics, Inc. is now the single entity. A device
                company's site should say who it is. */}
            <p className="mt-6 text-[0.8125rem] leading-relaxed text-nn-300">
              NaviNetics, Inc.<br />
              206 S Broadway, STE 700<br />
              Rochester, MN 55904, USA
            </p>
          </div>

          {nav.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="eyebrow text-nn-300">{col.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.items.map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className="text-sm text-nn-100 transition-colors duration-100 hover:text-sg-300"
                    >
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 text-sm text-nn-200 sm:flex-row sm:gap-7">
            <a
              href="tel:+15073613570"
              className="flex items-center gap-2 transition-colors hover:text-sg-300"
            >
              <Phone size={14} aria-hidden="true" />
              <span className="font-data">+1.507.361.3570</span>
            </a>
            <a
              href="mailto:info@navinetics.com"
              className="flex items-center gap-2 transition-colors hover:text-sg-300"
            >
              <Mail size={14} aria-hidden="true" />
              info@navinetics.com
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={14} aria-hidden="true" />
              206 S Broadway, STE 700, Rochester, MN 55904
            </span>
          </div>
          <p className="font-data text-[0.6875rem] text-nn-300">
            © 2021–{new Date().getFullYear()} NaviNetics, Inc. · All rights reserved
          </p>
        </div>

        {/* Only ever true under `npm run build:review`. On the public site
            this folds to false and the component is dropped from the bundle
            entirely — verified by grepping dist for its class name. */}
        {import.meta.env.VITE_REVIEW_STAMP === '1' && <ReviewStamp />}
      </div>
    </footer>
  );
}
