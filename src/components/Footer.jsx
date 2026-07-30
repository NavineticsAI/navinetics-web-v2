import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { products } from '../data/products.js';
import { IsoMark } from '../ui/Reticle.jsx';

const columns = [
  {
    title: 'What We Do',
    links: products.map((p) => ({ label: p.shortName, to: p.path })),
  },
  {
    title: 'Who We Are',
    links: [
      { label: 'About NaviNetics', to: '/who-we-are' },
      { label: 'Our Founders', to: '/who-we-are/our-founders' },
      { label: 'Community', to: '/who-we-are/community' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Education', to: '/resources/education' },
      { label: 'Publications', to: '/resources/publications' },
      { label: 'Careers', to: '/careers' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-nn-950 px-6 pb-10 pt-20 text-nn-50 lg:px-8">
      <IsoMark
        className="absolute -right-20 -top-24 w-80 text-nn-300 opacity-[0.12]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="text-2xl font-semibold tracking-[-0.03em]">
              Navi<span className="text-sg-300">Netics</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-nn-200">
              NaviNetics strives to make medical devices that change people's lives — by listening to
              the patient and the physician, and translating those conversations into safe,
              effective, high-quality devices.
            </p>
            <p className="mt-4 eyebrow text-sg-300">
              Quality and simplicity, in everything we do
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="eyebrow text-nn-300">{col.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-nn-100 transition-colors duration-100 hover:text-sg-300"
                    >
                      {l.label}
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
            © 2021–{new Date().getFullYear()} NaviNetics · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
