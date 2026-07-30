export default function Footer() {
  return (
    <footer className="py-16 bg-brand-midnight text-center">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-2xl font-bold tracking-tight text-white mb-6">
          Navi<span className="text-brand-light">Netics</span>
        </div>
        <p className="text-gray-300 text-sm max-w-2xl mx-auto mb-6">
          NaviNetics strives to make medical devices that change people's lives. We do this by listening to the patient and physician and translate these conversations into safe, effective and high-quality device offerings. A commitment to quality and simplicity is at the forefront of everything we do.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-gray-300 text-sm mb-12">
          <a href="tel:+1.5073613570" className="hover:text-brand-light transition-colors flex items-center gap-2">
            <span>+1.507.361.3570</span>
          </a>
          <a href="mailto:info@navinetics.com" className="hover:text-brand-light transition-colors flex items-center gap-2">
            <span>info@navinetics.com</span>
          </a>
          <span className="flex items-center gap-2">
            <span>206 S Broadway | STE 700 | Rochester, MN 55904</span>
          </span>
        </div>
        <div className="border-t border-white/10 pt-8 mt-8 text-gray-400 text-xs">
          © Copyright 2021 - {new Date().getFullYear()} • NaviNetics • All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
