import { useState } from "react";
import type { Episode, SentencePattern } from "../content/types";
import type { Settings } from "../features/progress/progressStorage";
import { audioPlayer } from "../features/speech/audioPlayer";
import { canSpeak } from "../features/speech/speak";
import "./PhraseBank.css"; // shared text-button style
import "./LearnSections.css";

/** "Label: text" → bold label + text, so known / assumption / next-question read at a glance. */
function Labeled({ text }: { text: string }) {
  const m = text.match(/^([^:]{2,40}):\s*(.*)$/s);
  if (!m) return <>{text}</>;
  return (
    <>
      <strong>{m[1]}:</strong> {m[2]}
    </>
  );
}

export function AnalystNotePanel({ episode }: { episode: Episode }) {
  return (
    <div className="paper">
      <p className="paper__lead">ทีมรู้อะไรแล้ว อะไรยังเป็นแค่ข้อสันนิษฐาน และควรถามอะไรต่อ</p>
      <ul className="note-list">
        {episode.analystNote.map((n) => (
          <li key={n}>
            <Labeled text={n} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LessonPanel({ episode }: { episode: Episode }) {
  const { title, bodyTh } = episode.businessLesson;
  // Consecutive "• " lines form one list; other lines are paragraphs.
  const blocks: (string | string[])[] = [];
  for (const line of bodyTh) {
    if (line.startsWith("• ")) {
      const last = blocks.at(-1);
      if (Array.isArray(last)) last.push(line.slice(2));
      else blocks.push([line.slice(2)]);
    } else blocks.push(line);
  }
  return (
    <div className="paper">
      {title !== "Business & Data Lesson" && <p className="paper__title">{title}</p>}
      {blocks.map((b, i) =>
        Array.isArray(b) ? (
          <ul key={i} className="note-list">
            {b.map((li) => (
              <li key={li}>
                <Labeled text={li} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b}</p>
        ),
      )}
    </div>
  );
}

/** Spec 06 E: the player hears each model phrase before reading the pattern. */
export function PatternsPanel({ episode, settings }: { episode: Episode; settings: Settings }) {
  const canPlay = canSpeak() && !settings.textOnly;
  return (
    <>
      {canPlay && <p className="paper__lead patterns__lead">กดฟังตัวอย่างก่อน แล้วรูปประโยคจะแสดงขึ้นมา ลองพูดตามทันทีหลังฟัง</p>}
      <ol className="patterns">
        {episode.sentencePatterns.map((p, i) => (
          <PatternCard key={p.pattern} pattern={p} index={i + 1} canPlay={canPlay} rate={settings.audioRate} />
        ))}
      </ol>
    </>
  );
}

function PatternCard({ pattern: p, index, canPlay, rate }: { pattern: SentencePattern; index: number; canPlay: boolean; rate: number }) {
  const [shown, setShown] = useState(!canPlay);
  const play = () => {
    audioPlayer.playLines([{ speakerId: "narrator", textEn: p.example }], { rate });
    setShown(true);
  };
  return (
    <li className="paper pattern">
      <p className="pattern__num">รูปประโยค {index}</p>
      {canPlay && (
        <div className="pattern__actions">
          <button type="button" className="btn btn--primary" onClick={play}>
            <span aria-hidden="true">▶</span> {shown ? "ฟังอีกครั้ง" : "ฟังตัวอย่าง"}
          </button>
          {!shown && (
            <button type="button" className="phrases__hint-toggle" onClick={() => setShown(true)}>
              แสดงรูปประโยคเลย
            </button>
          )}
        </div>
      )}
      {shown && (
        <>
          <p className="pattern__example" lang="en">
            {p.example}
          </p>
          <p className="pattern__frame" lang="en">
            {p.pattern}
          </p>
          <p className="pattern__subs-label">แทนคำแล้วพูดออกเสียง</p>
          <ul className="pattern__subs" lang="en">
            {p.substitutions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </>
      )}
    </li>
  );
}
