// Static content: ticker data, benefit cards, phone codes, form countries.
// Swap TICKER_DATA with a live API feed when going to production.

export const TICKER_DATA = [
  { s: 'BTC',  p: '67,420', c: '+2.4%', up: true  },
  { s: 'ETH',  p: '3,840',  c: '+1.8%', up: true  },
  { s: 'BNB',  p: '612',    c: '+3.1%', up: true  },
  { s: 'USDT', p: '1.00',   c: '0.0%',  up: true  },
  { s: 'SOL',  p: '178',    c: '-0.9%', up: false },
  { s: 'XRP',  p: '0.62',   c: '+1.2%', up: true  },
  { s: 'ADA',  p: '0.48',   c: '-1.4%', up: false },
  { s: 'DOGE', p: '0.14',   c: '+5.2%', up: true  },
];

export const BENEFITS = [
  { icon: 'Globe',  color: '#3b82f6', bg: 'rgba(59,130,246,.12)',  title: '190+ Countries',      desc: 'Amazon, Flipkart, Zomato, petrol pumps & all Visa POS' },
  { icon: 'Zap',    color: '#F0B90B', bg: 'rgba(240,185,11,.1)',   title: '10% Instant Cashback', desc: '10% back on every swipe — auto-credited in USDT' },
  { icon: 'Gift',   color: '#0ECB81', bg: 'rgba(14,203,129,.12)',  title: '100 USDT Bonus',       desc: 'Welcome voucher unlocked on first 100 USDT transaction' },
  { icon: 'Wallet', color: '#a78bfa', bg: 'rgba(139,92,246,.12)',  title: 'Virtual Card FREE',    desc: 'Instant activation, no fees. Optional physical card 10 USDT' },
  { icon: 'Lock',   color: '#0ECB81', bg: 'rgba(14,203,129,.12)',  title: 'Bank Security',        desc: '256-bit SSL + biometric — non-custodial, your keys' },
  { icon: 'Bot',    color: '#F0B90B', bg: 'rgba(240,185,11,.1)',   title: 'AI Fraud Protection',  desc: '24/7 real-time monitoring on every transaction' },
];

// ─── World countries ─────────────────────────────────────────────────────────
// Single source of truth for the apply-form phone-code and country dropdowns.
// Flag emoji are derived from the ISO 3166-1 alpha-2 code so we don't hand-type
// 200 emoji. `dial` is the international dialing code.
const flagFromISO = (iso) =>
  iso.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

