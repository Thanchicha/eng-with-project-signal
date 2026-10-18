import { useState } from "react";
import { audioPlayer, type AudioRate } from "../features/speech/audioPlayer";
import "./PhraseBank.css";

interface Props {
  frames: string[];
  /** What a good answer does, in Thai — shown on request as a hint. */
  intentsTh: string[];
  rate: AudioRate;
  canPlay: boolean;
  /** Show the speaking tips panel (mockup "Sentence Tips"). */
  tips?: boolean;
}

const TIPS = [
  "พูดด้วยน้ำเสียงธรรมชาติ เหมือนคุยกับเพื่อนร่วมทีม",
  "เน้นเสียงคำสำคัญ เช่น คำถาม ชื่อ หรือตัวเลข",
  "ไม่ต้องกังวลเรื่องสำเนียง สื่อความหมายได้คือสำเร็จ",
];

/** Sentence frames the player can hear and borrow before speaking (spec 05 §7 step 6). */
export default function PhraseBank({ frames, intentsTh, rate, canPlay, tips }: Props) {
  const [hint, setHint] = useState(false);
  return (
    <div className="phrases">
      <p className="phrases__label">
        {tips && <span lang="en">Sentence Tips</span> }รูปประโยคช่วยพูด
      </p>
      <ul className="phrases__list">
        {frames.map((f) => (
          <li key={f}>
            <span lang="en">{f}</span>
            {canPlay && (
              <button
                type="button"
                className="listen"
                aria-label={`ฟังรูปประโยค ${f}`}
                onClick={() => audioPlayer.playLines([{ speakerId: "narrator", textEn: f.replace(/_+/g, "something") }], { rate })}
              >
                ฟัง
              </button>
            )}
          </li>
        ))}
      </ul>
      <button type="button" className="phrases__hint-toggle" aria-expanded={hint} onClick={() => setHint((v) => !v)}>
        {hint ? "ซ่อนคำใบ้" : "คำใบ้: คำตอบที่ดีควรทำอะไร"}
      </button>
      {hint && (
        <ul className="phrases__intents">
          {intentsTh.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
      {tips && (
        <>
          <p className="phrases__label phrases__label--tips">เคล็ดลับการพูด</p>
          <ul className="phrases__tips">
            {TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
