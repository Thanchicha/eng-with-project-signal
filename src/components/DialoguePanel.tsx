import { useState, type ReactNode } from "react";
import { characters } from "../content/characters";
import type { CharacterId, DialogueLine } from "../content/types";
import Avatar from "./Avatar";
import "./DialoguePanel.css";

interface Props {
  lines: DialogueLine[];
  showThaiAll: boolean;
  onVocab?: (vocabId: string) => void;
  /** When set, each line gets a "listen" button that replays just that line. */
  onListen?: (line: DialogueLine, index: number) => void;
  /** Line currently being played — highlighted and marked aria-current. */
  activeIndex?: number;
}

/** Transcript of a dialogue. Vocabulary words are buttons; the playing line is highlighted. */
export default function DialoguePanel({ lines, showThaiAll, onVocab, onListen, activeIndex }: Props) {
  const [openThai, setOpenThai] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpenThai((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <ol className="dialogue">
      {lines.map((line, i) => {
        const kind = line.speakerId === "narration" ? "narration" : line.speakerId === "screen" ? "screen" : "speech";
        const thaiOpen = showThaiAll || openThai.has(i);
        return (
          <li
            key={i}
            className={`line line--${kind}${i === activeIndex ? " line--active" : ""}`}
            aria-current={i === activeIndex ? "true" : undefined}
          >
            {kind === "speech" && <SpeakerBadge line={line} />}
            <div className="line__body">
              {kind === "speech" && <p className="line__name">{speakerName(line)}</p>}
              <p className="line__en" lang="en">
                {kind === "screen" && <span className="visually-hidden">ข้อความบนจอ: </span>}
                {renderWithVocab(line, onVocab)}
              </p>
              {line.textTh && (
                <>
                  {thaiOpen && <p className="line__th">{line.textTh}</p>}
                  {!showThaiAll && (
                    <button type="button" className="line__translate" aria-expanded={thaiOpen} onClick={() => toggle(i)}>
                      {thaiOpen ? "ซ่อนคำแปล" : "แปล"}
                    </button>
                  )}
                </>
              )}
              {onListen && (
                <button
                  type="button"
                  className="line__translate line__listen"
                  aria-label={`ฟังบรรทัดนี้: ${speakerName(line)}`}
                  onClick={() => onListen(line, i)}
                >
                  ฟังบรรทัดนี้
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function isCast(id: string): id is CharacterId {
  return id in characters;
}

export function speakerName(line: Pick<DialogueLine, "speakerId" | "speakerLabel">) {
  return isCast(line.speakerId) ? characters[line.speakerId].callName : line.speakerLabel ?? line.speakerId;
}

export function SpeakerBadge({ line }: { line: Pick<DialogueLine, "speakerId" | "speakerLabel"> }) {
  if (isCast(line.speakerId)) return <Avatar characterId={line.speakerId} size="sm" />;
  const label = line.speakerLabel ?? line.speakerId;
  const name = label.match(/\(([^)]+)\)/)?.[1] ?? label;
  return (
    <span className="line__guest" aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/** Wraps each vocabulary reference (in order) in a button that opens the popover. */
function renderWithVocab(line: DialogueLine, onVocab?: (id: string) => void): ReactNode {
  const refs = line.vocabularyRefs ?? [];
  if (!refs.length || !onVocab) return line.textEn;
  const out: ReactNode[] = [];
  let cursor = 0;
  refs.forEach((ref, k) => {
    const at = line.textEn.indexOf(ref.text, cursor);
    if (at < 0) return;
    out.push(line.textEn.slice(cursor, at));
    out.push(
      <button key={k} type="button" className="vocab-word" onClick={() => onVocab(ref.id)} aria-haspopup="dialog">
        {ref.text}
      </button>,
    );
    cursor = at + ref.text.length;
  });
  out.push(line.textEn.slice(cursor));
  return out;
}
