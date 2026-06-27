// ─── Master Theme File ────────────────────────────────────────────────────────
// All design tokens live here. Change a value → it cascades everywhere through
// CSS custom properties. To retheme the whole app: edit PALETTE below.

export const BRAND = {
  name: 'CryptoCard Pro',
  tagline: 'Pay with Crypto, Anywhere in the World',
  icon: '#F0B90B',  // polygon fill on the BNB-style logo
};

export const PALETTE = {
  // Brand accent
  gold:         '#F0B90B',
  goldDark:     '#d4a50a',
  goldBg:       'rgba(240,185,11,.1)',
  goldBorder:   'rgba(240,185,11,.25)',
  // Positive / success
  green:        '#0ECB81',
  greenBg:      'rgba(14,203,129,.12)',
  greenBorder:  'rgba(14,203,129,.28)',
  // Negative / danger
  red:          '#F6465D',
  redBg:        'rgba(246,70,93,.12)',
  // Info
  blue:         '#3b82f6',
  blueBg:       'rgba(59,130,246,.12)',
  // Backgrounds
  bg:           '#0B0E11',
  surface1:     '#1E2329',
  surface2:     '#2B3139',
  surface3:     '#363C45',
  // Text
  text:         '#EAECEF',
  text2:        '#B7BDC6',
  text3:        '#848E9C',
  // Borders
  border1:      '#2B3139',
  border2:      '#363C45',
};

// Maps PALETTE → CSS custom properties consumed by cryptocard.module.css.
// Spread this as `style` on the root `.ccApp` element to make theming live.
// Changing any PALETTE color + updating CSS_VARS entry is enough to retheme.
export const CSS_VARS = {
  '--bg':     PALETTE.bg,
  '--s1':     PALETTE.surface1,
  '--s2':     PALETTE.surface2,
  '--s3':     PALETTE.surface3,
  '--bnb':    PALETTE.gold,
  '--bnb2':   PALETTE.goldDark,
  '--bnbg':   PALETTE.goldBg,
  '--bnbd':   PALETTE.goldBorder,
  '--green':  PALETTE.green,
  '--gbg':    PALETTE.greenBg,
  '--gbd':    PALETTE.greenBorder,
  '--red':    PALETTE.red,
  '--rbg':    PALETTE.redBg,
  '--blue':   PALETTE.blue,
  '--bluebg': PALETTE.blueBg,
  '--text':   PALETTE.text,
  '--t2':     PALETTE.text2,
  '--t3':     PALETTE.text3,
  '--bd':     PALETTE.border1,
  '--bd2':    PALETTE.border2,
};

// Virtual card gradient themes. Add bgImage: '/path.jpg' to use a photo instead.
export const CARD_THEMES = [
  {
    id: 'classic', name: 'Classic Dark', sub: 'Default · Stealth Premium',
    bg: `linear-gradient(145deg, ${PALETTE.bg} 0%, #1a1f26 50%, ${PALETTE.surface2} 100%)`,
    accent: PALETTE.gold, text: PALETTE.text, dot: PALETTE.gold,
  },
  {
    id: 'gold', name: 'Gold Edition', sub: 'Signature · BNB Limited',
    bg: 'linear-gradient(145deg, #1a1000 0%, #3d2800 40%, #F0B90B 100%)',
    accent: '#ffdd57', text: '#fff', dot: PALETTE.gold,
  },
  {
    id: 'emerald', name: 'Emerald', sub: 'Nature · Crypto Green',
    bg: 'linear-gradient(145deg, #071a0f 0%, #065f46 55%, #0ECB81 100%)',
    accent: PALETTE.green, text: '#fff', dot: PALETTE.green,
  },
  {
    id: 'ocean', name: 'Ocean Blue', sub: 'Pro · Deep Water',
    bg: 'linear-gradient(145deg, #050d1a 0%, #0f2747 50%, #1d4ed8 100%)',
    accent: '#60a5fa', text: '#fff', dot: PALETTE.blue,
  },
  {
    id: 'royal', name: 'Royal Purple', sub: 'Premium · Prestige',
    bg: 'linear-gradient(145deg, #120020 0%, #3b0764 50%, #7c3aed 100%)',
    accent: '#c4b5fd', text: '#fff', dot: '#a78bfa',
  },
  {
    id: 'rose', name: 'Rose Gold', sub: 'Luxe · Rose Edition',
    bg: 'linear-gradient(145deg, #1a0008 0%, #7f1d3b 45%, #f43f5e 100%)',
    accent: '#fda4af', text: '#fff', dot: '#f43f5e',
  },
];
