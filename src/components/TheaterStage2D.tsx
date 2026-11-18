import React from 'react';

/**
 * 2D Flat Illustrated Storybook Cikgu Kancil
 * Matches the exact stroke weight (#4A2310), cel-layered flat shading,
 * and maroon/gold/walnut palette of TheaterStage2D.
 */
export function CikguKancil2D({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 340"
      className={`overflow-visible select-none ${className}`}
      role="img"
      aria-label="Ilustrasi 2D Cikgu Kancil berdiri di atas pentas utama menyambut murid"
    >
      <defs>
        <radialGradient id="wandGlow2D" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF7C2" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#F5B82E" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#F5B82E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cute fluffy tail behind hip */}
      <g>
        <path
          d="M72 222 C44 214, 34 190, 48 178 C60 174, 72 192, 78 212 Z"
          fill="#B6632B"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M47 183 C52 178, 63 185, 65 198 C56 198, 48 193, 47 183 Z"
          fill="#FFF3D6"
        />
      </g>

      {/* Legs & dark hooves standing squarely on stage */}
      <g>
        {/* Left leg */}
        <path
          d="M95 258 L92 308 C92 315, 108 315, 110 308 L114 258 Z"
          fill="#A65522"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Left hoof */}
        <path
          d="M88 308 C88 302, 112 302, 113 308 L115 322 C115 327, 86 327, 86 322 Z"
          fill="#3E1D0C"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M100 310 L100 325" stroke="#281106" strokeWidth="2" strokeLinecap="round" />

        {/* Right leg */}
        <path
          d="M144 258 L148 308 C150 315, 166 315, 166 308 L162 258 Z"
          fill="#B6632B"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Right hoof */}
        <path
          d="M145 308 C146 302, 170 302, 170 308 L172 322 C172 327, 143 327, 143 322 Z"
          fill="#3E1D0C"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M157 310 L157 325" stroke="#281106" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Lower fur body & cream belly */}
      <g>
        <ellipse
          cx="128"
          cy="228"
          rx="52"
          ry="50"
          fill="#B6632B"
          stroke="#4A2310"
          strokeWidth="3"
        />
        {/* Soft flat cel-shadow on left hip */}
        <path
          d="M80 226 C78 255, 102 276, 128 276 C106 270, 92 250, 92 222 Z"
          fill="#984C1D"
        />
        {/* Cream belly */}
        <ellipse cx="132" cy="242" rx="28" ry="30" fill="#FFF3D6" />
        {/* White hip spots */}
        <circle cx="92" cy="218" r="3.2" fill="#FFF3D6" opacity="0.9" />
        <circle cx="84" cy="231" r="2.6" fill="#FFF3D6" opacity="0.9" />
        <circle cx="97" cy="236" r="2.8" fill="#FFF3D6" opacity="0.9" />
      </g>

      {/* Left arm (holding wand base) */}
      <g>
        <path
          d="M84 156 C62 162, 54 188, 68 202 C78 212, 98 208, 108 198 L104 182 C92 188, 80 184, 86 168 Z"
          fill="#FFF8E6"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Cuff fold */}
        <path
          d="M95 184 L106 198"
          stroke="#E5CFA0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Paw */}
        <ellipse
          cx="111"
          cy="192"
          rx="11"
          ry="9"
          transform="rotate(-15 111 192)"
          fill="#8E451B"
          stroke="#4A2310"
          strokeWidth="2.8"
        />
      </g>

      {/* Right arm (raised cheerfully holding wand) */}
      <g>
        <path
          d="M168 156 C194 164, 206 184, 194 198 C184 208, 170 202, 168 186 Z"
          fill="#FFF8E6"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Paw */}
        <ellipse
          cx="190"
          cy="176"
          rx="10.5"
          ry="9"
          transform="rotate(20 190 176)"
          fill="#9E4F22"
          stroke="#4A2310"
          strokeWidth="2.8"
        />
      </g>

      {/* Shirt, Bowtie & Embroidered Maroon Waistcoat */}
      <g>
        {/* Cream dress shirt */}
        <path
          d="M90 150 C90 140, 166 140, 166 150 L168 214 C150 226, 106 226, 88 214 Z"
          fill="#FFF9E8"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Shirt collar */}
        <path
          d="M104 146 L128 164 L112 168 L96 154 Z"
          fill="#FFF3D6"
          stroke="#4A2310"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M152 146 L128 164 L144 168 L160 154 Z"
          fill="#FFF3D6"
          stroke="#4A2310"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Maroon velvet waistcoat */}
        <path
          d="M90 150 L106 148 L128 182 L150 148 L166 150 L172 216 C158 228, 142 232, 128 220 C114 232, 98 228, 84 216 Z"
          fill="#75122F"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Left vest shadow plane */}
        <path
          d="M90 150 L106 148 L114 222 C102 225, 92 222, 84 216 Z"
          fill="#580B22"
        />
        {/* Golden trim piping along waistcoat edges */}
        <path
          d="M106 151 L128 183 L150 151"
          fill="none"
          stroke="#F3B73F"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M87 214 C99 225, 114 228, 128 217 C142 228, 157 225, 169 214"
          fill="none"
          stroke="#F3B73F"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        {/* Delicate 2D gold filigree curls on vest */}
        <path
          d="M93 206 Q102 198 110 207 M146 207 Q154 198 163 206"
          fill="none"
          stroke="#F3B73F"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* 3 Gold vest buttons */}
        <circle cx="128" cy="190" r="3.2" fill="#F6C445" stroke="#4A2310" strokeWidth="1.6" />
        <circle cx="128" cy="201" r="3.2" fill="#F6C445" stroke="#4A2310" strokeWidth="1.6" />
        <circle cx="128" cy="212" r="3.2" fill="#F6C445" stroke="#4A2310" strokeWidth="1.6" />

        {/* Cute brown bowtie */}
        <path
          d="M111 153 C111 149, 124 154, 128 158 C124 162, 111 167, 111 163 Z"
          fill="#8A5229"
          stroke="#4A2310"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M145 153 C145 149, 132 154, 128 158 C132 162, 145 167, 145 163 Z"
          fill="#8A5229"
          stroke="#4A2310"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <rect
          x="124"
          y="154"
          width="8"
          height="8"
          rx="3"
          fill="#6B3C1B"
          stroke="#4A2310"
          strokeWidth="2.2"
        />
      </g>

      {/* Slim Golden Conductor's Wand held neatly in hands */}
      <g>
        <circle cx="233" cy="144" r="24" fill="url(#wandGlow2D)" />
        <line
          x1="100"
          y1="201"
          x2="230"
          y2="146"
          stroke="#4A2310"
          strokeWidth="7.5"
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="201"
          x2="230"
          y2="146"
          stroke="#F6C445"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <line
          x1="145"
          y1="182"
          x2="230"
          y2="146"
          stroke="#FFF3B0"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Re-draw front fingers gripping wand */}
        <ellipse
          cx="111"
          cy="194"
          rx="10"
          ry="7.5"
          transform="rotate(-20 111 194)"
          fill="#9E4F22"
          stroke="#4A2310"
          strokeWidth="2.6"
        />
        <ellipse
          cx="190"
          cy="168"
          rx="9.5"
          ry="7.5"
          transform="rotate(20 190 168)"
          fill="#A65522"
          stroke="#4A2310"
          strokeWidth="2.6"
        />
        {/* Small 2D sparkle star at wand tip */}
        <path
          d="M233 132 L236 141 L245 144 L236 147 L233 156 L230 147 L221 144 L230 141 Z"
          fill="#FFF7C2"
          stroke="#D98A1A"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Head, Ears, Friendly Face & Round Gold Glasses */}
      <g>
        {/* Left ear */}
        <path
          d="M78 72 C46 56, 36 30, 50 22 C66 16, 88 32, 94 56 Z"
          fill="#B6632B"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M78 66 C56 54, 49 36, 57 30 C67 26, 82 38, 87 54 Z"
          fill="#F2A68D"
          stroke="#4A2310"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Right ear */}
        <path
          d="M178 72 C210 56, 220 30, 206 22 C190 16, 168 32, 162 56 Z"
          fill="#B6632B"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M178 66 C200 54, 207 36, 199 30 C189 26, 174 38, 169 54 Z"
          fill="#F2A68D"
          stroke="#4A2310"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Head base with playful hair tuft */}
        <path
          d="M114 34 C118 22, 128 20, 131 30 C138 22, 146 26, 144 36 C172 42, 192 66, 190 98 C188 132, 162 150, 128 150 C94 150, 68 132, 66 98 C64 66, 86 42, 114 34 Z"
          fill="#B6632B"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Soft 2D flat cel-shadow along left cheek */}
        <path
          d="M70 98 C70 128, 94 146, 124 147 C96 142, 82 122, 82 94 C82 72, 92 54, 108 42 C82 52, 70 72, 70 98 Z"
          fill="#984C1D"
        />

        {/* Cream forehead blaze & snout cheeks */}
        <path
          d="M128 60 C116 60, 112 78, 108 92 C92 98, 86 118, 98 134 C108 144, 148 144, 158 134 C170 118, 164 98, 148 92 C144 78, 140 60, 128 60 Z"
          fill="#FFF3D6"
        />

        {/* White spots on forehead & cheeks */}
        <circle cx="112" cy="48" r="2.8" fill="#FFF3D6" />
        <circle cx="128" cy="44" r="3.2" fill="#FFF3D6" />
        <circle cx="144" cy="48" r="2.8" fill="#FFF3D6" />
        <circle cx="120" cy="56" r="2.2" fill="#FFF3D6" />
        <circle cx="137" cy="56" r="2.2" fill="#FFF3D6" />
        <circle cx="80" cy="112" r="2.6" fill="#FFF3D6" opacity="0.9" />
        <circle cx="87" cy="120" r="2.2" fill="#FFF3D6" opacity="0.9" />

        {/* Expressive eyebrows */}
        <path
          d="M90 66 Q102 60 113 66"
          fill="none"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M143 66 Q154 60 166 66"
          fill="none"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Rosy cheeks */}
        <ellipse cx="88" cy="108" rx="9" ry="5" fill="#F29E85" opacity="0.55" />
        <ellipse cx="168" cy="108" rx="9" ry="5" fill="#F29E85" opacity="0.55" />

        {/* Large cheerful 2D eyes */}
        <g>
          <ellipse cx="104" cy="86" rx="13" ry="14" fill="#FFFFFF" stroke="#4A2310" strokeWidth="2.4" />
          <ellipse cx="106" cy="87" rx="9.5" ry="10.5" fill="#3B1D0E" />
          <circle cx="106" cy="87" r="5" fill="#1C0C05" />
          <circle cx="102" cy="82" r="3.4" fill="#FFFFFF" />
          <circle cx="110" cy="92" r="1.6" fill="#FFFFFF" />

          <ellipse cx="152" cy="86" rx="13" ry="14" fill="#FFFFFF" stroke="#4A2310" strokeWidth="2.4" />
          <ellipse cx="150" cy="87" rx="9.5" ry="10.5" fill="#3B1D0E" />
          <circle cx="150" cy="87" r="5" fill="#1C0C05" />
          <circle cx="146" cy="82" r="3.4" fill="#FFFFFF" />
          <circle cx="154" cy="92" r="1.6" fill="#FFFFFF" />
        </g>

        {/* Cute nose & warm welcoming smile */}
        <ellipse cx="128" cy="104" rx="9.5" ry="6.5" fill="#3E1D0C" stroke="#4A2310" strokeWidth="2" />
        <ellipse cx="125" cy="102" rx="3.2" ry="1.6" fill="#A67C65" opacity="0.65" />

        <path
          d="M111 118 Q128 131 145 118"
          fill="none"
          stroke="#4A2310"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M116 121 Q128 138 140 121 Q128 126 116 121 Z"
          fill="#8C2332"
          stroke="#4A2310"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M122 128 Q128 133 134 128 Q128 125 122 128 Z" fill="#F07B7B" />

        {/* Round Gold-Rimmed Glasses */}
        <g>
          {/* Temple arms */}
          <line x1="68" y1="84" x2="84" y2="87" stroke="#4A2310" strokeWidth="4" strokeLinecap="round" />
          <line x1="68" y1="84" x2="84" y2="87" stroke="#F3B73F" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="172" y1="87" x2="188" y2="84" stroke="#4A2310" strokeWidth="4" strokeLinecap="round" />
          <line x1="172" y1="87" x2="188" y2="84" stroke="#F3B73F" strokeWidth="2.2" strokeLinecap="round" />

          {/* Bridge */}
          <path d="M123 86 Q128 81 133 86" fill="none" stroke="#4A2310" strokeWidth="4.4" strokeLinecap="round" />
          <path d="M123 86 Q128 81 133 86" fill="none" stroke="#F6C445" strokeWidth="2.4" strokeLinecap="round" />

          {/* Rims */}
          <circle cx="104" cy="87" r="19" fill="rgba(255,253,244,0.12)" stroke="#4A2310" strokeWidth="4.6" />
          <circle cx="104" cy="87" r="19" fill="none" stroke="#F6C445" strokeWidth="2.6" />

          <circle cx="152" cy="87" r="19" fill="rgba(255,253,244,0.12)" stroke="#4A2310" strokeWidth="4.6" />
          <circle cx="152" cy="87" r="19" fill="none" stroke="#F6C445" strokeWidth="2.6" />
        </g>
      </g>
    </svg>
  );
}

