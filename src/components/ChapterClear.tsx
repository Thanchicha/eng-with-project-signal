import { forwardRef, useEffect, useState } from "react";
import type { Chapter } from "../content/types";
import type { Settings } from "../features/progress/progressStorage";
import { audioPlayer } from "../features/speech/audioPlayer";
import { getSpeechCapabilities } from "../features/speech/speechCapabilities";
import AnswerControls from "./AnswerControls";
import "./LearnSections.css";
import "./SpeakResponse.css";
import "./ChapterClear.css";

interface Props {
  chapter: Chapter;
  chapterCount: number;
  next?: Chapter;
  settings: Settings;
  onConsent: (value: "granted" | "declined") => void;
  /** Player said the key phrase (any mode). Text is never stored. */
  onSpoken: () => void;
  onNext: () => void;
  onPause: () => void;
}

/**
 * End of a chapter: what happened, one phrase from the chapter to hear and say again,
 * then the next chapter or a break. Saying the phrase is optional and never blocks.
 */
const ChapterClear = forwardRef<HTMLHeadingElement, Props>(function ChapterClear(
  { chapter, chapterCount, next, settings, onConsent, onSpoken, onNext, onPause },
  headingRef,
) {
  const canPlay = getSpeechCapabilities().tts && !settings.textOnly;
  const [shown, setShown] = useState(!canPlay || settings.alwaysShowTranscript);
  const [said, setSaid] = useState(false);
  const phrase = chapter.keyPhrase;
  useEffect(() => () => audioPlayer.stop(), []);

  return (
    <section className="hud chapter-clear" aria-labelledby="chapter-clear-title">
      <p className="chapter-clear__eyebrow" lang="en">
        Chapter {chapter.number} Clear
      </p>
      <h2 id="chapter-clear-title" ref={headingRef} tabIndex={-1} className="chapter-clear__title">
        บทที่ {chapter.number} จาก {chapterCount} จบแล้ว: <span lang="en">{chapter.title}</span>
      </h2>
      <p className="chapter-clear__summary">{chapter.summaryTh}</p>

      <div className="chapter-clear__phrase">
        <p className="chapter-clear__label">วลีประจำบท ฟังแล้วพูดตาม</p>
        {shown ? (
          <p className="chapter-clear__en" lang="en">
            “{phrase.textEn}”
          </p>
        ) : (
          <p className="chapter-clear__hint">กดฟังก่อน แล้วข้อความจะแสดง</p>
        )}
        {shown && phrase.textTh && <p className="chapter-clear__th">{phrase.textTh}</p>}
        {chapter.keyPhraseNoteTh && shown && <p className="chapter-clear__note">ใช้เมื่อ: {chapter.keyPhraseNoteTh}</p>}
        <div className="speak-resp__buttons">
          {canPlay && (
            <button
              type="button"
              className="btn btn--soft"
              onClick={() => {
                audioPlayer.playLines([phrase], { rate: settings.audioRate });
                setShown(true);
              }}
            >
              <span aria-hidden="true">▶</span> ฟังวลี
            </button>
          )}
          {!shown && (
            <button type="button" className="phrases__hint-toggle" onClick={() => setShown(true)}>
              แสดงข้อความ
            </button>
          )}
        </div>
        {said ? (
          <p className="chapter-clear__said" role="status">
            พูดแล้ว ลองใช้วลีนี้ในบทต่อไปได้เลย
          </p>
        ) : (
          <AnswerControls
            compact
            settings={settings}
            onConsent={onConsent}
            howTh="พูดวลีนี้ออกเสียงหนึ่งครั้ง (ไม่บังคับ ไม่มีคะแนน)"
            onSubmit={() => {
              setSaid(true);
              onSpoken();
            }}
          />
        )}
      </div>

      <div className="chapter-clear__actions">
        <button type="button" className="btn btn--primary" onClick={onNext}>
          {next ? (
            <>
              เริ่มบทที่ {next.number}: <span lang="en">{next.title}</span>
            </>
          ) : (
            "จบเรื่อง ไปบทเรียนต่อ"
          )}
        </button>
        {next && (
          <button type="button" className="btn btn--ghost" onClick={onPause}>
            พักก่อน กลับหน้าตอน
          </button>
        )}
      </div>
    </section>
  );
});

export default ChapterClear;
