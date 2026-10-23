import styles from "./HeroIllustration.module.css";

const HeroIllustration = () => (
  <svg viewBox="0 0 640 545" preserveAspectRatio="xMidYMax meet" className={styles.svg} aria-hidden="true">
    <defs>
      <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#12365f" />
        <stop offset="1" stopColor="#0a2342" />
      </linearGradient>
      <linearGradient id="bld" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1b3f68" />
        <stop offset="1" stopColor="#0a2140" />
      </linearGradient>
    </defs>
    {/* círculos de fondo */}
    <circle cx="470" cy="290" r="220" fill="#12345a" opacity=".55" />
    <circle cx="180" cy="440" r="230" fill="url(#fade)" opacity=".9" />
    {/* edificios */}
    {[
      [60, 250, 70, 230], [135, 215, 55, 265], [195, 300, 45, 180],
      [235, 130, 52, 350], [290, 270, 50, 210], [520, 255, 60, 225], [580, 200, 50, 280],
    ].map(([x, y, w, h], i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} fill="url(#bld)" />
        {Array.from({ length: Math.floor(h / 22) }).map((_, r) =>
          Array.from({ length: Math.floor(w / 14) }).map((_, c) => (
            <rect key={r + "-" + c} x={x + 6 + c * 14} y={y + 10 + r * 22} width="5" height="8"
              fill="#2c5385" opacity={(r * 7 + c * 3 + i) % 4 === 0 ? 0.9 : 0.25} />
          ))
        )}
      </g>
    ))}
    {/* furgoneta */}
    <g>
      <ellipse cx="170" cy="440" rx="150" ry="14" fill="#000" opacity=".35" />
      <path d="M20 400 L22 360 Q26 346 44 340 L112 322 Q130 288 160 276 L230 262 L395 262 L395 410 L30 415 Z" fill="#f4f6f9" />
      <path d="M112 322 Q132 292 160 281 L215 270 L215 322 Z" fill="#cfd8e3" />
      <path d="M126 318 Q142 295 163 288 L205 280 L205 318 Z" fill="#26364c" />
      <rect x="215" y="262" width="180" height="150" fill="#eef1f5" />
      <rect x="215" y="368" width="180" height="6" fill="#c3ccd8" />
      <rect x="22" y="372" width="62" height="14" rx="4" fill="#d9dfe8" />
      <rect x="30" y="338" width="30" height="22" rx="4" fill="#9fb0c6" />
      <circle cx="72" cy="404" r="38" fill="#10192b" />
      <circle cx="72" cy="404" r="22" fill="#c8d0db" />
      <circle cx="72" cy="404" r="9" fill="#5b6879" />
      <path d="M232 262 H395 V410 H232 Z" fill="none" />
    </g>
    {/* celular */}
    <g transform="rotate(-4 470 270)">
      <rect x="378" y="208" width="170" height="332" rx="30" fill="#0b0f18" stroke="#3b4350" strokeWidth="4" />
      <rect x="388" y="218" width="150" height="312" rx="24" fill="#fff" />
      <rect x="440" y="222" width="46" height="9" rx="4.5" fill="#0b0f18" />
      <text x="428" y="260" fontSize="11" fontWeight="700" fill={"#0b2545"}>Ruta del día</text>
      <path d="M402 254h10M402 258h10M402 262h10" stroke={"#0b2545"} strokeWidth="1.6" />
      <rect x="388" y="272" width="150" height="190" fill="#e8eef0" />
      <path d="M388 330 Q440 310 538 340 M388 395 Q450 380 538 410 M430 272 L450 462 M490 272 Q480 360 520 462"
        stroke="#fff" strokeWidth="6" fill="none" />
      <path d="M520 318 Q530 380 500 430" stroke="#b9dff0" strokeWidth="9" fill="none" />
      <polyline points="470,306 452,345 464,372 438,410 506,425 478,398 497,350 470,306" fill="none" stroke="#2a3a52" strokeWidth="1.4" />
      {[
        [470, 308, "1", "#22a559"], [452, 346, "2", "#ff7a1a"], [498, 354, "3", "#22a559"],
        [440, 410, "4", "#22a559"], [488, 428, "5", "#1e88e5"],
      ].map(([x, y, n, f]) => (
        <g key={n}>
          <circle cx={x} cy={y} r="10" fill={f} stroke="#fff" strokeWidth="2" />
          <text x={x} y={y + 3.5} fontSize="10" fontWeight="700" fill="#fff" textAnchor="middle">{n}</text>
        </g>
      ))}
      <rect x="394" y="452" width="138" height="68" rx="10" fill="#fff" stroke="#e5e9ef" />
      <text x="402" y="470" fontSize="8" fill="#54606f">Próxima visita</text>
      <text x="402" y="487" fontSize="11" fontWeight="700" fill={"#0b2545"}>Metalúrgicas S.A.S</text>
      <text x="402" y="502" fontSize="8" fill="#54606f">Cra 45 # 30 - 15</text>
      <text x="402" y="514" fontSize="8" fill="#54606f">10:30 AM</text>
      <rect x="440" y="526" width="60" height="4" rx="2" fill="#0b0f18" />
    </g>
  </svg>
);

export default HeroIllustration;
