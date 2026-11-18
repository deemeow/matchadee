import { Award, Lock, Star } from 'lucide-react';
import { BadgeInfo } from '../types';

interface AchievementPinboardProps {
  badges: BadgeInfo[];
  earnedBadgeIds: string[];
}

// Uniform pastel paper palette mapped by word in AchievementPinboard:
// Row 1: KOLEKSI (pastel yellow) + PENCAPAIAN (pastel light blue)
// Row 2: Lencana (pastel pink) + Pengembaraan (pastel lavender) + Kamu (pastel mint green)
const WORD_COLOR_YELLOW = 'bg-[#FEF08A]';
const WORD_COLOR_SKY_BLUE = 'bg-[#BAE6FD]';
const WORD_COLOR_PINK = 'bg-[#FBCFE8]';
const WORD_COLOR_LAVENDER = 'bg-[#DDD6FE]';
const WORD_COLOR_MINT = 'bg-[#BBF7D0]';

const STICKY_NOTE_STYLES = [
  {
    bg: 'bg-[#FEF3C7]',
    border: 'border-[#FDE68A]',
    pin: 'bg-[#E11D48]',
    tilt: '-rotate-[1.3deg]',
    fold: 'border-r-[#E5C97B] border-b-[#E5C97B]'
  },
  {
    bg: 'bg-[#FCE7F3]',
    border: 'border-[#FBCFE8]',
    pin: 'bg-[#7C3AED]',
    tilt: 'rotate-[1deg]',
    fold: 'border-r-[#E6B8D2] border-b-[#E6B8D2]'
  },
  {
    bg: 'bg-[#DCFCE7]',
    border: 'border-[#BBF7D0]',
    pin: 'bg-[#D97706]',
    tilt: '-rotate-[0.8deg]',
    fold: 'border-r-[#A7E0BA] border-b-[#A7E0BA]'
  },
  {
    bg: 'bg-[#E0F2FE]',
    border: 'border-[#BAE6FD]',
    pin: 'bg-[#BE123C]',
    tilt: 'rotate-[1.2deg]',
    fold: 'border-r-[#9ED1EE] border-b-[#9ED1EE]'
  },
  {
    bg: 'bg-[#EDE9FE]',
    border: 'border-[#DDD6FE]',
    pin: 'bg-[#0D9488]',
    tilt: '-rotate-[1deg]',
    fold: 'border-r-[#C4B5FD] border-b-[#C4B5FD]'
  }
];

function getCurveDropClass(t: number): string {
  // Parabolic sag matching SVG Q-bezier curve M 8 10 Q 500 74 992 10 (0px at ends -> 32px at center)
  const sag = 4 * t * (1 - t);
  if (sag < 0.14) return 'lg:mt-0';
  if (sag < 0.28) return 'lg:mt-[5px]';
  if (sag < 0.42) return 'lg:mt-[10px]';
  if (sag < 0.56) return 'lg:mt-[15px]';
  if (sag < 0.7) return 'lg:mt-[20px]';
  if (sag < 0.84) return 'lg:mt-[25px]';
  if (sag < 0.94) return 'lg:mt-[29px]';
  return 'lg:mt-[32px]';
}

function getCurveTiltClass(t: number): string {
  if (t < 0.16) return 'lg:rotate-[5deg]';
  if (t < 0.34) return 'lg:rotate-[2.5deg]';
  if (t > 0.84) return 'lg:-rotate-[5deg]';
  if (t > 0.66) return 'lg:-rotate-[2.5deg]';
  return 'lg:rotate-0';
}

