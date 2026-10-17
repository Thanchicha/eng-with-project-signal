import { useState } from "react";
import { resetProgress, type Progress } from "../features/progress/progressStorage";
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
