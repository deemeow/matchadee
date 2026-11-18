import { useEffect, useState } from 'react';
import enchantedForestBackdropImg from '../assets/images/enchanted_forest_backdrop_1794838151001.jpg';
import cikguKancilForestImg from '../assets/images/cikgu_kancil_forest_mascot_1794838152777.jpg';

interface CikguKancilSpriteProps {
  className?: string;
}

/**
 * 3D cartoon Cikgu Kancil mascot cleanly separated from its flat studio background
 * via edge-connected BFS neutral-white transparency extraction + soft anti-aliased fringe.
 */
export function CikguKancilForestSprite({ className = '' }: CikguKancilSpriteProps) {
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let activeObjectUrl: string | null = null;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = cikguKancilForestImg;

    img.onload = () => {
      if (cancelled) return;
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const total = w * h;
        const visited = new Uint8Array(total);
        const queue = new Int32Array(total);
        let head = 0;
        let tail = 0;

        const isOuterWhite = (idx: number) => {
          const p = idx * 4;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];
          const minC = Math.min(r, g, b);
          const maxC = Math.max(r, g, b);
          return minC >= 228 && maxC - minC <= 22;
        };

        const pushIfBg = (x: number, y: number) => {
          const idx = y * w + x;
          if (!visited[idx] && isOuterWhite(idx)) {
            visited[idx] = 1;
            queue[tail++] = idx;
          }
        };

        for (let x = 0; x < w; x++) {
          pushIfBg(x, 0);
          pushIfBg(x, h - 1);
        }
        for (let y = 1; y < h - 1; y++) {
          pushIfBg(0, y);
          pushIfBg(w - 1, y);
        }

        while (head < tail) {
          const curr = queue[head++];
          data[curr * 4 + 3] = 0;
          const cx = curr % w;
          const cy = (curr - cx) / w;

          if (cx > 0) {
            const n = curr - 1;
            if (!visited[n] && isOuterWhite(n)) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
          if (cx < w - 1) {
            const n = curr + 1;
            if (!visited[n] && isOuterWhite(n)) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
          if (cy > 0) {
            const n = curr - w;
            if (!visited[n] && isOuterWhite(n)) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
          if (cy < h - 1) {
            const n = curr + w;
            if (!visited[n] && isOuterWhite(n)) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
        }

        // Smooth 1px anti-aliased boundary feathering around transparent studio edges
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const p = idx * 4;
            if (data[p + 3] === 0) continue;

            const touchesTransparent =
              data[(idx - 1) * 4 + 3] === 0 ||
              data[(idx + 1) * 4 + 3] === 0 ||
              data[(idx - w) * 4 + 3] === 0 ||
              data[(idx + w) * 4 + 3] === 0;

            if (touchesTransparent) {
              const r = data[p];
              const g = data[p + 1];
              const b = data[p + 2];
              const minC = Math.min(r, g, b);
              const maxC = Math.max(r, g, b);
              if (minC >= 205 && maxC - minC <= 32) {
                const factor = Math.max(0.12, 1 - (minC - 195) / 55);
                data[p + 3] = Math.round(255 * factor);
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((blob) => {
          if (cancelled || !blob) return;
          activeObjectUrl = URL.createObjectURL(blob);
          setCutoutUrl(activeObjectUrl);
        }, 'image/png');
      } catch {
        if (!cancelled) setCutoutUrl(cikguKancilForestImg);
      }
    };

    img.onerror = () => {
      if (!cancelled) setFailed(true);
    };

    return () => {
      cancelled = true;
      if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
    };
  }, []);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-b from-[#FCE6A6] to-[#E9B568] border-4 border-[#6B3F1A] shadow-xl px-6 py-8 ${className}`}
        aria-label="Cikgu Kancil, guru sastera di dunia hutan pengembaraan"
      >
        <span className="font-rounded font-bold text-[#4A2310] text-lg">Cikgu Kancil</span>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Soft warm sunlit aura framing Cikgu Kancil against the meadow */}
      <div
        className="pointer-events-none absolute inset-x-2 top-[8%] bottom-[6%] rounded-full opacity-85 blur-2xl"
        style={{
          background:
            'radial-gradient(circle at 50% 44%, rgba(255, 252, 224, 0.82) 0%, rgba(167, 243, 208, 0.34) 55%, rgba(167, 243, 208, 0) 80%)'
        }}
        aria-hidden="true"
      />

      {/* Animated mascot image + gentle waving paw sparkle */}
      <div className="relative z-10 h-full flex items-end justify-center animate-kancil-greeting">
        <img
          src={cutoutUrl ?? cikguKancilForestImg}
          alt="Cikgu Kancil, maskot pelanduk comel berkaca mata bulat emas memegang buku cerita di hutan pengembaraan"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`h-full w-auto max-w-full object-contain ${
            cutoutUrl ? '' : 'mix-blend-multiply'
          }`}
          style={{
            filter: 'drop-shadow(0 16px 26px rgba(6, 78, 59, 0.30))'
          }}
          draggable={false}
        />

        {/* Subtle friendly sparkle accent by Cikgu Kancil's raised waving paw */}
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-[29%] left-[10%] w-4 h-4 sm:w-5 sm:h-5 text-[#FEF08A] animate-twinkle drop-shadow-[0_0_6px_rgba(253,224,71,0.85)]"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 1 L14.4 9.6 L23 12 L14.4 14.4 L12 23 L9.6 14.4 L1 12 L9.6 9.6 Z" />
        </svg>

        {/* Subtle cheerful eye-gleam star near right lens edge */}
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-[21%] right-[21%] w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFFBEB] animate-twinkle drop-shadow-[0_0_5px_rgba(255,255,255,0.9)]"
          style={{ animationDelay: '1.4s' }}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z" />
        </svg>
      </div>

      {/* Crisp meadow ground contact shadow under Cikgu Kancil's hooves */}
      <div
        className="-mt-3 sm:-mt-5 w-[60%] h-5 sm:h-7 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(6, 78, 59, 0.46) 0%, rgba(6, 78, 59, 0.18) 58%, rgba(6, 78, 59, 0) 82%)'
        }}
        aria-hidden="true"
      />
    </div>
  );
}

