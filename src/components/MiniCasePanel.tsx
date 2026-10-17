import { useId, useRef, useState } from "react";
import type { MiniCase } from "../content/types";
import "./PatternExercise.css"; // shares input, tile and result styles
import "./MiniCasePanel.css";

/** Small data case: read the table, question the claim, write a short summary. No AI needed. */
export default function MiniCasePanel({ miniCase }: { miniCase: MiniCase }) {
  const answerId = useId();
  const [answer, setAnswer] = useState("");
  const [showSample, setShowSample] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const numeric = new Set(miniCase.numericColumns ?? []);

  const insertTemplate = (t: string) => {
    setAnswer((a) => (a.trim() ? `${a.trimEnd()} ${t}` : t));
    inputRef.current?.focus();
  };

  const tried = answer.trim().split(/\s+/).length >= 5;
  const usedTemplates = miniCase.templates.filter((t) => answer.includes(t.split("___")[0].trim())).length;

  return (
    <div className="minicase">
      <div className="paper">
        <div className="minicase__table-wrap" tabIndex={0} role="region" aria-label="ตารางข้อมูล">
          <table className="minicase__table">
            <thead>
              <tr>
                {miniCase.columns.map((c, i) => (
                  <th key={c} scope="col" className={numeric.has(i) ? "num" : undefined}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {miniCase.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" lang={/[a-z]/i.test(String(cell)) ? "en" : undefined}>
                        {cell}
                      </th>
                    ) : (
                      <td key={i} className={numeric.has(i) ? "num" : undefined}>
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {miniCase.noteTh && <p className="minicase__note">{miniCase.noteTh}</p>}

        <blockquote className="minicase__quote">
          <p className="minicase__quote-who">{miniCase.stakeholderLabelTh}</p>
          <p lang="en">“{miniCase.stakeholderQuote}”</p>
        </blockquote>

        <h3 className="minicase__h">ลองตั้งคำถามกับข้อมูลนี้</h3>
        <ul className="minicase__questions" lang="en">
          {miniCase.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </div>

      <div className="paper minicase__answer">
        <label htmlFor={answerId} className="minicase__h">
          เขียนสรุปสั้น ๆ เป็นภาษาอังกฤษ
        </label>
        <p className="minicase__hint">แตะแม่แบบเพื่อเพิ่มลงในคำตอบ แล้วเติมช่องว่าง</p>
        <div className="minicase__templates">
          {miniCase.templates.map((t) => (
            <button key={t} type="button" className="tile" lang="en" onClick={() => insertTemplate(t)}>
              {t}
            </button>
          ))}
        </div>
        <textarea
          id={answerId}
          ref={inputRef}
          className="drill__input"
          lang="en"
          rows={5}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        {answer.includes("___") && <p className="minicase__hint">ยังมีช่องว่าง ___ ที่ยังไม่ได้เติม</p>}
        <div className="drill__actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={!tried}
            aria-expanded={showSample}
            onClick={() => setShowSample((v) => !v)}
          >
            {showSample ? "ซ่อนคำตอบตัวอย่าง" : "ดูคำตอบตัวอย่าง"}
          </button>
          {!tried && <span className="minicase__hint">เขียนอย่างน้อยหนึ่งประโยคก่อน แล้วจะเปิดดูคำตอบตัวอย่างได้</span>}
        </div>
        <div aria-live="polite">
          {showSample && (
            <>
              <p className="drill__result">
                {usedTemplates === miniCase.templates.length
                  ? "คุณบอกครบทั้งสิ่งที่ข้อมูลแสดง สิ่งที่ยังไม่รู้ และสิ่งที่ควรทำต่อ ลองเทียบกับตัวอย่างดู"
                  : "ลองเทียบกับตัวอย่าง: คำตอบที่ดีบอกว่าข้อมูลแสดงอะไร ยังไม่รู้อะไร และควรทำอะไรต่อ"}
              </p>
              <p className="minicase__sample" lang="en">
                {miniCase.sampleAnswer}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
