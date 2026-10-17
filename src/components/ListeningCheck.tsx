import { forwardRef, useState } from "react";
import type { ListeningCheck as Check } from "../content/types";
import "./ListeningCheck.css";

interface Props {
  check: Check;
  /** First answer given (right or wrong) — the scene can move on; retries stay open. */
  onAnswered: (correct: boolean) => void;
}

/** Gist/detail question in Thai after listening (spec 05 §7 step 3). Never locks the story. */
const ListeningCheck = forwardRef<HTMLHeadingElement, Props>(function ListeningCheck({ check, onAnswered }, headingRef) {
  const [picked, setPicked] = useState<string>();
  const [tries, setTries] = useState(0);
  const correct = picked === check.answerId;

  const pick = (id: string) => {
    setPicked(id);
    setTries((n) => n + 1);
    if (tries === 0) onAnswered(id === check.answerId);
  };

  return (
    <section className="lcheck" aria-labelledby={`${check.id}-q`}>
      <p className="lcheck__label">{check.type === "gist" ? "ฟังจับใจความ" : "ฟังหารายละเอียด"}</p>
      <h2 id={`${check.id}-q`} ref={headingRef} tabIndex={-1} className="lcheck__q">
        {check.promptTh}
      </h2>
      <ul className="lcheck__choices">
        {check.choices.map((c) => {
          const state = picked === c.id ? (correct ? "right" : "wrong") : undefined;
          return (
            <li key={c.id}>
              <button
                type="button"
                className={`lcheck__choice${state ? ` lcheck__choice--${state}` : ""}`}
                aria-pressed={picked === c.id}
                onClick={() => pick(c.id)}
                disabled={correct && picked !== c.id}
              >
                {state === "right" && <span aria-hidden="true">✓ </span>}
                {state === "wrong" && <span aria-hidden="true">✗ </span>}
                {c.labelTh}
              </button>
            </li>
          );
        })}
      </ul>
      <div aria-live="polite">
        {picked && correct && (
          <p className="lcheck__feedback lcheck__feedback--right">
            <strong>ใช่แล้ว</strong> {check.feedbackTh}
          </p>
        )}
        {picked && !correct && (
          <p className="lcheck__feedback">
            <strong>ยังไม่ใช่</strong>{" "}
            {tries >= 2 ? check.feedbackTh : "ลองฟังซ้ำ หรือฟังทีละบรรทัด แล้วเลือกใหม่ได้เลย จะไปต่อก่อนก็ได้"}
          </p>
        )}
      </div>
    </section>
  );
});

export default ListeningCheck;
