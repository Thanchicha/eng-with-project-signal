import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { SpeakingPrompt } from "../content/types";
import { audioPlayer } from "../features/speech/audioPlayer";
import { getSpeechCapabilities } from "../features/speech/speechCapabilities";
import { createSpeechInput, type SpeechInputErrorCode } from "../features/speech/speechInput";
import type { Settings } from "../features/progress/progressStorage";
import { SpeakerBadge, speakerName } from "./DialoguePanel";
import PhraseBank from "./PhraseBank";
import "./LearnSections.css";
import "./PatternExercise.css"; // text input style
import "./FeedbackCard.css"; // feedback list style
import "./SpeakResponse.css";

export type AnswerMode = "mic" | "said" | "typed";

interface Props {
  prompt: SpeakingPrompt;
  settings: Settings;
  onConsent: (value: "granted" | "declined") => void;
  /** Player answered in some way (mic text, "I said it", or typed). Text is never stored. */
  onAttempt?: (mode: AnswerMode) => void;
  /** Player picked a self-check after seeing feedback — the scene can continue. */
  onDone: (selfCheck: "idea" | "own") => void;
}

type Step = "answer" | "consent" | "listening" | "review" | "typing" | "feedback";

const MIC_ERRORS: Record<SpeechInputErrorCode, string> = {
  "not-allowed": "เบราว์เซอร์ไม่อนุญาตให้ใช้ไมโครโฟน กด \"ฉันพูดออกเสียงแล้ว\" หรือพิมพ์ตอบแทนได้",
  "no-speech": "ไม่ได้ยินเสียง ลองพูดใหม่อีกครั้ง หรือเลือกวิธีตอบอื่น",
  network: "บริการแปลงเสียงเป็นข้อความเชื่อมต่อไม่ได้ ตอบด้วยวิธีอื่นได้เลย",
  unsupported: "เบราว์เซอร์นี้แปลงเสียงเป็นข้อความไม่ได้ ตอบด้วยวิธีอื่นได้เลย",
  aborted: "การฟังหยุดไปกลางทาง ลองใหม่หรือเลือกวิธีตอบอื่น",
};

/**
 * Speak to Continue (spec 05 §7 steps 5–7). The player answers aloud; the mic is optional and
 * only used after consent. Passing never depends on the mic, the browser, accent, or matching
 * the model sentence — feedback opens after any attempt.
 */
