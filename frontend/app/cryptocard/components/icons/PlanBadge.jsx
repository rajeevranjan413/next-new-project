'use client';

/* Plan tier badge SVG icons */

export function MoolBadge({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="17" fill="url(#moolGrad)" />
      <defs>
        <linearGradient id="moolGrad" x1="0" y1="0" x2="36" y2="36">
          <stop offset="0%" stopColor="#B0B8C4" />
          <stop offset="100%" stopColor="#778899" />
        </linearGradient>
      </defs>
      {/* M letter */}
      <path d="M10 25V13l8 7 8-7v12" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function ProBadge({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="17" fill="url(#proGrad)" />
      <defs>
        <linearGradient id="proGrad" x1="0" y1="0" x2="36" y2="36">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#F0B90B" />
        </linearGradient>
      </defs>
      {/* Star */}
      <polygon points="18,9 20.5,15.5 27.5,15.5 22,19.5 24,26.5 18,22.5 12,26.5 14,19.5 8.5,15.5 15.5,15.5" fill="white" opacity="0.95" />
    </svg>
  );
}

export function PremiumBadge({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="17" fill="url(#premGrad)" />
      <defs>
        <linearGradient id="premGrad" x1="0" y1="0" x2="36" y2="36">
          <stop offset="0%" stopColor="#E0E8F0" />
          <stop offset="50%" stopColor="#B0C4DE" />
          <stop offset="100%" stopColor="#6A89A7" />
        </linearGradient>
      </defs>
      {/* Diamond */}
      <polygon points="18,8 27,18 18,28 9,18" fill="none" stroke="white" strokeWidth="1.5" />
      <polygon points="18,8 27,18 18,18" fill="white" opacity="0.8" />
      <polygon points="18,8 9,18 18,18" fill="white" opacity="0.55" />
      <polygon points="18,28 27,18 18,18" fill="white" opacity="0.55" />
      <polygon points="18,28 9,18 18,18" fill="white" opacity="0.8" />
    </svg>
  );
}

export function PlanBadge({ plan, size = 36 }) {
  if (plan === 'Mool') return <MoolBadge size={size} />;
  if (plan === 'Pro') return <ProBadge size={size} />;
  if (plan === 'Premium') return <PremiumBadge size={size} />;
  return null;
}
