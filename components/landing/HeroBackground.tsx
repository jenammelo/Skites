export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#1B0F42]">
      {/* base gradient — deep but saturated, not muddy */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5420A8] via-[#7724C7] to-[#1B0F42]" />

      {/* glow blobs — smaller blur radius so they stay defined, not a wash */}
      <div className="absolute -left-16 -top-20 h-72 w-72 rounded-full bg-fuchsia-500/55 blur-[70px]" />
      <div className="absolute -right-10 top-4 h-80 w-80 rounded-full bg-pink-500/45 blur-[80px]" />
      <div className="absolute bottom-[-3rem] left-1/3 h-64 w-64 rounded-full bg-violet-400/35 blur-[85px]" />

      {/* sharp, bright mesh / wave lines — this is the visible signature, not decoration in the background noise */}
      <svg
        className="pointer-events-none absolute inset-0 z-10 h-full w-full animate-wave-drift"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveA" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F0ABFC" stopOpacity="0" />
            <stop offset="50%" stopColor="#FF2BD6" stopOpacity="1" />
            <stop offset="100%" stopColor="#F0ABFC" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="waveB" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0" />
            <stop offset="50%" stopColor="#D946EF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="waveC" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F9A8D4" stopOpacity="0" />
            <stop offset="50%" stopColor="#E879F9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d="M-100 190 C 260 100, 520 300, 820 200 S 1400 100, 1560 220" stroke="url(#waveA)" strokeWidth="2.5" />
        <path d="M-100 330 C 300 240, 560 460, 860 350 S 1420 240, 1580 370" stroke="url(#waveB)" strokeWidth="2.5" />
        <path d="M-100 500 C 280 410, 600 640, 900 520 S 1440 410, 1600 540" stroke="url(#waveC)" strokeWidth="2.5" />
        <path d="M-100 650 C 260 590, 620 760, 920 650 S 1460 570, 1620 680" stroke="url(#waveA)" strokeWidth="1.75" opacity="0.9" />
        <path d="M-100 60 C 300 10, 560 140, 900 60 S 1420 10, 1600 90" stroke="url(#waveB)" strokeWidth="1.5" opacity="0.7" />

        {/* mesh grid — brighter, still fine enough to read as texture not noise */}
        <g stroke="#F0ABFC" strokeOpacity="0.2" strokeWidth="1">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 110} x2="1440" y2={i * 110 - 40} />
          ))}
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 120} y1="0" x2={i * 120 - 60} y2="900" />
          ))}
        </g>
      </svg>

      {/* faint dot grain — kept subtle, this one should stay in the background */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* darken the lower third slightly for text contrast, then fade to white for the section below */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#1B0F42]/40 to-[#FAFAF9]" />
    </div>
  );
}
