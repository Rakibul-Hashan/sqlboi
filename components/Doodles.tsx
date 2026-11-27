// হাতে আঁকা ধাঁচের ছোট SVG। সব মৌলিক আঁকা, কোনো লাইব্রেরি লাগে না।

export function BugDoodle({ className = "", decorative = false }: { className?: string; decorative?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : "বাগ মনস্টার"} aria-hidden={decorative || undefined}>
      <path d="M20 72 Q8 34 50 20 Q92 34 80 72 Q66 88 50 84 Q34 88 20 72z" fill="#FF6FB5" stroke="#111" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="38" cy="48" r="8" fill="#fff" stroke="#111" strokeWidth="3" />
      <circle cx="62" cy="48" r="8" fill="#fff" stroke="#111" strokeWidth="3" />
      <circle cx="40" cy="50" r="3" fill="#111" />
      <circle cx="60" cy="50" r="3" fill="#111" />
      <path d="M36 68 Q50 60 64 68" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 26 L22 10 M70 26 L78 10" stroke="#111" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** শিরোনামের নিচে আঁকা হয়ে ওঠা দাগ */
export function Underline({ color = "#FF6FB5", className = "" }: { color?: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 300 30" preserveAspectRatio="none" className={className}>
      <path
        className="draw-line"
        d="M4 18 C60 6 120 26 180 12 S270 8 296 16"
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CurlyArrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 80" className={className}>
      <path className="draw-line [animation-delay:.6s]" d="M10 20 C40 70 80 70 108 30" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
      <path className="draw-line [animation-delay:1.2s]" d="M96 26 L110 28 L106 42" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
