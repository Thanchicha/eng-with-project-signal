import { useState } from "react";
import { audioPlayer, type AudioRate } from "../features/speech/audioPlayer";
import "./PhraseBank.css";

interface Props {
  frames: string[];
  /** What a good answer does, in Thai — shown on request as a hint. */
  intentsTh: string[];
  rate: AudioRate;
  canPlay: boolean;
}

/** Sentence frames the player can hear and borrow before speaking (spec 05 §7 step 6). */
export default function PhraseBank({ frames, intentsTh, rate, canPlay }: Props) {
  const [hint, setHint] = useState(false);
  return (
    <div className="phrases">
      <p className="phrases__label">รูปประโยคช่วยพูด</p>
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
    </div>
  );
}