interface ButterflyProps {
  className?: string;
  wingColor: string;
  accentColor: string;
  delay?: string;
}

function EnchantedButterfly({ className = '', wingColor, accentColor, delay = '0s' }: ButterflyProps) {
  return (
    <div
      className={`pointer-events-none absolute animate-butterfly ${className}`}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 44 36"
        className="w-7 h-6 sm:w-9 sm:h-7 animate-wing-flap drop-shadow-[0_2px_4px_rgba(6,78,59,0.22)]"
        style={{ animationDelay: delay }}
      >
        <path
          d="M21 16 C14 3, 2 5, 4 16 C5 22, 14 22, 20 19 Z"
          fill={wingColor}
          stroke="#FFFFFF"
          strokeWidth="1"
        />
        <path
          d="M23 16 C30 3, 42 5, 40 16 C39 22, 30 22, 24 19 Z"
          fill={wingColor}
          stroke="#FFFFFF"
          strokeWidth="1"
        />
        <path
          d="M20 19 C12 21, 8 30, 14 32 C18 33, 21 26, 21 21 Z"
          fill={accentColor}
          stroke="#FFFFFF"
          strokeWidth="0.9"
        />
        <path
          d="M24 19 C32 21, 36 30, 30 32 C26 33, 23 26, 23 21 Z"
          fill={accentColor}
          stroke="#FFFFFF"
          strokeWidth="0.9"
        />
        <ellipse cx="22" cy="19" rx="1.6" ry="7.5" fill="#3D2612" />
      </svg>
    </div>
  );
}

const FIREFLIES = [
  { top: '26%', left: '14%', size: 8, delay: '0s', duration: '5.2s' },
  { top: '42%', left: '8%', size: 10, delay: '1.1s', duration: '6.1s' },
  { top: '58%', left: '22%', size: 7, delay: '2.3s', duration: '4.8s' },
  { top: '22%', left: '84%', size: 9, delay: '0.7s', duration: '5.7s' },
  { top: '46%', left: '89%', size: 10, delay: '1.8s', duration: '6.4s' },
  { top: '63%', left: '76%', size: 8, delay: '2.9s', duration: '5.1s' },
  { top: '36%', left: '54%', size: 7, delay: '1.5s', duration: '5.9s' }
];

const DRIFTING_LEAVES = [
  { top: '14%', left: '16%', delay: '0s', color: '#4ADE80' },
  { top: '12%', left: '82%', delay: '3.6s', color: '#86EFAC' },
  { top: '20%', left: '26%', delay: '7.2s', color: '#34D399' }
];

/**
 * Full-bleed Enchanted Learning Forest stage featuring the lush 3D cartoon backdrop
 * enhanced with lightweight CSS-composited drifting clouds, golden sunbeams,
 * glowing fireflies, fluttering butterflies, drifting leaves, and swaying meadow accents.
 */
