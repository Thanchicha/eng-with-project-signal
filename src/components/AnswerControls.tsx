import { useEffect, useId, useRef, useState } from "react";
import { audioPlayer } from "../features/speech/audioPlayer";
import { getSpeechCapabilities } from "../features/speech/speechCapabilities";
import { createSpeechInput, type SpeechInputErrorCode } from "../features/speech/speechInput";
import type { Settings } from "../features/progress/progressStorage";
import "./PatternExercise.css"; // text input style
import "./SpeakResponse.css";

export type AnswerMode = "mic" | "said" | "typed";

interface Props {
  settings: Settings;
  onConsent: (value: "granted" | "declined") => void;
  /** Called once per attempt. `text` (mic or typed) is for on-screen self-check only — never store it. */
  onSubmit: (mode: AnswerMode, text?: string) => void;
  /** Short instruction above the buttons. */
  howTh?: string;
}

type Step = "answer" | "consent" | "listening" | "review" | "typing";

const MIC_ERRORS: Record<SpeechInputErrorCode, string> = {
  "not-allowed": "เบราว์เซอร์ไม่อนุญาตให้ใช้ไมโครโฟน กด \"ฉันพูดออกเสียงแล้ว\" หรือพิมพ์ตอบแทนได้",
  "no-speech": "ไม่ได้ยินเสียง ลองพูดใหม่อีกครั้ง หรือเลือกวิธีตอบอื่น",
  network: "บริการแปลงเสียงเป็นข้อความเชื่อมต่อไม่ได้ ตอบด้วยวิธีอื่นได้เลย",
  unsupported: "เบราว์เซอร์นี้แปลงเสียงเป็นข้อความไม่ได้ ตอบด้วยวิธีอื่นได้เลย",
  aborted: "การฟังหยุดไปกลางทาง ลองใหม่หรือเลือกวิธีตอบอื่น",
};

/**
 * The three ways to answer aloud (spec 05 §7 "โหมดการพูด"): optional mic after consent,
 * "I said it", or typing. Passing never depends on the mic, the browser or accent.
 */
export default function AnswerControls({ settings, onConsent, onSubmit, howTh }: Props) {
  const uid = useId();
  const micAvailable = getSpeechCapabilities().recognition && settings.micConsent !== "declined";
  const input = useRef(createSpeechInput());
  const [step, setStep] = useState<Step>("answer");
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState<string>();

  useEffect(() => {
    const mic = input.current;
    return () => mic.cancel();
  }, []);

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

  if (step === "consent") {
    return (
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
    );
  }

  if (step === "listening") {
    return (
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
    );
  }

  if (step === "review" || step === "typing") {
    return (
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
          <button
            type="button"
            className="btn btn--primary"
            disabled={!text.trim()}
            onClick={() => onSubmit(step === "review" ? "mic" : "typed", text.trim())}
          >
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
    );
  }

  return (
    <div className="speak-resp__modes">
      <p className="speak-resp__how">
        {howTh ?? "พูดคำตอบเป็นภาษาอังกฤษออกเสียง แล้วเลือกวิธีบันทึกว่าได้ลองพูดแล้ว ไม่มีการให้คะแนนสำเนียง"}
      </p>
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
        <button type="button" className="btn btn--soft" onClick={() => onSubmit("said")}>
          ฉันพูดออกเสียงแล้ว (I said it)
        </button>
        <button type="button" className="btn btn--soft" onClick={() => setStep("typing")}>
          พิมพ์ตอบแทน
        </button>
      </div>
    </div>
  );
}
