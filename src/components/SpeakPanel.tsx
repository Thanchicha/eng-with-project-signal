import { useEffect, useRef, useState } from "react";
import type { DialogueLine, RoleplayTurn, SpeakPractice } from "../content/types";
import type { Settings } from "../features/progress/progressStorage";
import { audioPlayer } from "../features/speech/audioPlayer";
import { canSpeak } from "../features/speech/speak";
import AnswerControls, { type AnswerMode } from "./AnswerControls";
import { SpeakerBadge, speakerName } from "./DialoguePanel";
import "./LearnSections.css";
import "./PhraseBank.css";
import "./SpeakPanel.css";

interface Props {
  practice: SpeakPractice;
  settings: Settings;
  onConsent: (value: "granted" | "declined") => void;
  /** Turn index the player answered on (ids only are stored by the caller). */
  onAttempt?: (turnIndex: number, mode: AnswerMode) => void;
}

/**
 * Speak Like an Intern (spec 04): a roleplay played one turn at a time. The other character's
 * lines are audio; on the intern's turns the player speaks first, then sees the model answer.
 * Nothing is recorded or uploaded.
 */
export default function SpeakPanel({ practice, settings, onConsent, onAttempt }: Props) {
  const canPlay = canSpeak() && !settings.textOnly;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | undefined>>({});
  const turnRef = useRef<HTMLLIElement>(null);
  const mounted = useRef(false);
  const finished = current >= practice.turns.length;

  useEffect(() => () => audioPlayer.stop(), []);
  useEffect(() => {
    if (mounted.current) turnRef.current?.focus();
    mounted.current = true;
  }, [current]);

  const play = (line: Pick<DialogueLine, "speakerId" | "textEn">) =>
    audioPlayer.playLines([{ speakerId: line.speakerId, textEn: line.textEn }], { rate: settings.audioRate });

  return (
    <div className="roleplay">
      <p className="paper paper__lead roleplay__situation">
        <strong>สถานการณ์:</strong> {practice.situationTh}
      </p>
      <p className="roleplay__how">
        {canPlay ? "ฟังแต่ละบรรทัด แล้วพูดตอบในตาของคุณก่อนเปิดตัวอย่าง" : "อ่านแต่ละบรรทัดออกเสียง แล้วพูดตอบในตาของคุณก่อนเปิดตัวอย่าง"}{" "}
        ไม่ต้องพูดเหมือนตัวอย่างทุกคำ
      </p>

      <ol className="roleplay__turns">
        {practice.turns.slice(0, current + 1).map((turn, i) => (
          <Turn
            key={i}
            turn={turn}
            isCurrent={i === current}
            refProp={i === current ? turnRef : undefined}
            canPlay={canPlay}
            settings={settings}
            answered={i in answers}
            answerText={answers[i]}
            onPlay={play}
            onConsent={onConsent}
            onSubmit={(mode, text) => {
              setAnswers((a) => ({ ...a, [i]: text }));
              onAttempt?.(i, mode);
            }}
            onRetry={() =>
              setAnswers((a) => {
                const next = { ...a };
                delete next[i];
                return next;
              })
            }
            onNext={() => setCurrent(i + 1)}
          />
        ))}
      </ol>

      {finished && (
        <div className="paper roleplay__done" role="status">
          <p>จบบทสนทนาแล้ว ลองเล่นอีกรอบโดยไม่เปิดตัวอย่าง จะช่วยให้พูดได้คล่องขึ้น</p>
          <button
            type="button"
            className="btn btn--soft"
            onClick={() => {
              setAnswers({});
              setCurrent(0);
            }}
          >
            เล่นบทสนทนาอีกครั้ง
          </button>
        </div>
      )}
    </div>
  );
}

interface TurnProps {
  turn: RoleplayTurn;
  isCurrent: boolean;
  refProp?: React.Ref<HTMLLIElement>;
  canPlay: boolean;
  settings: Settings;
  answered: boolean;
  answerText?: string;
  onPlay: (line: Pick<DialogueLine, "speakerId" | "textEn">) => void;
  onConsent: (value: "granted" | "declined") => void;
  onSubmit: (mode: AnswerMode, text?: string) => void;
  onRetry: () => void;
  onNext: () => void;
}

function Turn({ turn, isCurrent, refProp, canPlay, settings, answered, answerText, onPlay, onConsent, onSubmit, onRetry, onNext }: TurnProps) {
  const [revealed, setRevealed] = useState(!canPlay);
  // Earlier turns always show their text; only the current line waits to be heard first.
  const shown = revealed || !isCurrent;

  if (turn.kind === "line") {
    const { line } = turn;
    return (
      <li ref={refProp} tabIndex={-1} className="roleplay__turn">
        <SpeakerBadge line={line} />
        <div className="roleplay__body">
          <p className="line__name">{speakerName(line)}</p>
          {shown ? (
            <>
              <p lang="en" className="roleplay__en">
                {line.textEn}
              </p>
              {line.textTh && <p className="roleplay__th">{line.textTh}</p>}
            </>
          ) : (
            <p className="roleplay__hidden">(ฟังก่อน แล้วข้อความจะแสดง)</p>
          )}
          <div className="roleplay__actions">
            {canPlay && (
              <button
                type="button"
                className="listen"
                onClick={() => {
                  onPlay(line);
                  setRevealed(true);
                }}
              >
                ▶ ฟัง
              </button>
            )}
            {!shown && (
              <button type="button" className="phrases__hint-toggle" onClick={() => setRevealed(true)}>
                แสดงข้อความ
              </button>
            )}
            {isCurrent && (
              <button type="button" className="btn btn--primary" onClick={onNext}>
                ต่อไป
              </button>
            )}
          </div>
        </div>
      </li>
    );
  }

  return (
    <li ref={refProp} tabIndex={-1} className="roleplay__turn roleplay__turn--you">
      <span className="roleplay__you" aria-hidden="true">
        คุณ
      </span>
      <div className="roleplay__body">
        <p className="line__name">ตาคุณพูด</p>
        <p className="roleplay__prompt">{turn.promptTh}</p>
        {!answered ? (
          isCurrent && <AnswerControls compact settings={settings} onConsent={onConsent} onSubmit={onSubmit} howTh="พูดคำตอบออกเสียงเป็นภาษาอังกฤษ" />
        ) : (
          <>
            {answerText && (
              <p className="speak-resp__yours">
                คุณพูด: <span lang="en">“{answerText}”</span>
              </p>
            )}
            <p className="roleplay__model">
              ตัวอย่าง: <span lang="en">“{turn.model}”</span>
              {canPlay && (
                <button type="button" className="listen" onClick={() => onPlay({ speakerId: "intern", textEn: turn.model })}>
                  ฟัง
                </button>
              )}
            </p>
            {isCurrent && (
              <div className="roleplay__actions">
                <button type="button" className="btn btn--soft" onClick={onRetry}>
                  พูดอีกครั้ง
                </button>
                <button type="button" className="btn btn--primary" onClick={onNext}>
                  ต่อไป
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
}
