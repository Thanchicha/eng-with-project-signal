import { forwardRef, useEffect, useId, useState } from "react";
import type { SpeakingPrompt } from "../content/types";
import { audioPlayer } from "../features/speech/audioPlayer";
import { getSpeechCapabilities } from "../features/speech/speechCapabilities";
import type { Settings } from "../features/progress/progressStorage";
import AnswerControls, { type AnswerMode } from "./AnswerControls";
import { SpeakerBadge, speakerName } from "./DialoguePanel";
import PhraseBank from "./PhraseBank";
import "./LearnSections.css";
import "./FeedbackCard.css"; // feedback list style
import "./SpeakResponse.css";

export type { AnswerMode } from "./AnswerControls";

interface Props {
  prompt: SpeakingPrompt;
  settings: Settings;
  onConsent: (value: "granted" | "declined") => void;
  /** Player answered in some way (mic text, "I said it", or typed). Text is never stored. */
  onAttempt?: (mode: AnswerMode) => void;
  /** Player picked a self-check after seeing feedback — the scene can continue. */
  onDone: (selfCheck: "idea" | "own") => void;
  /** Label above the title. */
  eyebrowTh?: string;
  /** Text for the continue buttons after feedback (defaults to the self-check pair). */
  doneLabel?: string;
}

/**
 * Speak to Continue (spec 05 §7 steps 5–7): hear the question, borrow a phrase, answer aloud,
 * then see feedback. Feedback opens after any attempt and never scores accent or exact wording.
 */
const SpeakResponse = forwardRef<HTMLHeadingElement, Props>(function SpeakResponse(
  { prompt, settings, onConsent, onAttempt, onDone, eyebrowTh = "พูดเพื่อไปต่อ", doneLabel },
  headingRef,
) {
  const uid = useId();
  const canPlay = getSpeechCapabilities().tts && !settings.textOnly;
  const [answered, setAnswered] = useState<{ mode: AnswerMode; text?: string }>();
  const [askShown, setAskShown] = useState(!canPlay);
  const rate = settings.audioRate;

  useEffect(() => () => audioPlayer.stop(), []);

  const play = (textEn: string, speakerId = "narrator") => audioPlayer.playLines([{ speakerId, textEn }], { rate });
  const ask = prompt.askedBy;

  return (
    <section className="speak-resp" aria-labelledby={`${uid}-title`}>
      <p className="speak-resp__label">{eyebrowTh}</p>
      <h2 id={`${uid}-title`} ref={headingRef} tabIndex={-1} className="speak-resp__title">
        {prompt.situationTh}
      </h2>
      <p className="speak-resp__task" lang="en">
        {prompt.promptEn}
      </p>

      {ask && (
        <div className="speak-resp__ask">
          <SpeakerBadge line={ask} />
          <div>
            <p className="speak-resp__asker">{speakerName(ask)} ถามคุณ</p>
            {askShown && (
              <p lang="en" className="speak-resp__ask-text">
                {ask.textEn}
              </p>
            )}
            <div className="speak-resp__ask-actions">
              {canPlay && (
                <button
                  type="button"
                  className="listen"
                  onClick={() => {
                    play(ask.textEn, ask.speakerId);
                    setAskShown(true);
                  }}
                >
                  ▶ ฟังคำถาม
                </button>
              )}
              {!askShown && (
                <button type="button" className="phrases__hint-toggle" onClick={() => setAskShown(true)}>
                  แสดงข้อความ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <PhraseBank frames={prompt.phraseFrames} intentsTh={prompt.acceptedIntentsTh} rate={rate} canPlay={canPlay} />

      {!answered ? (
        <AnswerControls
          settings={settings}
          onConsent={onConsent}
          onSubmit={(mode, text) => {
            setAnswered({ mode, text });
            onAttempt?.(mode);
          }}
        />
      ) : (
        <div className="speak-resp__feedback" aria-live="polite">
          {answered.text && (
            <p className="speak-resp__yours">
              คำตอบของคุณ: <span lang="en">“{answered.text}”</span>
            </p>
          )}
          <dl className="feedback__parts">
            <div>
              <dt>สิ่งที่คุณสื่อได้</dt>
              <dd>{prompt.feedback.communicatedTh}</dd>
            </div>
            <div>
              <dt>ประโยคที่เป็นธรรมชาติ</dt>
              <dd className="feedback__natural">
                <span lang="en">“{prompt.feedback.naturalOption}”</span>
                {canPlay && (
                  <button type="button" className="listen" onClick={() => play(prompt.feedback.naturalOption)}>
                    ฟัง
                  </button>
                )}
              </dd>
            </div>
            <div>
              <dt>ปรับอีกนิด</dt>
              <dd>{prompt.feedback.improvementTh}</dd>
            </div>
            {prompt.modelResponses.length > 0 && (
              <div>
                <dt>ตัวอย่างอื่นที่ใช้ได้</dt>
                <dd>
                  <ul className="speak-resp__models" lang="en">
                    {prompt.modelResponses.map((m) => (
                      <li key={m}>
                        {m}
                        {canPlay && (
                          <button type="button" className="listen" aria-label={`ฟังตัวอย่าง ${m}`} onClick={() => play(m)}>
                            ฟัง
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
          <div className="speak-resp__buttons">
            <button
              type="button"
              className="btn btn--soft"
              onClick={() => {
                if (canPlay) play(prompt.feedback.naturalOption);
                setAnswered(undefined);
              }}
            >
              พูดอีกครั้ง (Say it again)
            </button>
          </div>
          {doneLabel ? (
            <div className="speak-resp__buttons">
              <button type="button" className="btn btn--primary" onClick={() => onDone("own")}>
                {doneLabel}
              </button>
            </div>
          ) : (
            <>
              <p className="speak-resp__selfcheck">คำตอบของคุณเป็นแบบไหน?</p>
              <div className="speak-resp__buttons">
                <button type="button" className="btn btn--primary" onClick={() => onDone("idea")}>
                  ใช้แนวคิดเดียวกัน (I used this idea)
                </button>
                <button type="button" className="btn btn--primary" onClick={() => onDone("own")}>
                  ใช้คำของตัวเอง (I tried my own words)
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
});

export default SpeakResponse;