export default function EnchantedForestStage() {
  const [bgFailed, setBgFailed] = useState(false);

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        background:
          'linear-gradient(180deg, #38BDF8 0%, #67E8F9 38%, #A7F3D0 66%, #4ADE80 100%)'
      }}
    >
      {/* Main 3D Pixar-style Enchanted Forest Artwork */}
      {!bgFailed && (
        <img
          src={enchantedForestBackdropImg}
          alt="Hutan pengembaraan ajaib yang cerah dengan langit biru, bukit hijau, pokok rimbun, sinaran matahari keemasan, dan bunga liar"
          referrerPolicy="no-referrer"
          onError={() => setBgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          draggable={false}
        />
      )}

      {/* Subtle top-sky readability veil so the title pops cleanly against sky & clouds */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%]"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 45% 28%, rgba(255, 253, 245, 0.36) 0%, rgba(255, 253, 245, 0.14) 52%, rgba(255, 253, 245, 0) 85%)'
        }}
        aria-hidden="true"
      />

      {/* Drifting fluffy clouds in upper sky */}
      <div
        className="pointer-events-none absolute top-[6%] left-[32%] w-40 sm:w-56 h-14 rounded-full bg-white/45 blur-[6px] animate-cloud-drift"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-[11%] right-[24%] w-32 sm:w-48 h-12 rounded-full bg-white/40 blur-[5px] animate-cloud-drift"
        style={{ animationDelay: '-9s', animationDuration: '32s' }}
        aria-hidden="true"
      />

      {/* Warm golden sunbeams filtering softly from upper-left canopy */}
      <div
        className="pointer-events-none absolute -top-12 left-[6%] w-[44%] h-[78%] origin-top-left rotate-[22deg] animate-sunbeam"
        style={{
          background:
            'linear-gradient(180deg, rgba(254, 240, 138, 0.34) 0%, rgba(254, 249, 195, 0.12) 55%, rgba(254, 249, 195, 0) 100%)',
          clipPath: 'polygon(12% 0%, 42% 0%, 88% 100%, 4% 100%)'
        }}
        aria-hidden="true"
      />

      {/* Warm golden fireflies */}
      {FIREFLIES.map((f, idx) => (
        <span
          key={idx}
          className="pointer-events-none absolute rounded-full animate-firefly"
          style={{
            top: f.top,
            left: f.left,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animationDelay: f.delay,
            animationDuration: f.duration,
            background:
              'radial-gradient(circle, #FEF9C3 0%, #FDE047 48%, rgba(253, 224, 71, 0) 78%)',
            boxShadow: '0 0 12px 3px rgba(254, 240, 138, 0.72)'
          }}
          aria-hidden="true"
        />
      ))}

      {/* Gentle drifting leaves near outer trees */}
      {DRIFTING_LEAVES.map((leaf, idx) => (
        <span
          key={idx}
          className="pointer-events-none absolute w-3.5 h-2.5 rounded-full animate-leaf-drift"
          style={{
            top: leaf.top,
            left: leaf.left,
            animationDelay: leaf.delay,
            backgroundColor: leaf.color,
            borderRadius: '80% 10% 80% 10%',
            boxShadow: '0 2px 4px rgba(6, 78, 59, 0.18)'
          }}
          aria-hidden="true"
        />
      ))}

      {/* Delicate animated butterflies in open sky/tree edges */}
      <EnchantedButterfly
        className="top-[18%] left-[12%] sm:left-[18%]"
        wingColor="#FDE047"
        accentColor="#FBBF24"
        delay="0s"
      />
      <EnchantedButterfly
        className="top-[22%] right-[12%] sm:right-[16%]"
        wingColor="#F9A8D4"
        accentColor="#F472B6"
        delay="2.6s"
      />

      {/* Gentle swaying wildflower accents along bottom corners (never obstructing center CTA) */}
      <svg
        viewBox="0 0 180 90"
        className="pointer-events-none absolute bottom-0 left-0 w-36 sm:w-52 h-auto animate-flower-sway"
        aria-hidden="true"
      >
        <path d="M18 90 Q14 58 22 40" stroke="#15803D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx="22" cy="36" r="7" fill="#FDE047" />
        <circle cx="15" cy="40" r="5.5" fill="#FFFBEB" />
        <circle cx="29" cy="40" r="5.5" fill="#FFFBEB" />
        <circle cx="22" cy="44" r="5.5" fill="#FFFBEB" />
        <circle cx="22" cy="38" r="4" fill="#F59E0B" />

        <path d="M58 90 Q62 66 54 50" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="54" cy="47" r="6" fill="#F472B6" />
        <circle cx="48" cy="51" r="4.5" fill="#FBCFE8" />
        <circle cx="60" cy="51" r="4.5" fill="#FBCFE8" />
        <circle cx="54" cy="50" r="3.2" fill="#FEF08A" />
      </svg>

      <svg
        viewBox="0 0 180 90"
        className="pointer-events-none absolute bottom-0 right-0 w-36 sm:w-52 h-auto animate-flower-sway"
        style={{ animationDelay: '-1.8s' }}
        aria-hidden="true"
      >
        <path d="M158 90 Q162 58 152 38" stroke="#15803D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx="152" cy="34" r="6.5" fill="#67E8F9" />
        <circle cx="145" cy="39" r="5" fill="#ECFEFF" />
        <circle cx="159" cy="39" r="5" fill="#ECFEFF" />
        <circle cx="152" cy="38" r="3.5" fill="#FDE047" />

        <path d="M118 90 Q114 66 122 52" stroke="#16A34A" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="122" cy="48" r="6" fill="#FDE047" />
        <circle cx="116" cy="52" r="4.5" fill="#FEF9C3" />
        <circle cx="128" cy="52" r="4.5" fill="#FEF9C3" />
        <circle cx="122" cy="51" r="3.2" fill="#F97316" />
      </svg>
    </div>
  );
}

/**
 * Shared viewport-locked Enchanted Learning Forest background layer.
 * Uses the exact same visual stage as Pentas Utama across all sections
 * without vertical stretching on scrollable pages.
 */
export function SharedForestBackground() {
  return (
    <div
      className="no-print fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <EnchantedForestStage />
    </div>
  );
}

