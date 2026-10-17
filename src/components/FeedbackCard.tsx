import { forwardRef } from "react";
import type { Choice } from "../content/types";
import { canSpeak, speak } from "../features/speech/speak";
import "./FeedbackCard.css";

interface Props {
  choice: Choice;
  isLastScene: boolean;
  onTryAgain: () => void;
  onContinue: () => void;
}

/** Four-part feedback (spec 05 §8) — explains, never just "correct/incorrect". */
const FeedbackCard = forwardRef<HTMLHeadingElement, Props>(function FeedbackCard(
  { choice, isLastScene, onTryAgain, onContinue },
  headingRef,
) {
  const f = choice.feedback;
  return (
    <section className="feedback" aria-labelledby="feedback-title">
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
          {isLastScene ? "จบเรื่อง ไปบทเรียนต่อ" : "ไปฉากต่อไป"}
        </button>
      </div>
    </section>
  );
});

export default FeedbackCard;
