// Built-in high quality SVG data textures and UV guides

// 1. Dortmund Style Pattern (Yellow & Black with sleeve & collar trims)
const createDortmundPattern = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFDD00"/>
        <stop offset="100%" stop-color="#E5C700"/>
      </linearGradient>
      <pattern id="jerseyWeave" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="1.5" fill="#CBB000" opacity="0.4"/>
        <circle cx="15" cy="15" r="1.5" fill="#CBB000" opacity="0.4"/>
      </pattern>
      <pattern id="diagStripes" width="40" height="40" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="40" stroke="#000000" stroke-width="8" opacity="0.08"/>
      </pattern>
    </defs>
    <!-- Background Base -->
    <rect width="1024" height="1024" fill="url(#yellowGrad)"/>
    <rect width="1024" height="1024" fill="url(#jerseyWeave)"/>
    <rect width="1024" height="1024" fill="url(#diagStripes)"/>

    <!-- Dynamic Shoulder & Chest Accents -->
    <path d="M 0 0 L 1024 0 L 1024 220 C 750 180 274 180 0 220 Z" fill="#141414"/>
    <path d="M 0 220 C 274 180 750 180 1024 220 L 1024 250 C 750 210 274 210 0 250 Z" fill="#FFFFFF"/>

    <!-- Subtle Jacquard Geometric Pattern -->
    <g opacity="0.12">
      <path d="M 200 350 L 300 450 L 200 550 L 100 450 Z" fill="#000"/>
      <path d="M 512 300 L 612 400 L 512 500 L 412 400 Z" fill="#000"/>
      <path d="M 824 350 L 924 450 L 824 550 L 724 450 Z" fill="#000"/>
      <path d="M 356 550 L 456 650 L 356 750 L 256 650 Z" fill="#000"/>
      <path d="M 668 550 L 768 650 L 668 750 L 568 650 Z" fill="#000"/>
    </g>

    <!-- Side Vent Stripe Panels -->
    <rect x="0" y="400" width="70" height="600" fill="#141414"/>
    <rect x="70" y="400" width="15" height="600" fill="#FFFFFF"/>
    <rect x="954" y="400" width="70" height="600" fill="#141414"/>
    <rect x="939" y="400" width="15" height="600" fill="#FFFFFF"/>

    <!-- Sleeve Trim details -->
    <rect x="0" y="900" width="1024" height="40" fill="#141414"/>
    <rect x="0" y="940" width="1024" height="20" fill="#FFFFFF"/>
    <rect x="0" y="960" width="1024" height="64" fill="#141414"/>

    <!-- Center Sponsor / Crest Layout -->
    <circle cx="320" cy="360" r="48" fill="#141414"/>
    <circle cx="320" cy="360" r="44" fill="#FFDD00"/>
    <polygon points="320,330 330,352 355,352 335,368 342,392 320,376 298,392 305,368 285,352 310,352" fill="#141414"/>

    <!-- Brand Emblem Right -->
    <path d="M 680 340 Q 720 370 760 340 Q 720 380 680 340 Z" fill="#141414"/>

    <!-- Main Front Sponsor -->
    <rect x="262" y="490" width="500" height="90" rx="16" fill="#141414"/>
    <text x="512" y="550" font-family="'Sora', 'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">EDITOR SUITE</text>
    <text x="512" y="572" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#FFDD00" text-anchor="middle" letter-spacing="6">EST. 2026</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// 2. Red Owl Emblem (exact signature graphic from video 00:00)
