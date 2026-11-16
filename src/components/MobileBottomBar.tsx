import { AlertCircle, CreditCard, PhoneCall, Stethoscope } from 'lucide-react';
import type { TranslationBundle } from '../i18n/translations';

interface MobileBottomBarProps {
  t: TranslationBundle;
}

export function MobileBottomBar({ t }: MobileBottomBarProps) {
  return (
    <nav
      aria-label="Mobile Quick Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-4 items-center px-1"
    >
      <a
        href="#sos-section"
        className="flex flex-col items-center justify-center h-full text-red-700 font-semibold"
      >
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
        <span className="text-[11px] mt-0.5 whitespace-nowrap">{t.mobileNavSos}</span>
      </a>
      <a
        href="#doctor-section"
        className="flex flex-col items-center justify-center h-full text-blue-700 font-semibold"
      >
        <Stethoscope className="w-5 h-5" aria-hidden="true" />
        <span className="text-[11px] mt-0.5 whitespace-nowrap">{t.mobileNavDoctor}</span>
      </a>
      <a
        href="#medical-id-section"
        className="flex flex-col items-center justify-center h-full text-slate-700 font-medium"
      >
        <CreditCard className="w-5 h-5" aria-hidden="true" />
        <span className="text-[11px] mt-0.5 whitespace-nowrap">{t.mobileNavId}</span>
      </a>
      <a
        href="tel:108"
        className="flex flex-col items-center justify-center h-full text-red-700 font-semibold"
      >
        <PhoneCall className="w-5 h-5" aria-hidden="true" />
        <span className="text-[11px] mt-0.5 whitespace-nowrap font-mono">{t.mobileNavCall}</span>
      </a>
    </nav>
  );
}