function GoldRibbonMedal({ earned, idSuffix }: { earned: boolean; idSuffix: string }) {
  return (
    <svg
      viewBox="0 0 64 82"
      className={`w-12 h-[62px] sm:w-14 sm:h-[74px] shrink-0 transition-all ${
        earned
          ? 'drop-shadow-[0_6px_8px_rgba(32,14,4,0.45)]'
          : 'opacity-65 saturate-50 blur-[0.8px] drop-shadow-[0_3px_4px_rgba(32,14,4,0.25)]'
      }`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`gold-rim-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="42%" stopColor="#F5B82E" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <linearGradient id={`gold-face-${idSuffix}`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="35%" stopColor="#FDE047" />
          <stop offset="75%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id={`ribbon-${idSuffix}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9F1239" />
          <stop offset="100%" stopColor="#580C22" />
        </linearGradient>
      </defs>

      {/* Twin dangling maroon-gold victory ribbons */}
      <path d="M21 44 L11 78 L21 71 L29 79 L32 46 Z" fill={`url(#ribbon-${idSuffix})`} stroke="#F5B82E" strokeWidth="1.2" />
      <path d="M43 44 L53 78 L43 71 L35 79 L32 46 Z" fill={`url(#ribbon-${idSuffix})`} stroke="#F5B82E" strokeWidth="1.2" />

      {/* Top connector ring */}
      <circle cx="32" cy="8" r="4.5" fill="none" stroke={`url(#gold-rim-${idSuffix})`} strokeWidth="2.8" />
      <rect x="29.2" y="10.5" width="5.6" height="5" rx="1.5" fill="#D97706" />

      {/* Outer beveled gold coin */}
      <circle cx="32" cy="34" r="20.5" fill={`url(#gold-rim-${idSuffix})`} stroke="#78350F" strokeWidth="1.2" />
      <circle cx="32" cy="34" r="16.5" fill={`url(#gold-face-${idSuffix})`} stroke="#FEF08A" strokeWidth="1" />

      {/* Specular shine arc */}
      <path d="M20 26 A14 14 0 0 1 40 22" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" />

      {/* Center victory star */}
      <path
        d="M32 21.5 L35.2 28.4 L42.8 29.4 L37.2 34.7 L38.6 42.2 L32 38.5 L25.4 42.2 L26.8 34.7 L21.2 29.4 L28.8 28.4 Z"
        fill="#FFFBEB"
        stroke="#92400E"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Cute Die-Cut Scrapbook Stickers (placed strictly along empty board corners & margins) */
function StickerStarHeart() {
  return (
    <svg viewBox="0 0 92 86" className="w-14 h-14 sm:w-20 sm:h-20 drop-shadow-[0_4px_6px_rgba(32,14,4,0.42)]" aria-hidden="true">
      {/* White die-cut sticker border */}
      <path
        d="M44 8 L53 26 L73 29 L58 43 L62 63 L44 53 L26 63 L30 43 L15 29 L35 26 Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <path
        d="M44 8 L53 26 L73 29 L58 43 L62 63 L44 53 L26 63 L30 43 L15 29 L35 26 Z"
        fill="#FDE047"
        stroke="#D97706"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Cute smiling face */}
      <circle cx="38" cy="36" r="2.6" fill="#2D1537" />
      <circle cx="50" cy="36" r="2.6" fill="#2D1537" />
      <circle cx="33.5" cy="39.5" r="2.4" fill="#FDA4AF" />
      <circle cx="54.5" cy="39.5" r="2.4" fill="#FDA4AF" />
      <path d="M40 41 Q44 45 48 41" fill="none" stroke="#2D1537" strokeWidth="2.2" strokeLinecap="round" />
      {/* Mini pastel heart */}
      <path
        d="M73 62 C73 57 67 57 67 62 C67 57 61 57 61 62 C61 67 67 71 67 71 C67 71 73 67 73 62 Z"
        fill="#F472B6"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        paintOrder="stroke"
      />
    </svg>
  );
}

function StickerRainbowCloud() {
  return (
    <svg viewBox="0 0 100 84" className="w-16 h-14 sm:w-22 sm:h-[76px] drop-shadow-[0_4px_6px_rgba(32,14,4,0.42)]" aria-hidden="true">
      {/* Sticker backing */}
      <path
        d="M20 52 A28 28 0 0 1 76 52 Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="12"
        strokeLinejoin="round"
      />
      {/* Pastel rainbow arcs */}
      <path d="M22 50 A26 26 0 0 1 74 50" fill="none" stroke="#FDA4AF" strokeWidth="6" strokeLinecap="round" />
      <path d="M28 50 A20 20 0 0 1 68 50" fill="none" stroke="#FDE68A" strokeWidth="6" strokeLinecap="round" />
      <path d="M34 50 A14 14 0 0 1 62 50" fill="none" stroke="#A7F3D0" strokeWidth="6" strokeLinecap="round" />
      {/* Cute fluffy cloud */}
      <path
        d="M24 68 H74 A11 11 0 0 0 74 47 A13 13 0 0 0 51 41 A12 12 0 0 0 28 48 A10 10 0 0 0 24 68 Z"
        fill="#FFFFFF"
        stroke="#93C5FD"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="43" cy="56" r="2.2" fill="#334155" />
      <circle cx="57" cy="56" r="2.2" fill="#334155" />
      <path d="M47 60 Q50 63 53 60" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="59" r="2.2" fill="#FBCFE8" />
      <circle cx="62" cy="59" r="2.2" fill="#FBCFE8" />
    </svg>
  );
}

function StickerMagicBook() {
  return (
    <svg viewBox="0 0 92 84" className="w-16 h-16 drop-shadow-[0_4px_6px_rgba(32,14,4,0.42)]" aria-hidden="true">
      <rect x="14" y="18" width="64" height="46" rx="10" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="9" />
      {/* Open storybook pages */}
      <path d="M16 24 Q31 18 46 25 Q61 18 76 24 V60 Q61 54 46 61 Q31 54 16 60 Z" fill="#8B1E3F" stroke="#F5B82E" strokeWidth="2.5" />
      <path d="M20 26 Q33 21 45 27 V57 Q33 52 20 57 Z" fill="#FFFBEB" />
      <path d="M72 26 Q59 21 47 27 V57 Q59 52 72 57 Z" fill="#FEF3C7" />
      <line x1="25" y1="35" x2="39" y2="36" stroke="#9D7BB5" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="25" y1="42" x2="39" y2="43" stroke="#9D7BB5" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="53" y1="36" x2="67" y2="35" stroke="#9D7BB5" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="53" y1="43" x2="67" y2="42" stroke="#9D7BB5" strokeWidth="2.2" strokeLinecap="round" />
      {/* Sparkle above book */}
      <path d="M46 6 L48.5 12 L54.5 14.5 L48.5 17 L46 23 L43.5 17 L37.5 14.5 L43.5 12 Z" fill="#FDE047" stroke="#FFFFFF" strokeWidth="2" paintOrder="stroke" />
    </svg>
  );
}

function StickerCrownSparkle() {
  return (
    <svg viewBox="0 0 92 84" className="w-16 h-16 drop-shadow-[0_4px_6px_rgba(32,14,4,0.42)]" aria-hidden="true">
      <path
        d="M16 58 L13 28 L31 41 L46 20 L61 41 L79 28 L76 58 Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <path
        d="M16 58 L13 28 L31 41 L46 20 L61 41 L79 28 L76 58 Z"
        fill="#FBBF24"
        stroke="#B45309"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="16" y="55" width="60" height="8" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
      <circle cx="13" cy="26" r="4" fill="#FDE047" stroke="#B45309" strokeWidth="1.5" />
      <circle cx="46" cy="18" r="5" fill="#F43F5E" stroke="#B45309" strokeWidth="1.5" />
      <circle cx="79" cy="26" r="4" fill="#FDE047" stroke="#B45309" strokeWidth="1.5" />
      <circle cx="34" cy="48" r="3" fill="#A855F7" />
      <circle cx="46" cy="45" r="3.5" fill="#EC4899" />
      <circle cx="58" cy="48" r="3" fill="#38BDF8" />
    </svg>
  );
}

function StickerBunnyFlower() {
  return (
    <svg viewBox="0 0 96 92" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_6px_rgba(32,14,4,0.42)]" aria-hidden="true">
      {/* Sticker backing silhouette */}
      <g stroke="#FFFFFF" strokeWidth="9" strokeLinejoin="round" fill="#FFFFFF">
        <ellipse cx="36" cy="26" rx="8" ry="18" transform="rotate(-10 36 26)" />
        <ellipse cx="58" cy="26" rx="8" ry="18" transform="rotate(10 58 26)" />
        <circle cx="47" cy="56" r="22" />
      </g>
      {/* Bunny ears & face */}
      <ellipse cx="36" cy="26" rx="8" ry="18" transform="rotate(-10 36 26)" fill="#FCE7F3" stroke="#DB2777" strokeWidth="2" />
      <ellipse cx="36" cy="27" rx="4" ry="12" transform="rotate(-10 36 27)" fill="#F9A8D4" />
      <ellipse cx="58" cy="26" rx="8" ry="18" transform="rotate(10 58 26)" fill="#FCE7F3" stroke="#DB2777" strokeWidth="2" />
      <ellipse cx="58" cy="27" rx="4" ry="12" transform="rotate(10 58 27)" fill="#F9A8D4" />
      <circle cx="47" cy="56" r="22" fill="#FFF1F2" stroke="#DB2777" strokeWidth="2.2" />
      <circle cx="39" cy="53" r="2.5" fill="#3B1240" />
      <circle cx="55" cy="53" r="2.5" fill="#3B1240" />
      <circle cx="34" cy="57" r="2.8" fill="#FDA4AF" />
      <circle cx="60" cy="57" r="2.8" fill="#FDA4AF" />
      <ellipse cx="47" cy="57" rx="2.5" ry="1.8" fill="#F43F5E" />
      <path d="M43 61 Q47 64 51 61" fill="none" stroke="#3B1240" strokeWidth="2" strokeLinecap="round" />
      {/* Mini pastel flower on corner */}
      <circle cx="76" cy="70" r="6" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="5" />
      <circle cx="76" cy="64" r="4.5" fill="#A7F3D0" />
      <circle cx="82" cy="70" r="4.5" fill="#A7F3D0" />
      <circle cx="76" cy="76" r="4.5" fill="#A7F3D0" />
      <circle cx="70" cy="70" r="4.5" fill="#A7F3D0" />
      <circle cx="76" cy="70" r="4" fill="#FDE047" />
    </svg>
  );
}

function StickerMoonFlower() {
  return (
    <svg viewBox="0 0 96 92" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_6px_rgba(32,14,4,0.42)]" aria-hidden="true">
      {/* Crescent moon sticker */}
      <path
        d="M54 16 A24 24 0 1 0 74 56 A18 18 0 1 1 54 16 Z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <path
        d="M54 16 A24 24 0 1 0 74 56 A18 18 0 1 1 54 16 Z"
        fill="#FEF08A"
        stroke="#D97706"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="41" cy="40" r="2.2" fill="#451A03" />
      <path d="M41 47 Q45 50 49 46" fill="none" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
      {/* Cute pastel flower */}
      <circle cx="26" cy="68" r="10" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="26" cy="60" r="5" fill="#DDD6FE" />
      <circle cx="34" cy="68" r="5" fill="#DDD6FE" />
      <circle cx="26" cy="76" r="5" fill="#DDD6FE" />
      <circle cx="18" cy="68" r="5" fill="#DDD6FE" />
      <circle cx="26" cy="68" r="4.5" fill="#FDE047" />
      {/* Tiny sparkle */}
      <path d="M74 22 L76 27 L81 29 L76 31 L74 36 L72 31 L67 29 L72 27 Z" fill="#BAE6FD" stroke="#FFFFFF" strokeWidth="2" paintOrder="stroke" />
    </svg>
  );
}

