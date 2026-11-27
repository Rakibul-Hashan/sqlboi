// স্কুলের ER Diagram (Chen notation)। হাতে আঁকা SVG, কোনো লাইব্রেরি লাগে না।

const ink = "#2F3E46";
const line = "#7A756E";

function Entity({ x, y, label, weak = false }: { x: number; y: number; label: string; weak?: boolean }) {
  return (
    <g>
      <rect x={x - 62} y={y - 22} width={124} height={44} rx={4} fill="#fff" stroke={ink} strokeWidth={1.5} />
      {weak && <rect x={x - 57} y={y - 17} width={114} height={34} rx={3} fill="none" stroke={ink} />}
      <text x={x} y={y + 6} textAnchor="middle" fontSize={16} fill={ink}>{label}</text>
    </g>
  );
}

function Rel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <polygon points={`${x},${y - 32} ${x + 58},${y} ${x},${y + 32} ${x - 58},${y}`} fill="#E8EFF8" stroke={ink} strokeWidth={1.5} />
      <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fill={ink}>{label}</text>
    </g>
  );
}

function Attr({ x, y, label, kind = "simple" }: { x: number; y: number; label: string; kind?: "simple" | "key" | "multi" | "derived" }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={46} ry={17} fill="#fff" stroke={line} strokeDasharray={kind === "derived" ? "4 3" : undefined} />
      {kind === "multi" && <ellipse cx={x} cy={y} rx={41} ry={13} fill="none" stroke={line} />}
      <text x={x} y={y + 5} textAnchor="middle" fontSize={12.5} fill={ink} textDecoration={kind === "key" ? "underline" : undefined}>
        {label}
      </text>
    </g>
  );
}

function L({ x1, y1, x2, y2, double = false }: { x1: number; y1: number; x2: number; y2: number; double?: boolean }) {
  if (!double) return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={line} />;
  // সম্পূর্ণ অংশগ্রহণ: দুটো সমান্তরাল রেখা
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ox = (-dy / len) * 2.5, oy = (dx / len) * 2.5;
  return (
    <g stroke={line}>
      <line x1={x1 + ox} y1={y1 + oy} x2={x2 + ox} y2={y2 + oy} />
      <line x1={x1 - ox} y1={y1 - oy} x2={x2 - ox} y2={y2 - oy} />
    </g>
  );
}

function Card({ x, y, t }: { x: number; y: number; t: string }) {
  return <text x={x} y={y} fontSize={14} fill="#B3433B" textAnchor="middle">{t}</text>;
}

export function ERDiagram() {
  return (
    <figure tabIndex={0} className="brut-sm max-w-full overflow-x-auto overscroll-x-contain bg-card p-3">
      <svg viewBox="0 0 940 490" className="mx-auto block w-full min-w-[640px]" role="img" aria-label="স্কুলের ER Diagram: Student, Subject, Teacher, Guardian">
        <g transform="translate(70,12)">
        {/* সম্পর্কের রেখা */}
        <L x1={130} y1={240} x2={322} y2={240} double />
        <L x1={438} y1={240} x2={628} y2={240} />
        <L x1={690} y1={218} x2={690} y2={142} />
        <L x1={690} y1={78} x2={690} y2={52} />
        <L x1={68} y1={262} x2={68} y2={338} double />
        <L x1={68} y1={402} x2={68} y2={420} />
        <Card x={300} y={230} t="M" />
        <Card x={460} y={230} t="N" />
        <Card x={704} y={200} t="N" />
        <Card x={704} y={68} t="1" />
        <Card x={84} y={290} t="1" />
        <Card x={84} y={415} t="N" />

        {/* Attribute-এর রেখা */}
        <L x1={40} y1={218} x2={40} y2={160} />
        <L x1={90} y1={218} x2={130} y2={120} />
        <L x1={110} y1={225} x2={200} y2={175} />
                <L x1={380} y1={208} x2={380} y2={170} />
        <L x1={650} y1={262} x2={610} y2={320} />
        <L x1={730} y1={262} x2={770} y2={320} />
        <L x1={630} y1={30} x2={560} y2={30} />

        <Entity x={68} y={240} label="Student" />
        <Entity x={690} y={240} label="Subject" />
        <Entity x={690} y={30} label="Teacher" />
        <Entity x={68} y={442} label="Guardian" weak />

        <Rel x={380} y={240} label="Takes" />
        <Rel x={690} y={110} label="Teaches" />
        <Rel x={68} y={370} label="Has" />

        <Attr x={40} y={145} label="id" kind="key" />
        <Attr x={140} y={105} label="name" />
        <Attr x={225} y={168} label="phone" kind="multi" />
        <Attr x={0} y={60} label="age" kind="derived" />
        <L x1={30} y1={218} x2={10} y2={76} />
        <Attr x={380} y={155} label="score" />
        <Attr x={600} y={335} label="id" kind="key" />
        <Attr x={780} y={335} label="name" />
        <Attr x={510} y={30} label="id" kind="key" />
        <Attr x={815} y={70} label="salary" />
        <L x1={752} y1={40} x2={790} y2={58} />
        </g>
      </svg>
      <figcaption className="mt-2 px-2 text-sm text-muted">
        আয়তক্ষেত্র = Entity · দুই দাগের আয়তক্ষেত্র = Weak Entity · রম্বস = Relationship · ডিম্বাকৃতি = Attribute (নিচে দাগ = Key, দুই বৃত্ত = Multi-valued, ড্যাশ = Derived) · দুই সমান্তরাল রেখা = সম্পূর্ণ অংশগ্রহণ · লাল অক্ষর = Cardinality
      </figcaption>
    </figure>
  );
}
