import { forwardRef } from "react";
import type { Choice, DialogueLine } from "../content/types";
import CharacterSprite from "./CharacterSprite";
import { speakerName } from "./DialoguePanel";
import { canSpeak, speak } from "../features/speech/speak";
import "./FeedbackCard.css";

interface Props {
  choice: Choice;
  continueLabel: string;
  onTryAgain: () => void;
  onContinue: () => void;
  /** Teammate who reacts to the choice (shown as a portrait). */
  reactor?: Pick<DialogueLine, "speakerId" | "speakerLabel">;
}

/** Four-part feedback (spec 05 §8) — explains, never just "correct/incorrect". */
const FeedbackCard = forwardRef<HTMLHeadingElement, Props>(function FeedbackCard(
  { choice, continueLabel, onTryAgain, onContinue, reactor },
  headingRef,
) {
  const f = choice.feedback;
  return (
    <section className={`feedback${reactor ? " feedback--with-portrait" : ""}`} aria-labelledby="feedback-title">
      {reactor && (
        <div className="feedback__portrait">
          <CharacterSprite speakerId={reactor.speakerId} label={reactor.speakerLabel} size="portrait" />
          <span className="feedback__who">{speakerName(reactor)}</span>
        </div>
      )}
      <div className="feedback__body">
        <h2 id="feedback-title" ref={headingRef} tabIndex={-1} className="feedback__title">
          ผลของการสื่อสาร
        </h2>
        <dl className="feedback__parts">
          <div>
            <dt>สิ่งที่คุณสื่อได้</dt>
            <dd>{f.communicatedTh}</dd>
          </div>
          <div>
            <dt>ประโยคที่เป็นธรรมชาติ</dt>
            <dd className="feedback__natural">
              <span lang="en">“{f.naturalOption}”</span>
              {canSpeak() && (
                <button type="button" className="feedback__listen" onClick={() => speak(f.naturalOption)}>
                  ฟัง
                </button>
              )}
            </dd>
          </div>
          <div>
            <dt>ทำไมถึงได้ผล</dt>
            <dd>{f.whyItWorksTh}</dd>
          </div>
          <div>
            <dt>ลองใช้รูปประโยค</dt>
            <dd lang="en" className="feedback__pattern">
              {f.tryPattern}
            </dd>
          </div>
        </dl>
        <div className="feedback__actions">
          <button type="button" className="btn btn--soft" onClick={onTryAgain}>
            ลองตัวเลือกอื่น
          </button>
          <button type="button" className="btn btn--primary" onClick={onContinue}>
            {continueLabel}
          </button>
        </div>
      </div>
    </section>
  );
});

export default FeedbackCard;