const SpeakResponse = forwardRef<HTMLHeadingElement, Props>(function SpeakResponse(
  { prompt, settings, onConsent, onAttempt, onDone },
  headingRef,
) {
  const uid = useId();
  const caps = getSpeechCapabilities();
  const canPlay = caps.tts && !settings.textOnly;
  const micAvailable = caps.recognition && settings.micConsent !== "declined";
  const input = useRef(createSpeechInput());
  const [step, setStep] = useState<Step>("answer");
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState<string>();
  const [answered, setAnswered] = useState<{ mode: AnswerMode; text?: string }>();
  const [askShown, setAskShown] = useState(!canPlay);
  const rate = settings.audioRate;

  useEffect(() => {
    const mic = input.current;
    return () => {
      mic.cancel();
      audioPlayer.stop();
    };
  }, []);

  const play = (textEn: string, speakerId = "narrator") => audioPlayer.playLines([{ speakerId, textEn }], { rate });

  const startMic = () => {
    setMicError(undefined);
    setInterim("");
    audioPlayer.stop();
    const ok = input.current.start({
      onInterim: setInterim,
      onFinal: (t) => {
        setText(t);
        setStep("review");
      },
      onError: (code) => {
        setMicError(MIC_ERRORS[code]);
        setStep("answer");
      },
    });
    if (ok) setStep("listening");
    else setMicError(MIC_ERRORS.unsupported);
  };

  const submit = (mode: AnswerMode, said?: string) => {
    setAnswered({ mode, text: said?.trim() || undefined });
    setStep("feedback");
    onAttempt?.(mode);
  };

  const ask = prompt.askedBy;

  return (
    <section className="speak-resp" aria-labelledby={`${uid}-title`}>
      <p className="speak-resp__label">พูดเพื่อไปต่อ</p>
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

      {step === "answer" && (
        <div className="speak-resp__modes">
          <p className="speak-resp__how">พูดคำตอบเป็นภาษาอังกฤษออกเสียง แล้วเลือกวิธีบันทึกว่าได้ลองพูดแล้ว ไม่มีการให้คะแนนสำเนียง</p>
          {micError && (
            <p className="speak-resp__error" role="alert">
              {micError}
            </p>
          )}
          <div className="speak-resp__buttons">
            {micAvailable && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => (settings.micConsent === "granted" ? startMic() : setStep("consent"))}
              >
                <span aria-hidden="true">🎙</span> พูดผ่านไมโครโฟน
              </button>
            )}
            <button type="button" className="btn btn--soft" onClick={() => submit("said")}>
              ฉันพูดออกเสียงแล้ว (I said it)
            </button>
            <button type="button" className="btn btn--soft" onClick={() => setStep("typing")}>
              พิมพ์ตอบแทน
            </button>
          </div>
        </div>
      )}

      {step === "consent" && (
        <div className="speak-resp__consent" role="dialog" aria-labelledby={`${uid}-consent`}>
          <p id={`${uid}-consent`} className="speak-resp__consent-title">
            ก่อนใช้ไมโครโฟน
          </p>
          <ul>
            <li>เบราว์เซอร์จะขออนุญาตใช้ไมโครโฟนหลังคุณกดยินยอมเท่านั้น</li>
            <li>เบราว์เซอร์บางตัว (เช่น Chrome) ส่งเสียงไปยังบริการแปลงเสียงออนไลน์ของผู้ให้บริการเบราว์เซอร์</li>
            <li>เกมนี้ไม่ส่งเสียงไปที่เซิร์ฟเวอร์ของเกม และไม่บันทึกเสียงหรือข้อความที่คุณพูด</li>
            <li>ข้อความที่ได้ใช้ให้คุณตรวจตัวเองเท่านั้น ไม่ใช่คะแนน</li>
          </ul>
          <div className="speak-resp__buttons">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                onConsent("granted");
                startMic();
              }}
            >
              ยินยอมและเริ่มพูด
            </button>
            <button
              type="button"
              className="btn btn--soft"
              onClick={() => {
                onConsent("declined");
                setStep("answer");
              }}
            >
              ไม่ใช้ไมโครโฟน
            </button>
          </div>
        </div>
      )}

      {step === "listening" && (
        <div className="speak-resp__listening" role="status">
          <p className="speak-resp__mic-state">
            <span className="speak-resp__dot" aria-hidden="true" /> กำลังฟัง… พูดเป็นภาษาอังกฤษได้เลย
          </p>
          {interim && (
            <p lang="en" className="speak-resp__interim">
              {interim}
            </p>
          )}
          <div className="speak-resp__buttons">
            <button type="button" className="btn btn--primary" onClick={() => input.current.stop()}>
              <span aria-hidden="true">■</span> หยุดและดูข้อความ
            </button>
            <button
              type="button"
              className="btn btn--soft"
              onClick={() => {
                input.current.cancel();
                setStep("answer");
              }}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {(step === "review" || step === "typing") && (
        <div className="speak-resp__review">
          <label htmlFor={`${uid}-text`} className="speak-resp__review-label">
            {step === "review" ? "ข้อความที่ได้ยิน (แก้ไขได้ และจะไม่ถูกบันทึก)" : "พิมพ์สิ่งที่คุณจะพูด"}
          </label>
          {step === "review" && !text && <p className="speak-resp__how">ไม่ได้ยินคำพูด ลองพูดใหม่ หรือพิมพ์ลงช่องนี้แทนได้</p>}
          <textarea
            id={`${uid}-text`}
            className="drill__input"
            lang="en"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="speak-resp__buttons">
            <button type="button" className="btn btn--primary" disabled={!text.trim()} onClick={() => submit(step === "review" ? "mic" : "typed", text)}>
              ส่งคำตอบ
            </button>
            {step === "review" && (
              <button type="button" className="btn btn--soft" onClick={startMic}>
                พูดใหม่
              </button>
            )}
            <button
              type="button"
              className="btn btn--soft"
              onClick={() => {
                setText("");
                setStep("answer");
              }}
            >
              ย้อนกลับ
            </button>
          </div>
        </div>
      )}

      {step === "feedback" && answered && (
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
          </dl>
          <div className="speak-resp__buttons">
            <button
              type="button"
              className="btn btn--soft"
              onClick={() => {
                if (canPlay) play(prompt.feedback.naturalOption);
                setText("");
                setStep("answer");
              }}
            >
              พูดอีกครั้ง (Say it again)
            </button>
          </div>
          <p className="speak-resp__selfcheck">คำตอบของคุณเป็นแบบไหน?</p>
          <div className="speak-resp__buttons">
            <button type="button" className="btn btn--primary" onClick={() => onDone("idea")}>
              ใช้แนวคิดเดียวกัน (I used this idea)
            </button>
            <button type="button" className="btn btn--primary" onClick={() => onDone("own")}>
              ใช้คำของตัวเอง (I tried my own words)
            </button>
          </div>
        </div>
      )}
    </section>
  );
});

export default SpeakResponse;
