import { Cross, Globe } from 'lucide-react';
import type { Language } from '../types';
import type { TranslationBundle } from '../i18n/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeView: 'home' | 'admin';
  onNavigateView: (view: 'home' | 'admin', sectionId?: string) => void;
  t: TranslationBundle;
}

export function Header({
  language,
  onLanguageChange,
  activeView,
  onNavigateView,
  t,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-14 bg-red-700 text-white border-b border-red-800">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8">
        <button
          type="button"
          onClick={() => onNavigateView('home', 'sos-section')}
          className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
        >
          <span className="w-7 h-7 rounded-lg bg-white text-red-700 flex items-center justify-center shrink-0">
            <Cross className="w-4 h-4 stroke-[2.75]" aria-hidden="true" />
          </span>
          <span>Doctor Dubang</span>
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-red-100">
          <button
            type="button"
            onClick={() => onNavigateView('home', 'sos-section')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'home' ? 'text-white underline underline-offset-4' : ''
            }`}
          >
            {t.navSos}
          </button>
          <button
            type="button"
            onClick={() => onNavigateView('home', 'hospitals-section')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.navHospitals}
          </button>
          <button
            type="button"
            onClick={() => onNavigateView('home', 'doctor-section')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.navDoctor}
          </button>
          <button
            type="button"
            onClick={() => onNavigateView('home', 'medical-id-section')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.navMedicalId}
          </button>
          <button
            type="button"
            onClick={() => onNavigateView('admin')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'admin' ? 'text-white underline underline-offset-4' : ''
            }`}
          >
            {t.navAdmin}
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Globe className="w-4 h-4 text-red-100 hidden sm:block shrink-0" aria-hidden="true" />
          <label htmlFor="langSelect" className="sr-only">
            Language
          </label>
          <select
            id="langSelect"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="min-h-[40px] bg-red-800 hover:bg-red-900 text-white text-sm font-medium rounded-lg px-3 py-1.5 border border-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
          >
            <option value="gu">ગુજરાતી (Gujarati)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="en">English (Global)</option>
            <option value="es">Español (Spanish)</option>
          </select>
        </div>
      </div>
    </header>
  );
}
