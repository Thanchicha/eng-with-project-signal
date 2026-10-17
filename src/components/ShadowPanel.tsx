import { useEffect, useRef, useState } from "react";
import type { ShadowItem } from "../content/types";
import type { Settings } from "../features/progress/progressStorage";
import { audioPlayer } from "../features/speech/audioPlayer";
import { canSpeak } from "../features/speech/speak";
import AnswerControls, { type AnswerMode } from "./AnswerControls";
import "./LearnSections.css";
import "./PhraseBank.css";
import "./ShadowPanel.css";

interface Props {
  items: ShadowItem[];
  settings: Settings;
  triedIds: string[];
  onConsent: (value: "granted" | "declined") => void;
  onTried: (itemId: string, mode: AnswerMode) => void;
}

/** Shadow & Substitute (spec 05 §7 step 9): hear the model, say it or swap words, compare. One at a time. */
export default function ShadowPanel({ items, settings, triedIds, onConsent, onTried }: Props) {
  const [index, setIndex] = useState(0);
  const item = items[index];
  const heading = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) heading.current?.focus();
    mounted.current = true;
  }, [index]);

  return (
    <div className="shadow">
      <nav aria-label="ข้อฝึก" className="shadow__nav">
        <ol>
          {items.map((it, i) => (
            <li key={it.id}>
              <button
                type="button"
                aria-current={i === index ? "step" : undefined}
                aria-label={`ข้อ ${i + 1}${triedIds.includes(it.id) ? " (ลองแล้ว)" : ""}`}
                className={triedIds.includes(it.id) ? "is-done" : undefined}
                onClick={() => setIndex(i)}
              >
                {triedIds.includes(it.id) ? "✓" : i + 1}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <ShadowCard
        key={item.id}
        item={item}
        number={index + 1}
        total={items.length}
        settings={settings}
        headingRef={heading}
        onConsent={onConsent}
        onTried={(mode) => onTried(item.id, mode)}
        onNext={index < items.length - 1 ? () => setIndex(index + 1) : undefined}
      />
    </div>
  );
}

interface CardProps {
  item: ShadowItem;
  number: number;
  total: number;
  settings: Settings;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onConsent: (value: "granted" | "declined") => void;
  onTried: (mode: AnswerMode) => void;
  onNext?: () => void;
}

function ShadowCard({ item, number, total, settings, headingRef, onConsent, onTried, onNext }: CardProps) {
  const canPlay = canSpeak() && !settings.textOnly;
  const [heard, setHeard] = useState(!canPlay);
  const [answer, setAnswer] = useState<{ text?: string }>();
  const play = (text: string) => audioPlayer.playLines([{ speakerId: "narrator", textEn: text }], { rate: settings.audioRate });

  return (
    <article className="paper shadow__card" aria-labelledby={`${item.id}-title`}>
      <p className="shadow__meta">
        ข้อ {number} จาก {total} <span className="drill__type">{item.mode === "shadow" ? "พูดตาม" : "พูดแทนคำ"}</span>
      </p>
      <h2 id={`${item.id}-title`} ref={headingRef} tabIndex={-1} className="shadow__title">
        {item.promptTh}
      </h2>

      <div className="pattern__actions">
        {canPlay && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              play(item.modelPhrase);
              setHeard(true);
            }}
          >
            <span aria-hidden="true">▶</span> {heard ? "ฟังต้นแบบอีกครั้ง" : "ฟังต้นแบบ"}
          </button>
        )}
        {!heard && (
          <button type="button" className="phrases__hint-toggle" onClick={() => setHeard(true)}>
            แสดงประโยคต้นแบบ
          </button>
        )}
      </div>

      {heard && (
        <p className="pattern__example" lang="en">
          {item.modelPhrase}
        </p>
      )}

      {item.mode === "substitute" && item.frame && (
        <div className="shadow__frame">
          <p className="pattern__subs-label">รูปประโยค</p>
          <p lang="en" className="pattern__frame">
            {item.frame}
          </p>
          <p className="pattern__subs-label">ลองแทนด้วย</p>
          <ul className="pattern__subs" lang="en">
            {item.substitutions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {!answer ? (
        <AnswerControls
          settings={settings}
          onConsent={onConsent}
          howTh={item.mode === "shadow" ? "ฟังแล้วพูดตามออกเสียง แล้วเลือกวิธีบันทึก" : "พูดประโยคใหม่ของคุณออกเสียง แล้วเลือกวิธีบันทึก"}
          onSubmit={(mode, text) => {
            setAnswer({ text });
            setHeard(true);
            onTried(mode);
          }}
        />
      ) : (
        <div className="shadow__result" aria-live="polite">
          {answer.text && (
            <p className="speak-resp__yours">
              คำตอบของคุณ: <span lang="en">“{answer.text}”</span>
            </p>
          )}
          <p className="pattern__subs-label">เทียบกับตัวอย่าง (ความหมายใกล้เคียงก็ใช้ได้)</p>
          <ul className="speak-resp__models" lang="en">
            {item.examples.map((ex) => (
              <li key={ex}>
                {ex}
                {canPlay && (
                  <button type="button" className="listen" aria-label={`ฟังตัวอย่าง ${ex}`} onClick={() => play(ex)}>
                    ฟัง
                  </button>
                )}
              </li>
            ))}
          </ul>
          <p className="shadow__tip">
            <strong>เคล็ดลับ:</strong> {item.hint}
          </p>
          <div className="speak-resp__buttons">
            <button type="button" className="btn btn--soft" onClick={() => setAnswer(undefined)}>
              พูดอีกครั้ง
            </button>
            {onNext && (
              <button type="button" className="btn btn--primary" onClick={onNext}>
                ข้อถัดไป
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
