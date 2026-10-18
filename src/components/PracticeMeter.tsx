import "./PracticeMeter.css";

interface Props {
  /** Player heard the model (question, phrase frame or natural option). */
  listened: boolean;
  /** Spoken attempts in this sitting (any mode). Session only — never stored. */
  attempts: number;
  /** Label of the last step (defaults to "speak in your own words"). */
  lastLabel?: string;
}

/**
 * Three practice steps instead of the mockup's score meters — they fill when the player
 * does each step, never from accuracy or accent (brief Final: no scoring).
 */
export default function PracticeMeter({ listened, attempts, lastLabel = "พูดด้วยคำตัวเอง" }: Props) {
  const steps = [
    { label: "ฟังต้นแบบ", done: listened },
    { label: "พูดครั้งแรก", done: attempts >= 1 },
    { label: lastLabel, done: attempts >= 2 },
  ];
  const count = steps.filter((s) => s.done).length;
  return (
    <div className="pmeter" role="group" aria-label={`ขั้นการฝึก ทำแล้ว ${count} จาก 3`}>
      <p className="pmeter__h">ขั้นการฝึก</p>
      <ol className="pmeter__steps">
        {steps.map((s, i) => (
          <li key={s.label} className={s.done ? "is-done" : undefined}>
            <span className="pmeter__dot" aria-hidden="true">
              {s.done ? "✓" : i + 1}
            </span>
            <span>
              {s.label}
              <span className="visually-hidden">{s.done ? " (ทำแล้ว)" : " (ยังไม่ได้ทำ)"}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="pmeter__note">นับจากการลงมือฝึก ไม่ใช่คะแนนสำเนียงหรือความถูกต้อง</p>
    </div>
  );
}
