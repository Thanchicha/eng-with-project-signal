import { useEffect, useState } from "react";
import type { MiniCase } from "../content/types";
import type { Settings } from "../features/progress/progressStorage";
import { audioPlayer } from "../features/speech/audioPlayer";
import { canSpeak } from "../features/speech/speak";
import AnswerControls, { type AnswerMode } from "./AnswerControls";
import { SpeakerBadge, speakerName } from "./DialoguePanel";
import PhraseBank from "./PhraseBank";
import "./LearnSections.css";
import "./MiniCasePanel.css";

interface Props {
  miniCase: MiniCase;
  settings: Settings;
  onConsent: (value: "granted" | "declined") => void;
  onAttempt?: (mode: AnswerMode) => void;
}

/**
 * Mini Case (spec 06 F): look at a small table, play the spoken briefing, then say your
 * questions or a 1–3 sentence summary. The sample answer opens only after an attempt. No AI.
 */
export default function MiniCasePanel({ miniCase, settings, onConsent, onAttempt }: Props) {
  const canPlay = canSpeak() && !settings.textOnly;
  const numeric = new Set(miniCase.numericColumns ?? []);
  const briefing = miniCase.briefing;
  const [briefingShown, setBriefingShown] = useState(!canPlay || !briefing);
  const [answer, setAnswer] = useState<{ text?: string }>();

  useEffect(() => () => audioPlayer.stop(), []);
  const play = (textEn: string, speakerId = "narrator") => audioPlayer.playLines([{ speakerId, textEn }], { rate: settings.audioRate });

  return (
    <div className="minicase">
      <div className="paper">
        <div className="minicase__table-wrap" tabIndex={0} role="region" aria-label="ตารางข้อมูล">
          <table className="minicase__table">
            <thead>
              <tr>
                {miniCase.columns.map((c, i) => (
                  <th key={c} scope="col" className={numeric.has(i) ? "num" : undefined}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {miniCase.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" lang={/[a-z]/i.test(String(cell)) ? "en" : undefined}>
                        {cell}
                      </th>
                    ) : (
                      <td key={i} className={numeric.has(i) ? "num" : undefined}>
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {miniCase.noteTh && <p className="minicase__note">{miniCase.noteTh}</p>}

        <div className="minicase__briefing">
          {briefing && <SpeakerBadge line={briefing} />}
          <div>
            <p className="minicase__quote-who">{briefing ? `Briefing จาก ${speakerName(briefing)}` : miniCase.stakeholderLabelTh}</p>
            {briefingShown ? (
              <>
                <p lang="en" className="minicase__quote-en">
                  “{miniCase.stakeholderQuote}”
                </p>
                {briefing?.textTh && <p className="minicase__note">{briefing.textTh}</p>}
              </>
            ) : (
              <p className="minicase__note">กดฟัง briefing ก่อน แล้วข้อความจะแสดง</p>
            )}
            <div className="pattern__actions">
              {canPlay && briefing && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    play(briefing.textEn, briefing.speakerId);
                    setBriefingShown(true);
                  }}
                >
                  <span aria-hidden="true">▶</span> {briefingShown ? "ฟัง briefing อีกครั้ง" : "ฟัง briefing"}
                </button>
              )}
              {!briefingShown && (
                <button type="button" className="phrases__hint-toggle" onClick={() => setBriefingShown(true)}>
                  แสดงข้อความ
                </button>
              )}
            </div>
          </div>
        </div>

        <h3 className="minicase__h">ลองตั้งคำถามกับข้อมูลนี้ (พูดออกเสียง)</h3>
        <ul className="minicase__questions" lang="en">
          {miniCase.questions.map((q) => (
            <li key={q}>
              {q}
              {canPlay && (
                <button type="button" className="listen" aria-label={`ฟังคำถาม ${q}`} onClick={() => play(q)}>
                  ฟัง
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="paper minicase__answer">
        <h3 className="minicase__h">พูดสรุป 1–3 ประโยคเป็นภาษาอังกฤษ</h3>
        <PhraseBank
          frames={miniCase.templates}
          intentsTh={["บอกว่าข้อมูลแสดงอะไร", "บอกสิ่งที่ยังไม่รู้", "บอกว่าควรทำอะไรก่อนตัดสินใจ"]}
          rate={settings.audioRate}
          canPlay={canPlay}
        />
        {!answer ? (
          <AnswerControls
            settings={settings}
            onConsent={onConsent}
            howTh="พูดสรุปออกเสียงโดยใช้แม่แบบด้านบนได้ แล้วเลือกวิธีบันทึก คำตอบตัวอย่างจะเปิดหลังคุณลองแล้ว"
            onSubmit={(mode, text) => {
              setAnswer({ text });
              onAttempt?.(mode);
            }}
          />
        ) : (
          <div className="minicase__result" aria-live="polite">
            {answer.text && (
              <p className="speak-resp__yours">
                คุณพูด: <span lang="en">“{answer.text}”</span>
              </p>
            )}
            <p className="drill__result">
              เทียบกับตัวอย่าง: คำตอบที่ดีบอกว่าข้อมูลแสดงอะไร ยังไม่รู้อะไร และควรทำอะไรต่อ คำตอบของคุณไม่จำเป็นต้องเหมือนทุกคำ
            </p>
            <p className="minicase__sample" lang="en">
              {miniCase.sampleAnswer}
            </p>
            <div className="speak-resp__buttons">
              {canPlay && (
                <button type="button" className="btn btn--soft" onClick={() => play(miniCase.sampleAnswer)}>
                  ▶ ฟังคำตอบตัวอย่าง
                </button>
              )}
              <button type="button" className="btn btn--soft" onClick={() => setAnswer(undefined)}>
                พูดอีกครั้ง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