function BuntingTitleRow({
  text,
  wordColors,
  size = 'md',
  ropeId,
  containerClassName = ''
}: {
  text: string;
  wordColors: string[];
  size?: 'lg' | 'md';
  ropeId: string;
  containerClassName?: string;
}) {
  const words = text.split(' ');
  const totalSlots = text.length;
  let runningSlot = 0;

  return (
    <div className={`relative w-full mx-auto pt-1 pb-2 ${containerClassName}`}>
      {/* Curved Party Garland Twine Rope (sags gracefully downward across the board on desktop) */}
      <svg
        viewBox="0 0 1000 76"
        preserveAspectRatio="none"
        className="pointer-events-none hidden lg:block absolute inset-x-0 top-0 w-full h-[72px]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`twine-${ropeId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5C3A1E" />
            <stop offset="25%" stopColor="#D6B183" />
            <stop offset="50%" stopColor="#E6C9A2" />
            <stop offset="75%" stopColor="#D6B183" />
            <stop offset="100%" stopColor="#5C3A1E" />
          </linearGradient>
        </defs>
        {/* Subtle drop shadow under rope */}
        <path
          d="M 8 12 Q 500 76 992 12"
          fill="none"
          stroke="rgba(30, 14, 4, 0.45)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Braided twine cord */}
        <path
          d="M 8 10 Q 500 74 992 10"
          fill="none"
          stroke={`url(#twine-${ropeId})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Anchor pin tacks at left and right ends of string */}
        <circle cx="10" cy="10" r="5" fill="#B91C1C" stroke="#450A0A" strokeWidth="1.5" />
        <circle cx="990" cy="10" r="5" fill="#B91C1C" stroke="#450A0A" strokeWidth="1.5" />
      </svg>

      <div
        className={`relative z-10 flex flex-wrap lg:flex-nowrap items-start justify-center gap-y-4 px-1 sm:px-2 ${
          size === 'lg' ? 'gap-x-4 sm:gap-x-5 lg:gap-x-5 xl:gap-x-7' : 'gap-x-3 sm:gap-x-4 lg:gap-x-4 xl:gap-x-5'
        }`}
      >
        {words.map((word, wIdx) => {
          const wordStartSlot = runningSlot;
          runningSlot += word.length + 1;
          const wordColorClass = wordColors[wIdx % wordColors.length];

          return (
            <div
              key={`${word}-${wIdx}`}
              className={`relative inline-flex items-start justify-center ${
                size === 'lg' ? 'gap-0.5 lg:gap-[3px] xl:gap-1' : 'gap-[1.5px] sm:gap-0.5 xl:gap-[3px]'
              }`}
            >
              {/* Gently curved mini twine fallback per word on mobile/tablet */}
              <svg
                viewBox="0 0 200 18"
                preserveAspectRatio="none"
                className="pointer-events-none lg:hidden absolute -left-1.5 -right-1.5 top-[7px] w-[calc(100%+12px)] h-[14px]"
                aria-hidden="true"
              >
                <path
                  d="M 2 4 Q 100 13 198 4"
                  fill="none"
                  stroke="rgba(30, 14, 4, 0.35)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 2 3 Q 100 12 198 3"
                  fill="none"
                  stroke="#D6B183"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>

              {Array.from(word).map((char, cIdx) => {
                const slot = wordStartSlot + cIdx;
                const t = totalSlots > 1 ? slot / (totalSlots - 1) : 0.5;
                const dropClass = getCurveDropClass(t);
                const tiltClass = getCurveTiltClass(t);

                return (
                  <div
                    key={`${wIdx}-${cIdx}-${char}`}
                    className={`relative z-10 flex flex-col items-center ${dropClass} ${tiltClass}`}
                  >
                    {/* Realistic two-prong wooden clothespin clipping paper onto curved rope */}
                    <div
                      className="relative w-2 h-3 sm:w-2.5 sm:h-3.5 rounded-t-sm bg-gradient-to-b from-[#B97F47] via-[#9C6635] to-[#6B411E] border border-[#45270F] shadow-sm z-10 -mb-1 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <div className="w-full h-[1.5px] bg-[#E5C27D] opacity-80" />
                    </div>

                    {/* Inverted triangle pastel paper pennant with large handwritten brush lettering */}
                    <div className="drop-shadow-[0_5px_5px_rgba(35,18,5,0.44)]">
                      <div
                        className={`${wordColorClass} [clip-path:polygon(0_0,100%_0,50%_100%)] flex items-start justify-center ${
                          size === 'lg'
                            ? 'w-[28px] h-[42px] sm:w-9 sm:h-[52px] md:w-10 md:h-[58px] lg:w-10 lg:h-[60px] xl:w-12 xl:h-[68px] pt-0.5 sm:pt-1'
                            : 'w-[24px] h-[40px] sm:w-9 sm:h-[50px] md:w-10 md:h-[54px] lg:w-[33px] lg:h-[52px] xl:w-[41px] xl:h-[60px] pt-0.5 sm:pt-1'
                        }`}
                      >
                        <span
                          className={`font-handwritten font-extrabold leading-none text-[#3D2612] select-none ${
                            size === 'lg'
                              ? 'text-[20px] sm:text-2xl md:text-[28px] lg:text-[30px] xl:text-[36px]'
                              : 'text-[18px] sm:text-[23px] md:text-[26px] lg:text-[24px] xl:text-[30px]'
                          }`}
                        >
                          {char}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AchievementPinboard({ badges, earnedBadgeIds }: AchievementPinboardProps) {
  const earnedCount = earnedBadgeIds.length;

  return (
    <section className="relative rounded-3xl border-[10px] sm:border-[14px] border-[#5D371B] bg-[#C4915C] shadow-[0_24px_55px_rgba(0,0,0,0.65),inset_0_0_32px_rgba(52,25,8,0.6)] overflow-hidden">
      {/* Realistic Wood Planks & Fine Grain SVG Texture */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full opacity-55"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="pinboard-wood-grain" width="240" height="140" patternUnits="userSpaceOnUse">
            <rect width="240" height="140" fill="#C4915C" />
            <rect y="0" width="240" height="46" fill="#C99660" />
            <rect y="47" width="240" height="46" fill="#BC8852" />
            <rect y="94" width="240" height="46" fill="#C7945E" />
            <line x1="0" y1="46.5" x2="240" y2="46.5" stroke="#85562E" strokeWidth="1.4" strokeOpacity="0.45" />
            <line x1="0" y1="93.5" x2="240" y2="93.5" stroke="#85562E" strokeWidth="1.4" strokeOpacity="0.45" />
            <line x1="0" y1="139.5" x2="240" y2="139.5" stroke="#85562E" strokeWidth="1.4" strokeOpacity="0.45" />
            <path d="M0 10 Q60 6 120 12 T240 10" fill="none" stroke="#8C5930" strokeWidth="1" strokeOpacity="0.24" />
            <path d="M0 24 Q80 28 160 22 T240 25" fill="none" stroke="#6E4220" strokeWidth="0.9" strokeOpacity="0.2" />
            <path d="M0 37 Q50 34 115 39 T240 36" fill="none" stroke="#DFB17E" strokeWidth="0.9" strokeOpacity="0.28" />
            <path d="M0 60 Q70 65 140 58 T240 62" fill="none" stroke="#7A4B26" strokeWidth="1" strokeOpacity="0.24" />
            <path d="M0 78 Q90 74 170 80 T240 77" fill="none" stroke="#DFB17E" strokeWidth="0.9" strokeOpacity="0.22" />
            <path d="M0 108 Q65 104 135 111 T240 107" fill="none" stroke="#8C5930" strokeWidth="1" strokeOpacity="0.24" />
            <path d="M0 126 Q85 130 175 123 T240 127" fill="none" stroke="#6E4220" strokeWidth="0.9" strokeOpacity="0.2" />
            <ellipse cx="185" cy="70" rx="14" ry="4" fill="none" stroke="#754722" strokeWidth="0.9" strokeOpacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pinboard-wood-grain)" />
      </svg>

      {/* Inner beveled frame depth shadow & 4 brass corner studs */}
      <div
        className="pointer-events-none absolute inset-0 border-2 border-[#472710]/60 rounded-2xl shadow-[inset_0_4px_16px_rgba(32,14,4,0.45)]"
        aria-hidden="true"
      />
      {[
        'top-3 left-3',
        'top-3 right-3',
        'bottom-3 left-3',
        'bottom-3 right-3'
      ].map((pos) => (
        <div
          key={pos}
          className={`pointer-events-none absolute ${pos} w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#FDE047] to-[#92400E] border border-[#451A03] shadow-sm`}
          aria-hidden="true"
        />
      ))}

      {/* Cute Die-Cut Scrapbook Stickers Placed Strictly on Empty Board Corners & Outer Margins */}
      <div className="pointer-events-none absolute top-4 left-3 sm:top-6 sm:left-5 -rotate-12 z-10 hidden sm:block" aria-hidden="true">
        <StickerStarHeart />
      </div>
      <div className="pointer-events-none absolute top-4 right-3 sm:top-6 sm:right-5 rotate-12 z-10 hidden sm:block" aria-hidden="true">
        <StickerRainbowCloud />
      </div>
      <div className="pointer-events-none absolute top-[45%] left-3 -rotate-6 z-10 hidden xl:block" aria-hidden="true">
        <StickerMagicBook />
      </div>
      <div className="pointer-events-none absolute top-[45%] right-3 rotate-6 z-10 hidden xl:block" aria-hidden="true">
        <StickerCrownSparkle />
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 lg:bottom-8 lg:left-10 rotate-6 z-10 hidden md:block" aria-hidden="true">
        <StickerBunnyFlower />
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 lg:bottom-8 lg:right-10 -rotate-6 z-10 hidden md:block" aria-hidden="true">
        <StickerMoonFlower />
      </div>

      {/* Board Content Layer */}
      <div className="relative z-10 p-5 sm:p-8 xl:px-16 space-y-6">
        {/* Two Curved Hanging Pastel Pennant Title Rows + Pinned Progress Memo */}
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <BuntingTitleRow
              text="KOLEKSI PENCAPAIAN"
              wordColors={[WORD_COLOR_YELLOW, WORD_COLOR_SKY_BLUE]}
              size="lg"
              ropeId="top"
              containerClassName="sm:px-14 lg:px-16 max-w-5xl"
            />
            <BuntingTitleRow
              text="Lencana Pengembaraan Kamu"
              wordColors={[WORD_COLOR_PINK, WORD_COLOR_LAVENDER, WORD_COLOR_MINT]}
              size="md"
              ropeId="sub"
              containerClassName="sm:px-6 lg:px-4 xl:px-2 max-w-6xl"
            />
          </div>

          {/* Small pinned paper memo showing badge count + star */}
          <div className="flex justify-center pt-1">
            <div className="relative inline-flex items-center gap-2 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] px-4 py-1.5 shadow-[0_4px_10px_rgba(35,18,5,0.3)] -rotate-[0.8deg]">
              <span
                className="w-2.5 h-2.5 rounded-full bg-[#B91C1C] border border-[#450A0A] shadow-sm"
                aria-hidden="true"
              />
              <p className="font-rounded text-sm sm:text-[15px] font-bold text-[#3B1F0E] tabular-nums">
                {earnedCount} daripada {badges.length} lencana diperoleh
              </p>
              <Star className="w-4 h-4 fill-[#F5B82E] text-[#B45309]" aria-hidden="true" />
            </div>
          </div>

          {/* Compact mobile sticker pair neatly centered under memo on small screens */}
          <div className="flex md:hidden items-center justify-center gap-6 pt-1" aria-hidden="true">
            <div className="scale-75 -rotate-6"><StickerStarHeart /></div>
            <div className="scale-75 rotate-6"><StickerRainbowCloud /></div>
          </div>
        </div>

        {/* Five Sticky-Note Badges: Top Row 3, Bottom Row 2 Centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-7 sm:gap-8 pt-2 pb-4 max-w-6xl mx-auto">
          {badges.map((badge, idx) => {
            const earned = earnedBadgeIds.includes(badge.id);
            const noteStyle = STICKY_NOTE_STYLES[idx % STICKY_NOTE_STYLES.length];
            const gridPlacement =
              idx < 3
                ? 'lg:col-span-2'
                : idx === 3
                ? 'lg:col-span-2 lg:col-start-2'
                : 'lg:col-span-2 lg:col-start-4';

            return (
              <div
                key={badge.id}
                className={`relative ${gridPlacement} flex flex-col`}
              >
                {/* 3D Sticky Note Paper Card */}
                <div
                  className={`relative flex-1 rounded-sm border ${noteStyle.bg} ${noteStyle.border} ${noteStyle.tilt} hover:rotate-0 transition-all duration-200 p-5 sm:p-6 pt-8 flex flex-col justify-between min-h-[268px] ${
                    earned
                      ? 'shadow-[0_12px_24px_rgba(28,13,3,0.38)] opacity-100'
                      : 'shadow-[0_6px_14px_rgba(28,13,3,0.22)] opacity-80 saturate-[0.72] blur-[1.1px]'
                  }`}
                >
                  {/* Top-Center 3D Pushpin */}
                  <div
                    className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center z-20"
                    aria-hidden="true"
                  >
                    <div className={`w-5 h-5 rounded-full ${noteStyle.pin} border-2 border-white/80 shadow-[0_4px_6px_rgba(0,0,0,0.45)] flex items-center justify-center`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60 -translate-x-0.5 -translate-y-0.5" />
                    </div>
                  </div>

                  {/* Subtle translucent washi tape strip at top-left corner */}
                  <div
                    className="pointer-events-none absolute -top-2 left-3 w-12 h-4 bg-white/50 border border-white/60 -rotate-12 shadow-xs"
                    aria-hidden="true"
                  />

                  {/* Gold Medal with Maroon Ribbons pinned to top-right corner */}
                  <div className="absolute -top-4 -right-2 sm:-right-3 z-20 pointer-events-none">
                    <GoldRibbonMedal earned={earned} idSuffix={`${badge.id}-${idx}`} />
                  </div>

                  {/* Sticky Note Content — Larger Handwritten + Rounded Typography */}
                  <div className="pr-12">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 border ${
                        earned
                          ? 'bg-[#F5B82E] border-[#B45309]/40 text-[#3A2208] shadow-sm'
                          : 'bg-[#785A3A]/15 border-[#785A3A]/20 text-[#5C4430]/75'
                      }`}
                    >
                      {earned ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>

                    <p className="font-rounded text-sm sm:text-[15px] font-bold tracking-wide text-[#9F2D49]">
                      Misi {badge.mission} · +{badge.stars}★
                    </p>
                    <h3 className="font-handwritten mt-1 text-xl sm:text-[22px] font-extrabold text-[#3D2612] leading-snug">
                      {badge.title}
                    </h3>
                    <p className="font-rounded mt-2 text-sm sm:text-[15px] text-[#4E341C] leading-relaxed font-medium">
                      {badge.description}
                    </p>
                  </div>

                  {/* Bottom Status Strip */}
                  <div className="mt-4 pt-3 border-t border-[#6B4E31]/15 flex items-center justify-between gap-2">
                    <span
                      className={`font-rounded inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-sm font-bold ${
                        earned
                          ? 'bg-[#235334] text-[#ECFDF5] shadow-xs'
                          : 'bg-[#5C4430]/15 text-[#5C4430]'
                      }`}
                    >
                      {earned ? 'Telah Diperoleh' : 'Belum Dibuka'}
                    </span>
                  </div>

                  {/* Subtle folded bottom-right paper corner */}
                  <div
                    className={`pointer-events-none absolute bottom-0 right-0 w-0 h-0 border-t-[18px] border-t-transparent border-l-[18px] border-l-transparent border-r-[18px] border-b-[18px] ${noteStyle.fold} opacity-65`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
