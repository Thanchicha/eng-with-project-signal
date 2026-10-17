import type { Episode } from "../content/types";
import { canSpeak, speak } from "../features/speech/speak";
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

export function PatternsPanel({ episode }: { episode: Episode }) {
  return (
    <ol className="patterns">
      {episode.sentencePatterns.map((p) => (
        <li key={p.pattern} className="paper pattern">
          <p className="pattern__frame" lang="en">
            {p.pattern}
          </p>
          <p className="pattern__example" lang="en">
            {p.example}
            {canSpeak() && (
              <button type="button" className="listen" onClick={() => speak(p.example)}>
                ฟัง
              </button>
            )}
          </p>
          <p className="pattern__subs-label">แทนคำได้</p>
          <ul className="pattern__subs" lang="en">
            {p.substitutions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
