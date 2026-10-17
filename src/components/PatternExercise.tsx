import { useId, useState } from "react";
import type { Drill } from "../content/types";
import { checkAnswer, normalize, type CheckResult } from "../features/exercise/checkAnswer";
import "./PatternExercise.css";

interface Props {
  drills: Drill[];
  triedIds: string[];
  onTried: (drillId: string) => void;
}

const TYPE_TH: Record<Drill["type"], string> = {
  substitution: "แทนคำ",
  reorder: "เรียงคำ",
  fill: "เติมคำ",
  write: "เขียนเอง",
};

export default function PatternExercise({ drills, triedIds, onTried }: Props) {
  return (
    <ol className="drills">
      {drills.map((d, i) => (
        <li key={d.id}>
          <DrillCard drill={d} index={i + 1} tried={triedIds.includes(d.id)} onTried={() => onTried(d.id)} />
        </li>
      ))}
    </ol>
  );
}

function DrillCard({ drill, index, tried, onTried }: { drill: Drill; index: number; tried: boolean; onTried: () => void }) {
  const inputId = useId();
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const tiles = drill.type === "reorder" ? drill.prompt.split("/").map((t) => t.trim()) : [];
  const built = order.map((i) => tiles[i]).join(" ");
  const current = drill.type === "reorder" ? built : answer;

  const check = () => {
    if (drill.type === "reorder") {
      const ok = drill.acceptedExamples.some((ex) => normalize(ex) === normalize(built));
      setResult(ok ? { kind: "match" } : order.length < tiles.length ? { kind: "too-short" } : { kind: "order" });
    } else {
      setResult(checkAnswer(answer, drill.prompt, drill.acceptedExamples));
    }
    onTried();
  };

  const reset = () => {
    setAnswer("");
    setOrder([]);
    setResult(null);
  };

  return (
    <article className="drill paper" aria-labelledby={`${inputId}-title`}>
      <p className="drill__meta">
        ข้อ {index} <span className="drill__type">{TYPE_TH[drill.type]}</span>
        {tried && <span className="drill__tried">✓ ลองแล้ว</span>}
      </p>
      <h3 id={`${inputId}-title`} className="drill__title">
        {drill.promptTh}
      </h3>

      {drill.type === "reorder" ? (
        <div className="reorder">
          <p className="reorder__built" lang="en" aria-live="polite">
            {built || <span className="reorder__placeholder">แตะคำด้านล่างตามลำดับ</span>}
          </p>
          <div className="reorder__tiles" role="group" aria-label="คำที่เลือกได้">
            {tiles.map((t, i) =>
              order.includes(i) ? null : (
                <button key={i} type="button" className="tile" lang="en" onClick={() => setOrder((o) => [...o, i])}>
                  {t}
                </button>
              ),
            )}
          </div>
          {order.length > 0 && (
            <button type="button" className="drill__link" onClick={() => setOrder((o) => o.slice(0, -1))}>
              ลบคำล่าสุด
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="drill__prompt" lang="en">
            {drill.prompt}
          </p>
          <label htmlFor={inputId} className="visually-hidden">
            คำตอบของคุณ
          </label>
          <textarea
            id={inputId}
            className="drill__input"
            lang="en"
            rows={2}
            value={answer}
            placeholder="พิมพ์ประโยคภาษาอังกฤษ"
            onChange={(e) => {
              setAnswer(e.target.value);
              setResult(null);
            }}
          />
        </>
      )}

      <div className="drill__actions">
        <button type="button" className="btn btn--primary" onClick={check} disabled={!current.trim()}>
          ตรวจคำตอบ
        </button>
        <button type="button" className="btn btn--soft" aria-expanded={showHint} onClick={() => setShowHint((v) => !v)}>
          {showHint ? "ซ่อนคำใบ้" : "คำใบ้"}
        </button>
        <button type="button" className="btn btn--soft" aria-expanded={showExample} onClick={() => setShowExample((v) => !v)}>
          {showExample ? "ซ่อนตัวอย่าง" : "ดูตัวอย่าง"}
        </button>
        {(current || result) && (
          <button type="button" className="drill__link" onClick={reset}>
            ลองใหม่
          </button>
        )}
      </div>

      {showHint && <p className="drill__hint">💡 {drill.hint}</p>}
      <div aria-live="polite">{result && <ResultMessage result={result} />}</div>
      {(showExample || result) && (
        <div className="drill__examples">
          <p className="drill__examples-label">{drill.acceptedExamples.length > 1 ? "ตัวอย่างที่ใช้ได้" : "ตัวอย่าง"}</p>
          <ul lang="en">
            {drill.acceptedExamples.map((ex) => (
              <li key={ex}>{ex}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function ResultMessage({ result }: { result: CheckResult }) {
  const text = {
    match: "ดีมาก ประโยคของคุณตรงกับตัวอย่าง",
    pattern: "คุณใช้รูปประโยคได้แล้ว ลองเทียบกับตัวอย่างด้านล่าง คำตอบอื่นที่สื่อความหมายได้ก็ใช้ได้เช่นกัน",
    "missing-frame": "สื่อความได้แล้ว ลองใส่โครงประโยคให้ครบ",
    "too-short": "ลองเขียนให้เป็นประโยคเต็มอีกนิด",
    order: "ใช้ครบทุกคำแล้ว แต่ลำดับยังต่างจากตัวอย่าง ลองเทียบด้านล่างแล้วกด ลองใหม่",
  }[result.kind];
  return (
    <p className={`drill__result drill__result--${result.kind}`}>
      {text}
      {result.kind === "missing-frame" && (
        <>
          {" "}
          <span lang="en" className="drill__frame">
            {result.frame}
          </span>
        </>
      )}
    </p>
  );
}