const createOwlLogoGraphic = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <!-- Red Badge Rounded Box -->
    <rect x="80" y="80" width="640" height="640" rx="90" fill="#D3122A"/>
    <!-- Stylized Mask / Owl Eyes in White -->
    <path d="M 200 320 C 230 260 320 270 380 320 C 350 380 250 390 200 320 Z" fill="#FFFFFF"/>
    <path d="M 600 320 C 570 260 480 270 420 320 C 450 380 550 390 600 320 Z" fill="#FFFFFF"/>
    <!-- Brow Aggressive Arch -->
    <path d="M 170 290 Q 400 350 630 290 Q 560 250 400 270 Q 240 250 170 290 Z" fill="#FFFFFF"/>
    <!-- Pupils / Horns -->
    <polygon points="400,340 370,410 430,410" fill="#FFFFFF"/>
    <!-- Sharp Beak -->
    <path d="M 360 430 L 440 430 L 400 520 Z" fill="#FFFFFF"/>
    <!-- Feather Accents -->
    <path d="M 230 450 C 290 530 330 570 400 590 C 340 550 280 500 230 450 Z" fill="#FFFFFF" opacity="0.95"/>
    <path d="M 570 450 C 510 530 470 570 400 590 C 460 550 520 500 570 450 Z" fill="#FFFFFF" opacity="0.95"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// 3. Cyber Strike Minimalist Graphic
const createCyberGraphic = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <circle cx="400" cy="400" r="300" fill="none" stroke="#DB0B2B" stroke-width="12" opacity="0.7"/>
    <circle cx="400" cy="400" r="240" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="16, 12"/>
    <polygon points="400,180 580,520 220,520" fill="none" stroke="#DB0B2B" stroke-width="16"/>
    <text x="400" y="440" font-family="'Sora', sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="8">STUDIO</text>
    <text x="400" y="480" font-family="'Inter', sans-serif" font-size="20" font-weight="600" fill="#DB0B2B" text-anchor="middle" letter-spacing="12">EDITION 01</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// 4. UV Guide Overlay Wireframe (Torso front, back, sleeves layout)
export const createUVGuideOverlay = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <!-- Center Dividing Line -->
    <line x1="512" y1="0" x2="512" y2="1024" stroke="#DB0B2B" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.5"/>
    <line x1="0" y1="512" x2="1024" y2="512" stroke="#DB0B2B" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.5"/>

    <!-- Left: Front Torso Outline -->
    <path d="M 120 180 C 180 120 240 100 320 120 C 400 100 460 120 500 180 L 480 880 C 320 890 280 890 140 880 Z" 
          fill="none" stroke="#00FFFF" stroke-width="2" stroke-dasharray="4,4" opacity="0.7"/>
    <text x="310" y="220" font-family="Inter, sans-serif" font-size="20" font-weight="bold" fill="#00FFFF" opacity="0.8" text-anchor="middle">FRONT TORSO</text>

    <!-- Right: Back Torso Outline -->
    <path d="M 524 180 C 564 120 624 100 704 120 C 784 100 844 120 904 180 L 884 880 C 724 890 684 890 544 880 Z" 
          fill="none" stroke="#FF00FF" stroke-width="2" stroke-dasharray="4,4" opacity="0.7"/>
    <text x="714" y="220" font-family="Inter, sans-serif" font-size="20" font-weight="bold" fill="#FF00FF" opacity="0.8" text-anchor="middle">BACK TORSO</text>

    <!-- Sleeves Guides Top -->
    <rect x="60" y="60" width="160" height="90" rx="8" fill="none" stroke="#FFFF00" stroke-width="2" opacity="0.6"/>
    <text x="140" y="110" font-family="Inter, sans-serif" font-size="14" fill="#FFFF00" opacity="0.8" text-anchor="middle">L. SLEEVE</text>

    <rect x="804" y="60" width="160" height="90" rx="8" fill="none" stroke="#FFFF00" stroke-width="2" opacity="0.6"/>
    <text x="884" y="110" font-family="Inter, sans-serif" font-size="14" fill="#FFFF00" opacity="0.8" text-anchor="middle">R. SLEEVE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const sampleDesigns = [
  {
    id: 'sample-owl',
    name: 'Red Owl Mascot',
    src: createOwlLogoGraphic(),
    category: 'Logos',
    defaultScale: 0.38,
  },
  {
    id: 'sample-dortmund',
    name: 'BVB Pro Kit Pattern',
    src: createDortmundPattern(),
    category: 'Full Kits',
    defaultScale: 1.0,
  },
  {
    id: 'sample-cyber',
    name: 'Cyber Emblem',
    src: createCyberGraphic(),
    category: 'Graphics',
    defaultScale: 0.35,
  },
];