// name, iso (alpha-2), dial — kept alphabetical by name.
const RAW_COUNTRIES = [
  ['Afghanistan', 'AF', '+93'],    ['Albania', 'AL', '+355'],       ['Algeria', 'DZ', '+213'],
  ['Andorra', 'AD', '+376'],       ['Angola', 'AO', '+244'],        ['Antigua and Barbuda', 'AG', '+1'],
  ['Argentina', 'AR', '+54'],      ['Armenia', 'AM', '+374'],       ['Australia', 'AU', '+61'],
  ['Austria', 'AT', '+43'],        ['Azerbaijan', 'AZ', '+994'],    ['Bahamas', 'BS', '+1'],
  ['Bahrain', 'BH', '+973'],       ['Bangladesh', 'BD', '+880'],    ['Barbados', 'BB', '+1'],
  ['Belarus', 'BY', '+375'],       ['Belgium', 'BE', '+32'],        ['Belize', 'BZ', '+501'],
  ['Benin', 'BJ', '+229'],         ['Bhutan', 'BT', '+975'],        ['Bolivia', 'BO', '+591'],
  ['Bosnia and Herzegovina', 'BA', '+387'], ['Botswana', 'BW', '+267'], ['Brazil', 'BR', '+55'],
  ['Brunei', 'BN', '+673'],        ['Bulgaria', 'BG', '+359'],      ['Burkina Faso', 'BF', '+226'],
  ['Burundi', 'BI', '+257'],       ['Cambodia', 'KH', '+855'],      ['Cameroon', 'CM', '+237'],
  ['Canada', 'CA', '+1'],          ['Cape Verde', 'CV', '+238'],    ['Central African Republic', 'CF', '+236'],
  ['Chad', 'TD', '+235'],          ['Chile', 'CL', '+56'],          ['China', 'CN', '+86'],
  ['Colombia', 'CO', '+57'],       ['Comoros', 'KM', '+269'],       ['Congo', 'CG', '+242'],
  ['Costa Rica', 'CR', '+506'],    ['Croatia', 'HR', '+385'],       ['Cuba', 'CU', '+53'],
  ['Cyprus', 'CY', '+357'],        ['Czech Republic', 'CZ', '+420'], ['Denmark', 'DK', '+45'],
  ['Djibouti', 'DJ', '+253'],      ['Dominica', 'DM', '+1'],        ['Dominican Republic', 'DO', '+1'],
  ['Ecuador', 'EC', '+593'],       ['Egypt', 'EG', '+20'],          ['El Salvador', 'SV', '+503'],
  ['Equatorial Guinea', 'GQ', '+240'], ['Eritrea', 'ER', '+291'],   ['Estonia', 'EE', '+372'],
  ['Eswatini', 'SZ', '+268'],      ['Ethiopia', 'ET', '+251'],      ['Fiji', 'FJ', '+679'],
  ['Finland', 'FI', '+358'],       ['France', 'FR', '+33'],         ['Gabon', 'GA', '+241'],
  ['Gambia', 'GM', '+220'],        ['Georgia', 'GE', '+995'],       ['Germany', 'DE', '+49'],
  ['Ghana', 'GH', '+233'],         ['Greece', 'GR', '+30'],         ['Grenada', 'GD', '+1'],
  ['Guatemala', 'GT', '+502'],     ['Guinea', 'GN', '+224'],        ['Guinea-Bissau', 'GW', '+245'],
  ['Guyana', 'GY', '+592'],        ['Haiti', 'HT', '+509'],         ['Honduras', 'HN', '+504'],
  ['Hong Kong', 'HK', '+852'],     ['Hungary', 'HU', '+36'],        ['Iceland', 'IS', '+354'],
  ['India', 'IN', '+91'],          ['Indonesia', 'ID', '+62'],      ['Iran', 'IR', '+98'],
  ['Iraq', 'IQ', '+964'],          ['Ireland', 'IE', '+353'],       ['Israel', 'IL', '+972'],
  ['Italy', 'IT', '+39'],          ['Ivory Coast', 'CI', '+225'],   ['Jamaica', 'JM', '+1'],
  ['Japan', 'JP', '+81'],          ['Jordan', 'JO', '+962'],        ['Kazakhstan', 'KZ', '+7'],
  ['Kenya', 'KE', '+254'],         ['Kiribati', 'KI', '+686'],      ['Kuwait', 'KW', '+965'],
  ['Kyrgyzstan', 'KG', '+996'],    ['Laos', 'LA', '+856'],          ['Latvia', 'LV', '+371'],
  ['Lebanon', 'LB', '+961'],       ['Lesotho', 'LS', '+266'],       ['Liberia', 'LR', '+231'],
  ['Libya', 'LY', '+218'],         ['Liechtenstein', 'LI', '+423'], ['Lithuania', 'LT', '+370'],
  ['Luxembourg', 'LU', '+352'],    ['Macau', 'MO', '+853'],         ['Madagascar', 'MG', '+261'],
  ['Malawi', 'MW', '+265'],        ['Malaysia', 'MY', '+60'],       ['Maldives', 'MV', '+960'],
  ['Mali', 'ML', '+223'],          ['Malta', 'MT', '+356'],         ['Marshall Islands', 'MH', '+692'],
  ['Mauritania', 'MR', '+222'],    ['Mauritius', 'MU', '+230'],     ['Mexico', 'MX', '+52'],
  ['Micronesia', 'FM', '+691'],    ['Moldova', 'MD', '+373'],       ['Monaco', 'MC', '+377'],
  ['Mongolia', 'MN', '+976'],      ['Montenegro', 'ME', '+382'],    ['Morocco', 'MA', '+212'],
  ['Mozambique', 'MZ', '+258'],    ['Myanmar', 'MM', '+95'],        ['Namibia', 'NA', '+264'],
  ['Nauru', 'NR', '+674'],         ['Nepal', 'NP', '+977'],         ['Netherlands', 'NL', '+31'],
  ['New Zealand', 'NZ', '+64'],    ['Nicaragua', 'NI', '+505'],     ['Niger', 'NE', '+227'],
  ['Nigeria', 'NG', '+234'],       ['North Korea', 'KP', '+850'],   ['North Macedonia', 'MK', '+389'],
  ['Norway', 'NO', '+47'],         ['Oman', 'OM', '+968'],          ['Pakistan', 'PK', '+92'],
  ['Palau', 'PW', '+680'],         ['Palestine', 'PS', '+970'],     ['Panama', 'PA', '+507'],
  ['Papua New Guinea', 'PG', '+675'], ['Paraguay', 'PY', '+595'],   ['Peru', 'PE', '+51'],
  ['Philippines', 'PH', '+63'],    ['Poland', 'PL', '+48'],         ['Portugal', 'PT', '+351'],
  ['Qatar', 'QA', '+974'],         ['Romania', 'RO', '+40'],        ['Russia', 'RU', '+7'],
  ['Rwanda', 'RW', '+250'],        ['Saint Kitts and Nevis', 'KN', '+1'], ['Saint Lucia', 'LC', '+1'],
  ['Samoa', 'WS', '+685'],         ['San Marino', 'SM', '+378'],    ['Saudi Arabia', 'SA', '+966'],
  ['Senegal', 'SN', '+221'],       ['Serbia', 'RS', '+381'],        ['Seychelles', 'SC', '+248'],
  ['Sierra Leone', 'SL', '+232'],  ['Singapore', 'SG', '+65'],      ['Slovakia', 'SK', '+421'],
  ['Slovenia', 'SI', '+386'],      ['Solomon Islands', 'SB', '+677'], ['Somalia', 'SO', '+252'],
  ['South Africa', 'ZA', '+27'],   ['South Korea', 'KR', '+82'],    ['South Sudan', 'SS', '+211'],
  ['Spain', 'ES', '+34'],          ['Sri Lanka', 'LK', '+94'],      ['Sudan', 'SD', '+249'],
  ['Suriname', 'SR', '+597'],      ['Sweden', 'SE', '+46'],         ['Switzerland', 'CH', '+41'],
  ['Syria', 'SY', '+963'],         ['Taiwan', 'TW', '+886'],        ['Tajikistan', 'TJ', '+992'],
  ['Tanzania', 'TZ', '+255'],      ['Thailand', 'TH', '+66'],       ['Timor-Leste', 'TL', '+670'],
  ['Togo', 'TG', '+228'],          ['Tonga', 'TO', '+676'],         ['Trinidad and Tobago', 'TT', '+1'],
  ['Tunisia', 'TN', '+216'],       ['Turkey', 'TR', '+90'],         ['Turkmenistan', 'TM', '+993'],
  ['Tuvalu', 'TV', '+688'],        ['Uganda', 'UG', '+256'],        ['Ukraine', 'UA', '+380'],
  ['United Arab Emirates', 'AE', '+971'], ['United Kingdom', 'GB', '+44'], ['United States', 'US', '+1'],
  ['Uruguay', 'UY', '+598'],       ['Uzbekistan', 'UZ', '+998'],    ['Vanuatu', 'VU', '+678'],
  ['Vatican City', 'VA', '+379'],  ['Venezuela', 'VE', '+58'],      ['Vietnam', 'VN', '+84'],
  ['Yemen', 'YE', '+967'],         ['Zambia', 'ZM', '+260'],        ['Zimbabwe', 'ZW', '+263'],
];

export const WORLD_COUNTRIES = RAW_COUNTRIES.map(([name, iso, dial]) => ({
  name, iso, dial, flag: flagFromISO(iso),
}));

// A handful of high-traffic markets hoisted to the top of the pickers for
// convenience; the rest follow in alphabetical order.
const POPULAR_ISO = ['IN', 'US', 'GB', 'AE', 'SA', 'PK', 'BD'];
const popular = POPULAR_ISO.map((iso) => WORLD_COUNTRIES.find((c) => c.iso === iso)).filter(Boolean);
const rest    = WORLD_COUNTRIES.filter((c) => !POPULAR_ISO.includes(c.iso));
const ORDERED_COUNTRIES = [...popular, ...rest];

// Phone-code dropdown: one entry per country (unique `id`, shared dial codes ok).
export const PHONE_CODES = ORDERED_COUNTRIES.map((c) => ({
  id:    c.iso,
  code:  c.dial,
  flag:  c.flag,
  label: `${c.flag} ${c.dial}`,
  name:  c.name,
}));

// Country dropdown: full list of country names (popular first).
export const FORM_COUNTRIES = ORDERED_COUNTRIES.map((c) => c.name);
