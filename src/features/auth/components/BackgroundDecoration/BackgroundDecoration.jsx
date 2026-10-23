import styles from "./BackgroundDecoration.module.css";

const ORANGE = "#ff6a00";

export default function BackgroundDecoration() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg className={styles.dots} width="330" height="190">
        {Array.from({ length: 11 }).map((_, r) =>
          Array.from({ length: 20 }).map((_, c) => {
            const o = Math.max(0, (c / 20) * 0.9 - r * 0.07);
            return o > 0.04 ? <circle key={`${r}-${c}`} cx={8 + c * 16} cy={8 + r * 16} r="2.2" fill={ORANGE} opacity={o} /> : null;
          })
        )}
      </svg>
      <svg className={styles.lines} width="280" height="320" viewBox="0 0 280 320">
        {Array.from({ length: 22 }).map((_, i) => (
          <path key={i} d={`M${280 - i * 7} 320 Q${300 - i * 10} ${200 + i * 2} 280 ${80 + i * 8}`}
            fill="none" stroke={ORANGE} strokeWidth="1" opacity={0.5 - i * 0.02} />
        ))}
      </svg>
    </div>
  );
}
