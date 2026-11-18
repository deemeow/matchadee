import { HelpCircle, X } from 'lucide-react';
import { CIKGU_KANCIL_IMAGE } from '../data/stories';

interface CikguKancilBannerProps {
  dialogue: string;
  subtitle?: string;
  compact?: boolean;
}

export function CikguKancilBanner({ dialogue, subtitle, compact = false }: CikguKancilBannerProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-[#E5C98B] bg-[#FFFCF4] shadow-[0_8px_22px_rgba(120,84,28,0.08)] ${
        compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'
      }`}
    >
      <div className="shrink-0 relative">
        <img
          src={CIKGU_KANCIL_IMAGE}
          alt="Maskot Cikgu Kancil"
          referrerPolicy="no-referrer"
          className={`${
            compact ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-20 h-20 sm:w-24 sm:h-24'
          } rounded-2xl object-cover border-2 border-[#E5A93B] bg-[#FAF0CD]`}
        />
      </div>
      <div className="text-center sm:text-left">
        <p className="text-xs font-bold tracking-wider text-[#9A5B13]">
          CIKGU KANCIL · Pemandu Pengembaraan
        </p>
        <p className="mt-1 text-base sm:text-lg font-bold text-[#3D2612] leading-snug">
          “{dialogue}”
        </p>
        {subtitle && (
          <p className="mt-1 text-sm text-[#6B4E31]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tips: string[];
}

export function HelpModal({ isOpen, onClose, title, tips }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2612]/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border-2 border-[#E5C27D] bg-[#FFFCF4] p-6 shadow-2xl animate-stage-burst">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={CIKGU_KANCIL_IMAGE}
              alt="Cikgu Kancil sedia membantu"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover border-2 border-[#E5A93B]"
            />
            <div>
              <p className="text-xs font-bold text-[#9A5B13] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Bantuan Cikgu Kancil
              </p>
              <h2 id="help-modal-title" className="text-xl font-bold text-[#3D2612]">
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-[#DFC792] bg-[#FFF7DF] text-[#4E341C] hover:bg-[#FCEBB6] transition-colors"
            aria-label="Tutup bantuan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-[#FAF1D4] p-4 border border-[#E5CFA0]">
          <p className="text-sm font-bold text-[#7A440E] mb-2">
            “Jangan risau, teruskan usaha kamu! Ini panduan langkah demi langkah:”
          </p>
          <ul className="space-y-2.5 text-sm text-[#4E341C] leading-relaxed">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-[#F5B82E] text-[#3A2208] font-bold text-xs inline-flex items-center justify-center tabular-nums">
                  {i + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#F5B82E] text-[#3A2208] font-bold text-sm hover:bg-[#E5A420] transition-colors whitespace-nowrap shadow-xs"
          >
            Saya Faham, Teruskan!
          </button>
        </div>
      </div>
    </div>
  );
}
