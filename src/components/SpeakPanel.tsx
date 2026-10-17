import { useEffect } from "react";
import type { SpeakPractice } from "../content/types";
import { canSpeak, speak, speakAll, stopSpeaking } from "../features/speech/speak";
import DialoguePanel from "./DialoguePanel";
import "./LearnSections.css";

interface Props {
  practice: SpeakPractice;
  showThaiAll: boolean;
}

/** Shadowing practice. Audio is optional; nothing is recorded or uploaded. */
export default function SpeakPanel({ practice, showThaiAll }: Props) {
  const hasVoice = canSpeak();
  useEffect(() => stopSpeaking, []);

  return (
    <div className="speak">
      <p className="paper paper__lead speak__situation">
        <strong>สถานการณ์:</strong> {practice.situationTh}
      </p>
      <p className="speak__how">
        {hasVoice
          ? "กดฟังทีละบรรทัดแล้วพูดตาม (shadowing) ไม่ต้องออกเสียงเหมือนเจ้าของภาษา แค่ให้ฟังเข้าใจก็พอ"
          : "อุปกรณ์นี้ไม่มีเสียงอ่าน ลองอ่านออกเสียงบทพูดด้วยตัวเองได้เลย ไม่ต้องออกเสียงเหมือนเจ้าของภาษา"}
      </p>
      {hasVoice && (
        <div className="speak__controls">
          <button type="button" className="btn btn--primary" onClick={() => speakAll(practice.lines.map((l) => l.textEn))}>
            ฟังทั้งบท
          </button>
          <button type="button" className="btn btn--ghost" onClick={stopSpeaking}>
            หยุด
          </button>
        </div>
      )}
      <DialoguePanel lines={practice.lines} showThaiAll={showThaiAll} onListen={hasVoice ? speak : undefined} />
    </div>
  );
}
