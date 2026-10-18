import { useEffect, useMemo, useState } from "react";
import { characters } from "../content/characters";
import type { CharacterId, DialogueLine } from "../content/types";
import type { Settings } from "../features/progress/progressStorage";
import { audioPlayer } from "../features/speech/audioPlayer";
import { getSpeechCapabilities } from "../features/speech/speechCapabilities";
import AnswerControls from "./AnswerControls";
import Avatar from "./Avatar";
import { speakerName } from "./DialoguePanel";
import "./LearnSections.css";
import "./SpeakResponse.css";
import "./RoleTurns.css";

interface Props {
  lines: DialogueLine[];
  /** The character the player plays in this chapter. */
  leadId: CharacterId;
  settings: Settings;
  onConsent: (value: "granted" | "declined") => void;
  /** Player attempted every line of their character (any mode — text is never stored). */
  onDone: () => void;
}

const whoLabel = (l: DialogueLine) => (l.speakerId === "narration" ? "ผู้บรรยาย" : l.speakerId === "screen" ? "ข้อความบนจอ" : speakerName(l));

/**
 * "Your turn": the scene again, with the player in the lead's seat. The other characters' lines
 * play on request; at each of the player's lines the audio plays first, then the player says it
 * (mic, "I said it", or typing). Nothing is scored or compared word for word.
 */
export default function RoleTurns({ lines, leadId, settings, onConsent, onDone }: Props) {
  const canPlay = getSpeechCapabilities().tts && !settings.textOnly;
  const rate = settings.audioRate;
  const lead = characters[leadId];
  const leadCount = useMemo(() => lines.filter((l) => l.speakerId === leadId).length, [lines, leadId]);
  const [cursor, setCursor] = useState(0);
  const [heard, setHeard] = useState(!canPlay);
  const [textShown, setTextShown] = useState(!canPlay || settings.alwaysShowTranscript);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => () => audioPlayer.stop(), []);

  const doneTurns = lines.slice(0, cursor).filter((l) => l.speakerId === leadId).length;
  const line = lines[cursor];
  const isMine = !!line && line.speakerId === leadId;
  // Run of other characters' lines before the player's next line (or the end).
  let runEnd = cursor;
  while (runEnd < lines.length && lines[runEnd].speakerId !== leadId) runEnd++;

  const stop = () => {
    audioPlayer.stop();
    setPlaying(false);
  };

  const advance = (to: number) => {
    setHeard(!canPlay);
    setTextShown(!canPlay || settings.alwaysShowTranscript);
    if (to >= lines.length) {
      setCursor(lines.length);
      setFinished(true);
    } else setCursor(to);
  };

  const playRun = () => {
    const run = lines.slice(cursor, runEnd);
    if (!run.length) return;
    const to = runEnd;
    setPlaying(true);
    const after = () => {
      setPlaying(false);
      advance(to);
    };
    audioPlayer.playLines(run, { rate, onEnd: after, onError: after });
  };

  const playMine = () => {
    if (!line) return;
    setPlaying(true);
    const after = () => {
      setPlaying(false);
      setHeard(true);
    };
    audioPlayer.playLines([line], { rate, onEnd: after, onError: after });
  };

  // Lines already passed, newest last (the player's own show once they've said them).
  const history = lines.slice(0, cursor);

  return (
    <section className="hud roleturns" aria-labelledby="roleturns-title">
      <header className="roleturns__head">
        <Avatar characterId={leadId} size="sm" />
        <div>
          <p className="roleturns__eyebrow" lang="en">
            Your turn
          </p>
          <h2 id="roleturns-title" className="roleturns__title">
            คุณรับบท {lead.callName}: พูดทุกประโยคของ {lead.callName} ในฉากนี้
          </h2>
          <p className="roleturns__count" role="status">
            {finished ? `พูดครบ ${leadCount} ประโยคแล้ว` : `ประโยคของคุณ ${Math.min(doneTurns + (isMine ? 1 : 0), leadCount)} จาก ${leadCount}`}
          </p>
        </div>
      </header>

      {history.length > 0 && (
        <ol className="roleturns__history" aria-label="บทที่ผ่านมา">
          {history.map((l, i) => (
            <li key={i} className={l.speakerId === leadId ? "is-mine" : undefined}>
              <span className="roleturns__who">{whoLabel(l)}</span>
              <span lang="en">{l.textEn}</span>
            </li>
          ))}
        </ol>
      )}

      {!finished && !isMine && (
        <div className="roleturns__block">
          <p className="roleturns__label">ฟังคนอื่นพูดก่อนถึงตาคุณ</p>
          <ul className="roleturns__preview" lang="en">
            {lines.slice(cursor, runEnd).map((l, i) => (
              <li key={i}>
                <span className="roleturns__who">{whoLabel(l)}</span> {l.textEn}
              </li>
            ))}
          </ul>
          {canPlay ? (
            playing ? (
              <button type="button" className="btn btn--soft" onClick={stop}>
                <span aria-hidden="true">■</span> หยุดเสียง
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={playRun}>
                <span aria-hidden="true">▶</span> ฟังบทต่อไป
              </button>
            )
          ) : (
            <button type="button" className="btn btn--primary" onClick={() => advance(runEnd)}>
              อ่านแล้ว ไปต่อ
            </button>
          )}
        </div>
      )}

      {!finished && isMine && (
        <div className="roleturns__block roleturns__block--mine">
          <p className="roleturns__label">
            ประโยคของ {lead.callName} <span className="roleturns__badge">ตาของคุณ</span>
          </p>
          {textShown ? (
            <>
              <p className="roleturns__line" lang="en">
                “{line.textEn}”
              </p>
              {settings.thaiHints && line.textTh && <p className="roleturns__th">{line.textTh}</p>}
            </>
          ) : (
            <p className="roleturns__hidden">ฟังก่อน แล้วพูดตาม ข้อความจะแสดงหลังฟัง</p>
          )}
          <div className="speak-resp__buttons">
            {canPlay &&
              (playing ? (
                <button type="button" className="btn btn--soft" onClick={stop}>
                  <span aria-hidden="true">■</span> หยุดเสียง
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--soft"
                  onClick={() => {
                    playMine();
                    setTextShown(true);
                  }}
                >
                  <span aria-hidden="true">▶</span> {heard ? "ฟังอีกครั้ง" : "ฟังประโยคของคุณ"}
                </button>
              ))}
            {!textShown && (
              <button type="button" className="phrases__hint-toggle" onClick={() => setTextShown(true)}>
                แสดงข้อความ
              </button>
            )}
          </div>
          {(heard || textShown) && (
            <AnswerControls
              key={cursor}
              compact
              settings={settings}
              onConsent={onConsent}
              howTh="พูดประโยคนี้ออกเสียง แล้วเลือกวิธีบันทึก ไม่มีการให้คะแนน"
              onSubmit={() => {
                stop();
                advance(cursor + 1);
              }}
            />
          )}
        </div>
      )}

      {finished && (
        <div className="roleturns__block">
          <p className="roleturns__label">จบตาของคุณแล้ว</p>
          <button type="button" className="btn btn--primary" onClick={onDone}>
            ไปต่อ
          </button>
        </div>
      )}
    </section>
  );
}
