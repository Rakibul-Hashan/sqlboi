/**
 * লেভেল ১০–১১-এর ছবি: সব নিজের আঁকা SVG, বইয়ের রং আর ফন্টে।
 * ডেটা public/sql/join-shop.sql-এর সাথে হুবহু মেলানো, যাতে ছবি আর Query-র ফলাফল এক কথা বলে।
 *
 * MDX-এ:
 *   <JoinSchema />                 চারটা টেবিল আর তাদের চাবির সম্পর্ক
 *   <ColsVsRows />                 JOIN (পাশাপাশি) বনাম UNION (ওপরে-নিচে)
 *   <JoinVenn kind="left" />       একটা JOIN-এর Venn ছবি
 *   <JoinVennGrid />               সব JOIN এক নজরে
 *   <JoinMatch mode="inner" />     কোন Row মেলে, কোনটা বাদ, কোথায় NULL
 *   <CrossGrid />                  products × sizes
 */

const INK = "var(--color-ink)";
const body = { fontFamily: "var(--font-body)" } as const;
const code = { fontFamily: "var(--font-code)" } as const;
const h3 = { fontFamily: "var(--font-h3)" } as const;

function Figure({ children, caption, label }: { children: React.ReactNode; caption?: React.ReactNode; label: string }) {
  return (
    <figure className="brut-sm my-8 overflow-hidden bg-card" role="group" aria-label={label}>
      <div tabIndex={0} className="max-w-full overflow-x-auto overscroll-x-contain bg-paper px-3 py-4 [background-image:radial-gradient(var(--color-grid)_1px,transparent_1px)] [background-size:18px_18px]">{children}</div>
      {caption && <figcaption className="border-t-[2.5px] border-ink bg-card px-4 py-2.5 text-[0.92em] leading-relaxed">{caption}</figcaption>}
    </figure>
  );
}

/* ================================================================== */
/* ১. টেবিলগুলোর মানচিত্র                                              */
/* ================================================================== */

type Col = { name: string; key?: "pk" | "fk" };
interface Card {
  title: string;
  x: number;
  y: number;
  w: number;
  cols: Col[];
  bg: string;
}
const ROW = 24;
const rowMid = (c: Card, i: number) => c.y + ROW * (i + 1) + ROW / 2;

