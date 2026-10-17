import { useEffect, useState } from "react";
import { resetProgress, type Progress, type Settings } from "../features/progress/progressStorage";
import { audioPlayer } from "../features/speech/audioPlayer";
import { getSpeechCapabilities, onVoicesChanged } from "../features/speech/speechCapabilities";
import "../components/LearnSections.css";
import "./SettingsScreen.css";

interface Props {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}

export default function SettingsScreen({ progress, update }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const { thaiHints, textSize } = progress.settings;
  const setSetting = (patch: Partial<Progress["settings"]>) =>
    update((p) => ({ ...p, settings: { ...p.settings, ...patch } }));

  return (
    <article className="settings">
      <h1>ตั้งค่า</h1>

      <section className="paper settings__group" aria-labelledby="set-reading">
        <h2 id="set-reading" className="settings__h">การอ่าน</h2>

        <div className="settings__row">
          <div>
            <p className="settings__name" id="set-thai">
              แสดงคำแปลไทยทุกบรรทัด
            </p>
            <p className="settings__desc">ปิดไว้จะช่วยให้ฝึกอ่านภาษาอังกฤษก่อน แล้วกด "แปล" เฉพาะบรรทัดที่ต้องการ</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={thaiHints}
            aria-labelledby="set-thai"
            className="switch"
            onClick={() => setSetting({ thaiHints: !thaiHints })}
          >
            <span className="switch__label">{thaiHints ? "เปิด" : "ปิด"}</span>
          </button>
        </div>

        <fieldset className="settings__row settings__fieldset">
          <legend className="settings__name">ขนาดตัวอักษร</legend>
          <div className="settings__choices">
            {(
              [
                ["normal", "ปกติ"],
                ["large", "ใหญ่"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="settings__radio">
                <input
                  type="radio"
                  name="text-size"
                  value={value}
                  checked={textSize === value}
                  onChange={() => setSetting({ textSize: value })}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <VoiceSettings settings={progress.settings} setSetting={setSetting} />

      <section className="paper settings__group" aria-labelledby="set-data">
        <h2 id="set-data" className="settings__h">ข้อมูลของคุณ</h2>
        <p className="settings__desc">
          ความคืบหน้า คำศัพท์ที่บันทึก และการตั้งค่า เก็บไว้ในเบราว์เซอร์นี้เท่านั้น ไม่มีการส่งชื่อ อีเมล หรือเสียงไปที่ใด
        </p>
        {!confirming ? (
          <button type="button" className="btn btn--soft" onClick={() => setConfirming(true)}>
            ล้างความคืบหน้าทั้งหมด
          </button>
        ) : (
          <div className="settings__confirm" role="alert">
            <p>ความคืบหน้าทุกตอน คำศัพท์ที่บันทึก และการตั้งค่าจะถูกลบ และกู้คืนไม่ได้</p>
            <div className="settings__confirm-actions">
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  const fresh = resetProgress();
                  update(() => fresh);
                  setConfirming(false);
                  setResetDone(true);
                }}
              >
                ล้างเลย
              </button>
              <button type="button" className="btn btn--soft" onClick={() => setConfirming(false)}>
                ยกเลิก
              </button>
            </div>
          </div>
        )}
        <p aria-live="polite" className="settings__desc">
          {resetDone ? "ล้างความคืบหน้าแล้ว เริ่ม Episode 1 ใหม่ได้จากแผนที่คดี" : ""}
        </p>
      </section>
    </article>
  );
}

const CONSENT_TH: Record<Settings["micConsent"], string> = {
  unset: "ยังไม่ได้เลือก เกมจะถามพร้อมคำอธิบายเรื่องความเป็นส่วนตัวเมื่อคุณกดพูดผ่านไมโครโฟนครั้งแรก",
  granted: "อนุญาตแล้ว ไมโครโฟนจะเปิดเฉพาะตอนคุณกดพูด และหยุดเมื่อกดหยุดหรือยกเลิก",
  declined: "ไม่ใช้ไมโครโฟน ตอบด้วย \"ฉันพูดออกเสียงแล้ว\" หรือพิมพ์แทน",
};

/** Spec 06 H: transcript, speed, text-only, sound test and microphone choice. */
function VoiceSettings({ settings, setSetting }: { settings: Settings; setSetting: (patch: Partial<Settings>) => void }) {
  const [caps, setCaps] = useState(getSpeechCapabilities);
  useEffect(() => onVoicesChanged(() => setCaps(getSpeechCapabilities())), []);
  useEffect(() => () => audioPlayer.stop(), []);

  return (
    <section className="paper settings__group" aria-labelledby="set-voice">
      <h2 id="set-voice" className="settings__h">เสียงและการเข้าถึง</h2>

      <SwitchRow
        id="set-transcript"
        label="แสดงบทพูดตั้งแต่ต้น (Always show text)"
        desc="เหมาะเมื่ออยู่ในที่สาธารณะหรือฟังไม่สะดวก ปกติบทพูดจะซ่อนจนคุณฟังและตอบคำถามจับใจความ"
        checked={settings.alwaysShowTranscript}
        onChange={(v) => setSetting({ alwaysShowTranscript: v })}
      />
      <SwitchRow
        id="set-textonly"
        label="โหมดข้อความอย่างเดียว"
        desc="ไม่เล่นเสียงเลย อ่านบทพูดแทนการฟัง ยังพูดตอบหรือพิมพ์ได้ตามปกติ"
        checked={settings.textOnly}
        onChange={(v) => setSetting({ textOnly: v })}
      />

      <fieldset className="settings__row settings__fieldset">
        <legend className="settings__name">ความเร็วเสียงเริ่มต้น</legend>
        <div className="settings__choices">
          {(
            [
              [1, "ปกติ"],
              [0.75, "ช้า"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="settings__radio">
              <input
                type="radio"
                name="audio-rate"
                checked={settings.audioRate === value}
                onChange={() => setSetting({ audioRate: value })}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="settings__row">
        <div>
          <p className="settings__name">ทดสอบเสียง</p>
          <p className="settings__desc">
            {!caps.tts
              ? "เบราว์เซอร์นี้เล่นเสียงไม่ได้ เกมจะแสดงบทพูดเป็นข้อความแทน"
              : caps.englishVoice
                ? "พบเสียงภาษาอังกฤษในอุปกรณ์นี้"
                : "ยังไม่พบเสียงภาษาอังกฤษ ถ้าไม่ได้ยิน เกมจะให้อ่านบทพูดแทน"}
          </p>
        </div>
        <button
          type="button"
          className="btn btn--soft"
          disabled={!caps.tts || settings.textOnly}
          onClick={() =>
            audioPlayer.playLines([{ speakerId: "kuro", textEn: "This is Kuro. The audio works on this device." }], {
              rate: settings.audioRate,
            })
          }
        >
          ▶ ฟังตัวอย่าง
        </button>
      </div>

      <div className="settings__row">
        <div>
          <p className="settings__name">ไมโครโฟน (ไม่บังคับ)</p>
          <p className="settings__desc" role="status">
            {caps.recognition ? CONSENT_TH[settings.micConsent] : "เบราว์เซอร์นี้แปลงเสียงเป็นข้อความไม่ได้ ใช้ \"ฉันพูดออกเสียงแล้ว\" หรือพิมพ์ตอบได้ทุกจุด"}
          </p>
          <p className="settings__desc">เกมไม่บันทึกเสียงหรือข้อความที่คุณพูด และไม่ส่งเสียงไปที่เซิร์ฟเวอร์ของเกม</p>
        </div>
        {caps.recognition && settings.micConsent !== "unset" && (
          <button type="button" className="btn btn--soft" onClick={() => setSetting({ micConsent: "unset" })}>
            ให้ถามใหม่
          </button>
        )}
      </div>
    </section>
  );
}

function SwitchRow({ id, label, desc, checked, onChange }: { id: string; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="settings__row">
      <div>
        <p className="settings__name" id={id}>
          {label}
        </p>
        <p className="settings__desc">{desc}</p>
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-labelledby={id} className="switch" onClick={() => onChange(!checked)}>
        <span className="switch__label">{checked ? "เปิด" : "ปิด"}</span>
      </button>
    </div>
  );
}