/**
 * 2D Flat Illustrated Storybook Theater Stage
 * Unified vector art: warm golden-brown/champagne arched backdrop, wide-open
 * maroon velvet curtains with gold tie-backs, walnut wooden plank stage floor,
 * glowing 2D magic storybook centerpiece, and twinkling stars.
 */
export default function TheaterStage2D({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#F9EAC2] select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Back Wall, Royal Theater Arch, Spotlights, Stars & Center Magic Storybook */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          {/* Warm dark brown -> golden brown -> champagne -> amber center glow */}
          <radialGradient id="royalBackdrop2D" cx="50%" cy="48%" r="62%">
            <stop offset="0%" stopColor="#F9E5AF" />
            <stop offset="28%" stopColor="#E4B260" />
            <stop offset="56%" stopColor="#A66829" />
            <stop offset="82%" stopColor="#66391B" />
            <stop offset="100%" stopColor="#462411" />
          </radialGradient>

          {/* Soft 2D spotlight cones */}
          <linearGradient id="spotConeCenter2D" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFF6CC" stopOpacity="0.34" />
            <stop offset="70%" stopColor="#F5B82E" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F5B82E" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="spotConeLeft2D" x1="30%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="#FFE9A3" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F5B82E" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="bookGlow2D" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.92" />
            <stop offset="48%" stopColor="#F7C64E" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#F5B82E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Warm golden-brown & champagne backdrop */}
        <rect x="0" y="0" width="1440" height="900" fill="url(#royalBackdrop2D)" />

        {/* Subtle flat tapestry stripes on inner wall */}
        <g opacity="0.12">
          {[180, 260, 340, 420, 500, 580, 660, 740, 820, 900, 980, 1060, 1140, 1220].map((x) => (
            <rect key={x} x={x} y="60" width="38" height="620" fill="#FFF4D2" />
          ))}
        </g>

        {/* Elegant Royal Theater Architectural Arches & Moldings */}
        <g>
          {/* Outer champagne-gold architectural arch */}
          <path
            d="M230 670 L230 370 A490 340 0 0 1 1210 370 L1210 670"
            fill="none"
            stroke="#592F14"
            strokeWidth="16"
          />
          <path
            d="M230 670 L230 370 A490 340 0 0 1 1210 370 L1210 670"
            fill="none"
            stroke="#F3C14B"
            strokeWidth="10"
          />
          {/* Inner decorative scalloped arch molding */}
          <path
            d="M275 660 L275 385 A445 305 0 0 1 1165 385 L1165 660"
            fill="none"
            stroke="#FDE293"
            strokeWidth="3"
            strokeDasharray="12 10"
            opacity="0.72"
          />
        </g>

        {/* Soft 2D Spotlight Beams */}
        <polygon points="620,70 820,70 980,680 460,680" fill="url(#spotConeCenter2D)" />
        <polygon points="360,80 480,80 540,700 180,700" fill="url(#spotConeLeft2D)" />

        {/* Subtle Hanging Fairy Garland & Small Warm Glows */}
        <g opacity="0.88">
          <path
            d="M245 255 Q480 325 720 285 Q960 325 1195 255"
            fill="none"
            stroke="#7A441A"
            strokeWidth="2.5"
          />
          {[
            { cx: 310, cy: 274 },
            { cx: 390, cy: 292 },
            { cx: 475, cy: 300 },
            { cx: 560, cy: 298 },
            { cx: 645, cy: 290 },
            { cx: 795, cy: 290 },
            { cx: 880, cy: 298 },
            { cx: 965, cy: 300 },
            { cx: 1050, cy: 292 },
            { cx: 1130, cy: 274 }
          ].map((bulb, idx) => (
            <g key={idx}>
              <circle cx={bulb.cx} cy={bulb.cy} r="13" fill="#FDE68A" opacity="0.28" />
              <circle
                cx={bulb.cx}
                cy={bulb.cy}
                r="5.5"
                fill="#FFF8D6"
                stroke="#8A4B08"
                strokeWidth="1.8"
              />
            </g>
          ))}
        </g>

        {/* Twinkling 2D Storybook Stars */}
        <g>
          {[
            { x: 430, y: 365, s: 1.0, d: '0s' },
            { x: 520, y: 420, s: 0.75, d: '0.7s' },
            { x: 590, y: 338, s: 0.9, d: '1.4s' },
            { x: 855, y: 345, s: 0.95, d: '0.4s' },
            { x: 930, y: 425, s: 0.8, d: '1.1s' },
            { x: 1010, y: 365, s: 1.05, d: '1.8s' },
            { x: 655, y: 392, s: 0.65, d: '0.9s' },
            { x: 785, y: 388, s: 0.7, d: '1.6s' }
          ].map((st, idx) => (
            <g
              key={idx}
              transform={`translate(${st.x}, ${st.y}) scale(${st.s})`}
              className="animate-twinkle"
              style={{ animationDelay: st.d }}
            >
              <path
                d="M0 -14 L3.5 -3.5 L14 0 L3.5 3.5 L0 14 L-3.5 3.5 L-14 0 L-3.5 -3.5 Z"
                fill="#FFF6BD"
                stroke="#B46914"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </g>
          ))}
        </g>

        {/* Centerpiece: 2D Illustrated Wooden & Gold Pedestal + Open Magic Storybook */}
        <g transform="translate(720, 560)">
          {/* Pedestal contact shadow on floor */}
          <ellipse cx="0" cy="116" rx="76" ry="15" fill="#43200B" opacity="0.34" />

          {/* Pedestal Base */}
          <path
            d="M-54 102 L54 102 L64 116 L-64 116 Z"
            fill="#F3B73F"
            stroke="#4A2310"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect
            x="-44"
            y="90"
            width="88"
            height="12"
            rx="4"
            fill="#D99024"
            stroke="#4A2310"
            strokeWidth="2.8"
          />

          {/* Pedestal Column */}
          <path
            d="M-24 22 L24 22 L32 90 L-32 90 Z"
            fill="#753B1B"
            stroke="#4A2310"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M-24 22 L-8 22 L-12 90 L-32 90 Z" fill="#5D2D13" />
          <line x1="0" y1="28" x2="0" y2="84" stroke="#F3B73F" strokeWidth="2.5" strokeLinecap="round" />

          {/* Pedestal Top Crown */}
          <path
            d="M-56 4 L56 4 L40 22 L-40 22 Z"
            fill="#F6C445"
            stroke="#4A2310"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Soft golden storybook aura */}
          <circle cx="0" cy="-42" r="88" fill="url(#bookGlow2D)" />

          {/* Floating Open 2D Storybook */}
          <g transform="translate(0, -34)">
            {/* Leather cover */}
            <path
              d="M-78 -4 L0 14 L78 -4 L72 16 L0 30 L-72 16 Z"
              fill="#7A2B11"
              stroke="#4A2310"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Cream pages */}
            <path
              d="M-70 -10 Q-34 -24 0 -4 Q34 -24 70 -10 L66 10 Q32 -2 0 14 Q-32 -2 -66 10 Z"
              fill="#FFFDF2"
              stroke="#4A2310"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Center book spine crease */}
            <line x1="0" y1="-4" x2="0" y2="16" stroke="#C98A3A" strokeWidth="2.4" />
            {/* Tiny illustrated lines on pages */}
            <path
              d="M-52 -4 Q-30 -12 -14 -3 M-50 4 Q-30 -3 -14 4 M14 -3 Q30 -12 52 -4 M14 4 Q30 -3 50 4"
              fill="none"
              stroke="#D2A76A"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Floating 2D magic star above book */}
            <path
              d="M0 -54 L5 -38 L21 -33 L5 -28 L0 -12 L-5 -28 L-21 -33 L-5 -38 Z"
              fill="#FFE97D"
              stroke="#9A5B13"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* Illustrated Medium-Dark Walnut Wooden Stage Floor */}
        <g>
          {/* Stage apron base */}
          <path
            d="M0 662 Q720 634 1440 662 L1440 900 L0 900 Z"
            fill="#6E3E20"
            stroke="#4A2310"
            strokeWidth="3.5"
          />

          {/* Alternating flat-layered walnut floor planks with soft perspective */}
          <path d="M0 688 Q720 662 1440 688 L1440 726 Q720 704 0 726 Z" fill="#63361B" />
          <path d="M0 726 Q720 704 1440 726 L1440 768 Q720 748 0 768 Z" fill="#774424" />
          <path d="M0 768 Q720 748 1440 768 L1440 816 Q720 798 0 816 Z" fill="#66381C" />
          <path d="M0 816 Q720 798 1440 816 L1440 900 L0 900 Z" fill="#5B3017" />

          {/* Soft golden spotlight reflection pool across center floor */}
          <ellipse cx="720" cy="708" rx="340" ry="42" fill="#F8D27A" opacity="0.22" />

          {/* Horizontal plank seam lines */}
          <path d="M0 688 Q720 662 1440 688" fill="none" stroke="#4A2310" strokeWidth="2.4" />
          <path d="M0 726 Q720 704 1440 726" fill="none" stroke="#4A2310" strokeWidth="2.6" />
          <path d="M0 768 Q720 748 1440 768" fill="none" stroke="#4A2310" strokeWidth="2.8" />
          <path d="M0 816 Q720 798 1440 816" fill="none" stroke="#4A2310" strokeWidth="2.8" />

          {/* Perspective vertical plank joints */}
          {[
            [220, 668, 130, 880],
            [420, 656, 370, 880],
            [620, 648, 600, 880],
            [820, 648, 840, 880],
            [1020, 656, 1070, 880],
            [1220, 668, 1310, 880]
          ].map(([x1, y1, x2, y2], idx) => (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#4A2310"
              strokeWidth="2.2"
              opacity="0.72"
            />
          ))}

          {/* Hand-illustrated 2D walnut wood grain swirls */}
          <g fill="none" stroke="#4A2310" strokeWidth="1.8" strokeLinecap="round" opacity="0.38">
            <path d="M120 744 Q180 738 240 744" />
            <path d="M310 706 Q360 701 415 706" />
            <path d="M490 790 Q570 783 650 790" />
            <path d="M840 748 Q910 742 985 748" />
            <path d="M1050 792 Q1125 786 1190 792" />
            <path d="M1190 712 Q1250 707 1310 712" />
            <ellipse cx="285" cy="788" rx="16" ry="4" />
            <ellipse cx="1010" cy="710" rx="14" ry="3.5" />
          </g>

          {/* Golden stage apron trim molding along front edge */}
          <path
            d="M0 788 Q720 764 1440 788 L1440 804 Q720 780 0 804 Z"
            fill="#F3B73F"
            stroke="#4A2310"
            strokeWidth="3"
          />

          {/* Cute 2D golden footlights along front apron */}
          {[280, 460, 630, 810, 980, 1160].map((fx, idx) => {
            const fy = 774 + Math.abs(720 - fx) * 0.018;
            return (
              <g key={idx}>
                <ellipse cx={fx} cy={fy + 4} rx="22" ry="11" fill="#FDE68A" opacity="0.45" />
                <path
                  d={`M${fx - 11} ${fy + 8} Q${fx} ${fy - 10} ${fx + 11} ${fy + 8} Z`}
                  fill="#FFF4B8"
                  stroke="#4A2310"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                <rect
                  x={fx - 13}
                  y={fy + 7}
                  width="26"
                  height="6"
                  rx="2.5"
                  fill="#D99024"
                  stroke="#4A2310"
                  strokeWidth="2.2"
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* 2. Side Proscenium Columns & Wide-Open Maroon Velvet Curtains (pinned cleanly to left & right edges on any viewport) */}
      <svg
        viewBox="0 0 260 900"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 h-full w-[17vw] min-w-[78px] max-w-[260px]"
      >
        {/* Left ivory & gold proscenium pillar */}
        <rect x="0" y="30" width="52" height="670" fill="#F9EBC4" stroke="#4A2310" strokeWidth="3" />
        <line x1="18" y1="50" x2="18" y2="680" stroke="#DFC487" strokeWidth="3" />
        <line x1="34" y1="50" x2="34" y2="680" stroke="#DFC487" strokeWidth="3" />
        <rect x="0" y="660" width="66" height="44" rx="4" fill="#7D411E" stroke="#4A2310" strokeWidth="3" />

        {/* Left wide-open gathered maroon velvet curtain */}
        <path
          d="M14 0 L240 0 C220 140, 200 280, 148 410 C192 520, 212 630, 216 742 L14 742 Z"
          fill="#73112E"
          stroke="#4A2310"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Soft fold layers */}
        <path
          d="M14 0 L92 0 C82 150, 74 290, 96 410 C80 530, 88 640, 96 742 L14 742 Z"
          fill="#580B22"
        />
        <path
          d="M126 0 L176 0 C162 150, 148 280, 128 410 C150 530, 160 640, 166 742 L130 742 C122 635, 114 525, 108 410 C122 280, 126 150, 126 0 Z"
          fill="#8A193A"
        />
        {/* Golden edge piping along inner drape */}
        <path
          d="M236 0 C216 140, 196 280, 144 410 C188 520, 208 630, 212 742"
          fill="none"
          stroke="#F3B73F"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Golden tie-back band & hanging tassel */}
        <path
          d="M12 396 Q90 426 154 406 L150 424 Q88 444 12 414 Z"
          fill="#F6C445"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M144 422 L134 458 L156 458 Z"
          fill="#F3B73F"
          stroke="#4A2310"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="145" cy="420" r="7" fill="#FFE68C" stroke="#4A2310" strokeWidth="2.5" />
      </svg>

      <svg
        viewBox="0 0 260 900"
        preserveAspectRatio="none"
        className="absolute top-0 right-0 h-full w-[17vw] min-w-[78px] max-w-[260px]"
      >
        {/* Right ivory & gold proscenium pillar */}
        <rect x="208" y="30" width="52" height="670" fill="#F9EBC4" stroke="#4A2310" strokeWidth="3" />
        <line x1="226" y1="50" x2="226" y2="680" stroke="#DFC487" strokeWidth="3" />
        <line x1="242" y1="50" x2="242" y2="680" stroke="#DFC487" strokeWidth="3" />
        <rect x="194" y="660" width="66" height="44" rx="4" fill="#7D411E" stroke="#4A2310" strokeWidth="3" />

        {/* Right wide-open gathered maroon velvet curtain */}
        <path
          d="M246 0 L20 0 C40 140, 60 280, 112 410 C68 520, 48 630, 44 742 L246 742 Z"
          fill="#73112E"
          stroke="#4A2310"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M246 0 L168 0 C178 150, 186 290, 164 410 C180 530, 172 640, 164 742 L246 742 Z"
          fill="#580B22"
        />
        <path
          d="M134 0 L84 0 C98 150, 112 280, 132 410 C110 530, 100 640, 94 742 L130 742 C138 635, 146 525, 152 410 C138 280, 134 150, 134 0 Z"
          fill="#8A193A"
        />
        {/* Golden edge piping along inner drape */}
        <path
          d="M24 0 C44 140, 64 280, 116 410 C72 520, 52 630, 48 742"
          fill="none"
          stroke="#F3B73F"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Golden tie-back band & hanging tassel */}
        <path
          d="M248 396 Q170 426 106 406 L110 424 Q172 444 248 414 Z"
          fill="#F6C445"
          stroke="#4A2310"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M116 422 L104 458 L126 458 Z"
          fill="#F3B73F"
          stroke="#4A2310"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="115" cy="420" r="7" fill="#FFE68C" stroke="#4A2310" strokeWidth="2.5" />
      </svg>

      {/* 3. Top Scalloped Maroon Valance with Gold Fringe */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full h-[54px] sm:h-[78px] md:h-[92px]"
      >
        <path
          d="M0 0 L1440 0 L1440 58 Q1320 94 1200 58 Q1080 94 960 58 Q840 94 720 58 Q600 94 480 58 Q360 94 240 58 Q120 94 0 58 Z"
          fill="#630D27"
          stroke="#4A2310"
          strokeWidth="3.5"
        />
        <path
          d="M0 58 Q120 94 240 58 Q360 94 480 58 Q600 94 720 58 Q840 94 960 58 Q1080 94 1200 58 Q1320 94 1440 58"
          fill="none"
          stroke="#F3B73F"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