function TableCard({ c, focus }: { c: Card; focus?: boolean }) {
  const h = ROW * (c.cols.length + 1);
  return (
    <g>
      <rect x={c.x + 4} y={c.y + 4} width={c.w} height={h} rx={10} fill={INK} />
      <rect x={c.x} y={c.y} width={c.w} height={h} rx={10} fill="var(--color-card)" stroke={INK} strokeWidth={focus ? 4 : 2.5} />
      <path d={`M${c.x + 1.5} ${c.y + ROW} V${c.y + 10} a8.5 8.5 0 0 1 8.5 -8.5 H${c.x + c.w - 10} a8.5 8.5 0 0 1 8.5 8.5 V${c.y + ROW} Z`} fill={c.bg} />
      <line x1={c.x} x2={c.x + c.w} y1={c.y + ROW} y2={c.y + ROW} stroke={INK} strokeWidth={2.5} />
      <text x={c.x + 12} y={c.y + 17} style={code} fontSize={14} fontWeight={700} fill={INK}>
        {c.title}
      </text>
      {c.cols.map((col, i) => {
        const y = c.y + ROW * (i + 1);
        return (
          <g key={col.name}>
            {col.key && (
              <rect
                x={c.x + 6}
                y={y + 3}
                width={c.w - 12}
                height={ROW - 6}
                rx={5}
                fill={col.key === "pk" ? "var(--color-yellow-soft)" : "var(--color-blue-soft)"}
              />
            )}
            <text x={c.x + 12} y={y + 16.5} style={code} fontSize={12.5} fill={INK}>
              {col.name}
            </text>
            {col.key && (
              <text x={c.x + c.w - 12} y={y + 16.5} textAnchor="end" style={code} fontSize={10.5} fontWeight={700} fill={INK} opacity={0.7}>
                {col.key.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

function Link({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label?: string }) {
  const mx = (x1 + x2) / 2;
  return (
    <g>
      <path d={`M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} fill="none" stroke={INK} strokeWidth={2.5} />
      <circle cx={x1} cy={y1} r={4.5} fill={INK} />
      <circle cx={x2} cy={y2} r={4.5} fill="var(--color-card)" stroke={INK} strokeWidth={2.5} />
      {label && (
        <text
          x={mx}
          y={Math.min(y1, y2) - 8}
          textAnchor="middle"
          style={code}
          fontSize={11.5}
          fill={INK}
          stroke="var(--color-paper)"
          strokeWidth={5}
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function JoinSchema({ focus }: { focus?: "orders" }) {
  const customers: Card = { title: "customers", x: 16, y: 24, w: 178, bg: "var(--color-green-soft)", cols: [{ name: "customer_id", key: "pk" }, { name: "name" }, { name: "city" }] };
  const products: Card = { title: "products", x: 16, y: 178, w: 178, bg: "var(--color-pink-soft)", cols: [{ name: "product_id", key: "pk" }, { name: "product_name" }, { name: "category" }, { name: "price" }] };
  const orders: Card = {
    title: "orders",
    x: 296,
    y: 40,
    w: 196,
    bg: focus ? "var(--color-yellow)" : "var(--color-yellow-soft)",
    cols: [
      { name: "order_id", key: "pk" },
      { name: "customer_id", key: "fk" },
      { name: "product_id", key: "fk" },
      { name: "employee_id", key: "fk" },
      { name: "order_date" },
      { name: "quantity" },
      { name: "amount" },
    ],
  };
  const employees: Card = { title: "employees", x: 594, y: 98, w: 178, bg: "var(--color-purple-soft)", cols: [{ name: "employee_id", key: "pk" }, { name: "name" }, { name: "role" }, { name: "manager_id" }] };
  return (
    <Figure
      label="চারটা টেবিল আর তাদের সম্পর্ক"
      caption={
        focus ? (
          <>
            <b>প্রতি Row = একটা অর্ডার</b>, তাই শুরু <code>orders</code> থেকে। বাকি তিনটা টেবিল শুধু নাম আর বিবরণ যোগ করে, প্রতিটা নিজের চাবি দিয়ে।
          </>
        ) : (
          <>
            হলুদ = <b>Primary Key</b> (নিজের পরিচয়), নীল = <b>Foreign Key</b> (অন্য টেবিলের কাউকে চেনানো)। প্রতিটা তীর একটা সম্ভাব্য JOIN।
          </>
        )
      }
    >
      <svg viewBox="0 0 790 316" className="mx-auto block w-full min-w-[640px] max-w-[860px]" aria-hidden>
        <Link x1={orders.x} y1={rowMid(orders, 1)} x2={customers.x + customers.w} y2={rowMid(customers, 0)} label="customer_id" />
        <Link x1={orders.x} y1={rowMid(orders, 2)} x2={products.x + products.w} y2={rowMid(products, 0)} label="product_id" />
        <Link x1={orders.x + orders.w} y1={rowMid(orders, 3)} x2={employees.x} y2={rowMid(employees, 0)} label="employee_id" />
        <TableCard c={customers} />
        <TableCard c={products} />
        <TableCard c={orders} focus={!!focus} />
        <TableCard c={employees} />
      </svg>
    </Figure>
  );
}

/* ================================================================== */
/* ২. বেশি Column নাকি বেশি Row                                        */
/* ================================================================== */

function Grid({ x, y, cols, rows, fill, cw = 30, rh = 20 }: { x: number; y: number; cols: number; rows: number; fill: string | string[]; cw?: number; rh?: number }) {
  const cells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const f = Array.isArray(fill) ? fill[r] ?? fill[0] : fill;
      cells.push(<rect key={`${r}-${c}`} x={x + c * cw} y={y + r * rh} width={cw} height={rh} fill={f} stroke={INK} strokeWidth={1.6} />);
    }
  return <g>{cells}</g>;
}

function Arrow({ x, y, w = 40 }: { x: number; y: number; w?: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + w - 8} y2={y} stroke={INK} strokeWidth={3} />
      <path d={`M${x + w - 12} ${y - 7} L${x + w} ${y} L${x + w - 12} ${y + 7} Z`} fill={INK} />
    </g>
  );
}

export function ColsVsRows() {
  const B = "var(--color-blue-soft)";
  const P = "var(--color-pink-soft)";
  return (
    <Figure
      label="JOIN পাশাপাশি, UNION ওপরে-নিচে"
      caption={
        <>
          দুটো স্প্রেডশিট <b>পাশাপাশি</b> রাখলে Column বাড়ে: সেটা <b>JOIN</b>। একটার <b>নিচে</b> আরেকটা রাখলে Row বাড়ে: সেটা <b>UNION / UNION ALL</b> (Set Operator)।
        </>
      }
    >
      <svg viewBox="0 0 760 250" className="mx-auto block w-full min-w-[620px] max-w-[860px]" aria-hidden>
        {/* বাঁ: JOIN */}
        <text x={190} y={26} textAnchor="middle" style={h3} fontSize={18} fill={INK}>
          JOIN → বেশি Column
        </text>
        <Grid x={20} y={60} cols={2} rows={4} fill={B} />
        <Grid x={96} y={60} cols={2} rows={4} fill={P} />
        <text x={50} y={52} textAnchor="middle" style={code} fontSize={12} fill={INK}>customers</text>
        <text x={126} y={52} textAnchor="middle" style={code} fontSize={12} fill={INK}>orders</text>
        <Arrow x={170} y={100} />
        <Grid x={222} y={60} cols={2} rows={4} fill={B} />
        <Grid x={282} y={60} cols={2} rows={4} fill={P} />
        <text x={282} y={52} textAnchor="middle" style={body} fontSize={13} fill={INK}>এক Row, দুই টেবিলের Column</text>
        <text x={190} y={196} textAnchor="middle" style={body} fontSize={14} fill={INK}>
          শর্ত লাগে: কোন Row কার সাথে বসবে (ON)
        </text>

        <line x1={385} y1={30} x2={385} y2={220} stroke={INK} strokeWidth={2} strokeDasharray="6 6" />

        {/* ডান: UNION */}
        <text x={575} y={26} textAnchor="middle" style={h3} fontSize={18} fill={INK}>
          UNION → বেশি Row
        </text>
        <Grid x={420} y={52} cols={3} rows={3} fill={B} />
        <Grid x={420} y={128} cols={3} rows={3} fill={P} />
        <text x={512} y={66} style={code} fontSize={12} fill={INK}>customers</text>
        <text x={512} y={142} style={code} fontSize={12} fill={INK}>employees</text>
        <Arrow x={590} y={120} />
        <Grid x={642} y={60} cols={3} rows={6} fill={[B, B, B, P, P, P]} />
        <text x={575} y={222} textAnchor="middle" style={body} fontSize={14} fill={INK}>
          শর্ত লাগে: দুই পাশে Column-এর সংখ্যা আর ধরন এক
        </text>
      </svg>
    </Figure>
  );
}

/* ================================================================== */
/* ৩. Venn: কোন অংশ থাকে                                               */
/* ================================================================== */

export type JoinKind = "inner" | "left" | "right" | "full" | "left-anti" | "right-anti" | "full-anti";

const KEEP: Record<JoinKind, { l: boolean; i: boolean; r: boolean }> = {
  inner: { l: false, i: true, r: false },
  left: { l: true, i: true, r: false },
  right: { l: false, i: true, r: true },
  full: { l: true, i: true, r: true },
  "left-anti": { l: true, i: false, r: false },
  "right-anti": { l: false, i: false, r: true },
  "full-anti": { l: true, i: false, r: true },
};

export const JOIN_LABEL: Record<JoinKind, { title: string; sql: string; keeps: string }> = {
  inner: { title: "INNER JOIN", sql: "JOIN", keeps: "শুধু দুই পাশে মিল আছে এমন" },
  left: { title: "LEFT JOIN", sql: "LEFT JOIN", keeps: "বাঁয়ের সবাই + মিললে ডানের তথ্য" },
  right: { title: "RIGHT JOIN", sql: "RIGHT JOIN", keeps: "ডানের সবাই + মিললে বাঁয়ের তথ্য" },
  full: { title: "FULL JOIN", sql: "LEFT … UNION ALL … IS NULL", keeps: "দুই পাশের সবাই" },
  "left-anti": { title: "Left Anti Join", sql: "LEFT JOIN … WHERE ডান IS NULL", keeps: "বাঁয়ের যাদের মিল নেই" },
  "right-anti": { title: "Right Anti Join", sql: "উল্টো LEFT JOIN … IS NULL", keeps: "ডানের যাদের মিল নেই" },
  "full-anti": { title: "Full Anti Join", sql: "দুই Anti Join-এর UNION", keeps: "দুই পাশের মিলহীনরা" },
};

function VennSvg({ kind, small }: { kind: JoinKind; small?: boolean }) {
  const k = KEEP[kind];
  const id = `jv-${kind}${small ? "-s" : ""}`;
  const on = "var(--color-blue)";
  const off = "var(--color-card)";
  return (
    <svg viewBox={small ? "0 16 300 180" : "0 0 300 200"} className={small ? "block w-full" : "mx-auto block w-full max-w-[380px]"} aria-hidden>
      <defs>
        <clipPath id={`${id}-L`}>
          <circle cx={118} cy={104} r={68} />
        </clipPath>
        <clipPath id={`${id}-R`}>
          <circle cx={182} cy={104} r={68} />
        </clipPath>
        <mask id={`${id}-notR`}>
          <rect width={300} height={180} fill="white" />
          <circle cx={182} cy={104} r={68} fill="black" />
        </mask>
        <mask id={`${id}-notL`}>
          <rect width={300} height={180} fill="white" />
          <circle cx={118} cy={104} r={68} fill="black" />
        </mask>
      </defs>
      <circle cx={118} cy={104} r={68} fill={k.l ? on : off} mask={`url(#${id}-notR)`} />
      <circle cx={182} cy={104} r={68} fill={k.r ? on : off} mask={`url(#${id}-notL)`} />
      <circle cx={182} cy={104} r={68} fill={k.i ? on : off} clipPath={`url(#${id}-L)`} />
      {!k.i && (
        // মিলের অংশ বাদ: শুধু দুই বৃত্তের ভেতরের অংশে কোনাকুনি দাগ
        <g clipPath={`url(#${id}-L)`}>
          <g clipPath={`url(#${id}-R)`}>
            {[...Array(16)].map((_, n) => (
              <line key={n} x1={96 + n * 9} y1={26} x2={56 + n * 9} y2={186} stroke={INK} strokeWidth={1.4} opacity={0.4} />
            ))}
          </g>
        </g>
      )}
      <circle cx={118} cy={104} r={68} fill="none" stroke={INK} strokeWidth={3} />
      <circle cx={182} cy={104} r={68} fill="none" stroke={INK} strokeWidth={3} />
      {!small && (
        <>
          <text x={92} y={24} textAnchor="middle" style={code} fontSize={14} fontWeight={700} fill={INK}>
            customers
          </text>
          <text x={208} y={24} textAnchor="middle" style={code} fontSize={14} fontWeight={700} fill={INK}>
            orders
          </text>
          <text x={150} y={196} textAnchor="middle" style={body} fontSize={12.5} fill={INK}>
            মাঝখান = দুই পাশে মিল আছে
          </text>
        </>
      )}
    </svg>
  );
}

export function JoinVenn({ kind }: { kind: JoinKind }) {
  const l = JOIN_LABEL[kind];
  return (
    <Figure
      label={`${l.title}: ${l.keeps}`}
      caption={
        <>
          <b>{l.title}</b>: {l.keeps}। নীল অংশ ফলাফলে থাকে।
        </>
      }
    >
      <VennSvg kind={kind} />
    </Figure>
  );
}

export function JoinVennGrid() {
  const kinds: JoinKind[] = ["inner", "left", "right", "full", "left-anti", "right-anti", "full-anti"];
  return (
    <figure className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="সব JOIN এক নজরে">
      {kinds.map((k) => (
        <div key={k} className="brut-sm bg-card p-3">
          <VennSvg kind={k} small />
          <p className="mt-1 font-h3 text-[0.95em] leading-snug">{JOIN_LABEL[k].title}</p>
          <p className="text-[0.8em] leading-snug">{JOIN_LABEL[k].keeps}</p>
          <p className="mt-1 font-code text-[0.72em] leading-snug text-muted">{JOIN_LABEL[k].sql}</p>
        </div>
      ))}
      <div className="brut-sm flex flex-col justify-center bg-yellow-soft p-3">
        <p className="font-h3 text-[0.95em]">CROSS JOIN</p>
        <p className="text-[0.8em] leading-snug">মিল দেখে না: প্রতিটা Row × প্রতিটা Row</p>
        <p className="mt-1 font-code text-[0.72em] text-muted">৫ × ৪ = ২০</p>
      </div>
    </figure>
  );
}

/* ================================================================== */
/* ৪. Row মেলানো: আসল ডেটা দিয়ে                                         */
/* ================================================================== */

const CUSTOMERS = [
  { id: 1, name: "Rahim" },
  { id: 2, name: "Karim" },
  { id: 3, name: "Sumaiya" },
  { id: 4, name: "Nabila" },
  { id: 5, name: "Tanvir" },
];
const ORDERS = [
  { id: 101, cid: 1 },
  { id: 102, cid: 1 },
  { id: 103, cid: 2 },
  { id: 104, cid: 3 },
  { id: 105, cid: 3 },
  { id: 106, cid: 9 },
  { id: 107, cid: 2 },
];

export function JoinMatch({ mode }: { mode: "inner" | "left" | "right" | "full" | "left-anti" | "right-anti" }) {
  const cy = (i: number) => 64 + i * 52;
  const oy = (i: number) => 52 + i * 38;
  const LX = 30, LW = 168, RX = 452, RW = 168, H = 30;
  const matchedC = (id: number) => ORDERS.some((o) => o.cid === id);
  const matchedO = (cid: number) => CUSTOMERS.some((c) => c.id === cid);
  const anti = mode === "left-anti" || mode === "right-anti";
  const keepUnL = mode === "left" || mode === "full" || mode === "left-anti";
  const keepUnR = mode === "right" || mode === "full" || mode === "right-anti";
  const showMatches = !anti;

  const keptC = (id: number) => (matchedC(id) ? showMatches : keepUnL);
  const keptO = (cid: number) => (matchedO(cid) ? showMatches : keepUnR);

  const rows =
    (showMatches ? ORDERS.filter((o) => matchedO(o.cid)).length : 0) +
    (keepUnL ? CUSTOMERS.filter((c) => !matchedC(c.id)).length : 0) +
    (keepUnR ? ORDERS.filter((o) => !matchedO(o.cid)).length : 0);
  const title = JOIN_LABEL[mode].title;

  return (
    <Figure
      label={`${title}: কোন Row থাকে`}
      caption={
        <>
          <b>{title}</b>: রঙিন বাক্স ফলাফলে আসে, ফিকে বাক্স বাদ। প্রতিটা দাগ একটা জোড়া = ফলাফলের একটা Row।{" "}
          {(keepUnL || keepUnR) && <>মিল না পেলেও যাকে রাখা হয়, তার উল্টো পাশে বসে <code>NULL</code>। </>}
          <b>মোট {rows.toLocaleString("bn-BD")}টা Row।</b>
        </>
      }
    >
      <svg viewBox="0 0 720 330" className="mx-auto block w-full min-w-[600px] max-w-[820px]" aria-hidden>
        <text x={LX + LW / 2} y={30} textAnchor="middle" style={code} fontSize={15} fontWeight={700} fill={INK}>
          customers
        </text>
        <text x={RX + RW / 2} y={30} textAnchor="middle" style={code} fontSize={15} fontWeight={700} fill={INK}>
          orders
        </text>

        {/* মিলের দাগ */}
        {showMatches &&
          ORDERS.map((o, j) => {
            const i = CUSTOMERS.findIndex((c) => c.id === o.cid);
            if (i < 0) return null;
            const y1 = cy(i) + H / 2, y2 = oy(j) + H / 2;
            return <path key={o.id} d={`M${LX + LW} ${y1} C${LX + LW + 120} ${y1}, ${RX - 120} ${y2}, ${RX} ${y2}`} fill="none" stroke={INK} strokeWidth={2.4} />;
          })}

        {/* বাঁয়ের মিলহীন → NULL */}
        {keepUnL &&
          CUSTOMERS.map((c, i) =>
            matchedC(c.id) ? null : (
              <g key={c.id}>
                <line x1={LX + LW} y1={cy(i) + H / 2} x2={244} y2={cy(i) + H / 2} stroke={INK} strokeWidth={2} strokeDasharray="5 5" />
                <rect x={244} y={cy(i) + 4} width={56} height={H - 8} rx={11} fill="var(--color-pink-soft)" stroke={INK} strokeWidth={2} />
                <text x={272} y={cy(i) + H / 2 + 4.5} textAnchor="middle" style={code} fontSize={12} fontWeight={700} fill={INK}>
                  NULL
                </text>
              </g>
            )
          )}

        {/* ডানের মিলহীন → NULL */}
        {keepUnR &&
          ORDERS.map((o, j) =>
            matchedO(o.cid) ? null : (
              <g key={o.id}>
                <line x1={RX} y1={oy(j) + H / 2} x2={406} y2={oy(j) + H / 2} stroke={INK} strokeWidth={2} strokeDasharray="5 5" />
                <rect x={350} y={oy(j) + 4} width={56} height={H - 8} rx={11} fill="var(--color-pink-soft)" stroke={INK} strokeWidth={2} />
                <text x={378} y={oy(j) + H / 2 + 4.5} textAnchor="middle" style={code} fontSize={12} fontWeight={700} fill={INK}>
                  NULL
                </text>
              </g>
            )
          )}

        {CUSTOMERS.map((c, i) => {
          const k = keptC(c.id);
          return (
            <g key={c.id} opacity={k ? 1 : 0.38}>
              <rect x={LX} y={cy(i)} width={LW} height={H} rx={8} fill={k ? "var(--color-green-soft)" : "var(--color-card)"} stroke={INK} strokeWidth={2.4} strokeDasharray={k ? undefined : "5 4"} />
              <text x={LX + 12} y={cy(i) + 20} style={code} fontSize={13} fill={INK}>
                {c.id} · {c.name}
              </text>
            </g>
          );
        })}
        {ORDERS.map((o, j) => {
          const k = keptO(o.cid);
          return (
            <g key={o.id} opacity={k ? 1 : 0.38}>
              <rect x={RX} y={oy(j)} width={RW} height={H} rx={8} fill={k ? "var(--color-yellow-soft)" : "var(--color-card)"} stroke={INK} strokeWidth={2.4} strokeDasharray={k ? undefined : "5 4"} />
              <text x={RX + 12} y={oy(j) + 20} style={code} fontSize={13} fill={INK}>
                #{o.id} · cust {o.cid}
              </text>
            </g>
          );
        })}
        {/* কাস্টমার ৯ নেই: ফিকে না, সবসময় স্পষ্ট */}
        {ORDERS.map((o, j) =>
          matchedO(o.cid) ? null : (
            <text key={`n${o.id}`} x={RX + RW + 10} y={oy(j) + 20} style={body} fontSize={13} fontWeight={700} fill="var(--color-err)">
              ৯ নম্বর নেই!
            </text>
          )
        )}
      </svg>
    </Figure>
  );
}

/* ================================================================== */
/* ৫. CROSS JOIN                                                       */
/* ================================================================== */

export function CrossGrid() {
  const products = ["T-shirt", "Hoodie", "Jacket", "Headphone", "Smart Watch"];
  const sizes = ["S", "M", "L", "XL"];
  const X = 168, Y = 60, CW = 124, RH = 42;
  return (
    <Figure
      label="CROSS JOIN: প্রতিটা পণ্য × প্রতিটা সাইজ"
      caption={
        <>
          <b>CROSS JOIN</b> কোনো মিল খোঁজে না: বাঁয়ের প্রতিটা Row ডানের প্রতিটা Row-এর সাথে। ৫টা পণ্য × ৪টা সাইজ = <b>২০টা Row</b>। ১০,০০০ × ১০,০০০ হলে
          ১০ কোটি!
        </>
      }
    >
      <svg viewBox="0 0 680 290" className="mx-auto block w-full min-w-[560px] max-w-[760px]" aria-hidden>
        <text x={X - 14} y={Y - 16} textAnchor="end" style={code} fontSize={12} fill={INK}>
          products ↓ × sizes →
        </text>
        {sizes.map((s, c) => (
          <text key={s} x={X + c * CW + CW / 2} y={Y - 14} textAnchor="middle" style={code} fontSize={15} fontWeight={700} fill={INK}>
            {s}
          </text>
        ))}
        {products.map((p, r) => (
          <g key={p}>
            <text x={X - 14} y={Y + r * RH + 26} textAnchor="end" style={code} fontSize={13.5} fontWeight={700} fill={INK}>
              {p}
            </text>
            {sizes.map((s, c) => (
              <g key={s}>
                <rect
                  x={X + c * CW + 3}
                  y={Y + r * RH + 3}
                  width={CW - 6}
                  height={RH - 6}
                  rx={7}
                  fill={r < 3 ? "var(--color-blue-soft)" : "var(--color-card)"}
                  stroke={INK}
                  strokeWidth={2}
                />
                <text x={X + c * CW + CW / 2} y={Y + r * RH + 26} textAnchor="middle" style={code} fontSize={11.5} fill={INK}>
                  {p}·{s}
                </text>
              </g>
            ))}
          </g>
        ))}
        <text x={X + 2 * CW} y={Y + 5 * RH + 20} textAnchor="middle" style={body} fontSize={13} fill={INK}>
          নীল: শুধু Clothing (৩ × ৪ = ১২), যেটা দোকানের আসল কাজে লাগে
        </text>
      </svg>
    </Figure>
  );
}
