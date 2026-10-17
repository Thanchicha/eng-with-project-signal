import { useEffect, useMemo, useRef, useState } from "react";
import type { DialogueLine, VocabularyItem } from "../content/types";
import { audioPlayer, type AudioRate } from "../features/speech/audioPlayer";
import { hasTts } from "../features/speech/speechCapabilities";
import CharacterSprite from "./CharacterSprite";
import DialoguePanel, { renderWithVocab, speakerName } from "./DialoguePanel";
import SceneBackdrop from "./SceneBackdrop";
import "./VNStage.css";

interface Props {
  lines: DialogueLine[];
  background?: string;
  vocabulary: VocabularyItem[];
  rate: AudioRate;
  onRateChange: (rate: AudioRate) => void;
  /** Reveal English text without the player asking (after the listening check, or by setting). */
  revealTranscript: boolean;
  textOnly: boolean;
  showThaiAll: boolean;
  onVocab: (vocabId: string) => void;
  /** Every line was heard (or read in text mode), or the player chose to skip to the question. */
  onHeard: () => void;
  /** Player started the scene again after hearing it once. */
  onReplay?: () => void;
}

const isPerson = (l: DialogueLine) => l.speakerId !== "narration" && l.speakerId !== "screen";

/**
 * Visual-novel scene (mockup screen 2): backdrop, the speaker in front and the last other
 * speaker dimmed, one speech bubble per line. The player steps through lines (each plays its
 * audio) or turns on auto-play. English text stays hidden until the transcript is unlocked —
 * the bubble shows who is talking and a sound wave instead (brief Final §7).
 */
export default function VNStage({
  lines,
  background,
  vocabulary,
  rate,
  onRateChange,
  revealTranscript,
  textOnly,
  showThaiAll,
  onVocab,
  onHeard,
  onReplay,
}: Props) {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [auto, setAuto] = useState(false);
  const [heard, setHeard] = useState(false);
  const [audioFailed, setAudioFailed] = useState(!hasTts());
  const [showTranscript, setShowTranscript] = useState(false);
  const [showThai, setShowThai] = useState(false);
  const mainRef = useRef<HTMLButtonElement>(null);

  const noAudio = textOnly || audioFailed;
  const textVisible = noAudio || revealTranscript || showTranscript;
  const thaiVisible = showThaiAll || showThai;
  const line = lines[index];
  const last = lines.length - 1;

  useEffect(() => () => audioPlayer.stop(), []);

  const markHeard = () => {
    if (heard) return;
    setHeard(true);
    onHeard();
  };

  // Stable sides: speakers alternate left/right in order of first appearance.
  const sides = useMemo(() => {
    const order = [...new Set(lines.filter(isPerson).map((l) => l.speakerId))];
    return Object.fromEntries(order.map((id, i) => [id, i % 2 === 0 ? "left" : "right"])) as Record<string, "left" | "right">;
  }, [lines]);

  // Who is on stage: the current (or last) person speaking, plus the most recent other person.
  const current = [...lines.slice(0, index + 1)].reverse().find(isPerson);
  const other = current
    ? [...lines.slice(0, index + 1)].reverse().find((l) => isPerson(l) && l.speakerId !== current.speakerId && sides[l.speakerId] !== sides[current.speakerId])
    : undefined;
  const speaking = line && isPerson(line) ? line : undefined;

  const stop = () => {
    audioPlayer.stop();
    setPlaying(false);
    setAuto(false);
  };

  /** Play from line `from`; one line, or through to the end when auto-play is on. */
  const playFrom = (from: number, continuous: boolean) => {
    setIndex(from);
    setStarted(true);
    if (noAudio) return;
    setPlaying(true);
    const slice = continuous ? lines.slice(from) : lines.slice(from, from + 1);
    audioPlayer.playLines(slice, {
      rate,
      onLine: (i) => setIndex(from + i),
      onEnd: () => {
        setPlaying(false);
        setAuto(false);
        if (from + slice.length - 1 === last) markHeard();
      },
      onError: () => {
        setPlaying(false);
        setAuto(false);
        setAudioFailed(true);
      },
    });
  };

  const next = () => {
    if (!started) return playFrom(0, false);
    if (index < last) return playFrom(index + 1, false);
    if (noAudio) markHeard();
    else playFrom(index, false);
  };

  const prev = () => index > 0 && playFrom(index - 1, false);

  const toggleAuto = () => {
    if (auto) return stop();
    if (heard && index === last) onReplay?.();
    setAuto(true);
    playFrom(heard && index === last ? 0 : started ? index : 0, true);
  };

  const replayAll = () => {
    if (heard) onReplay?.();
    setAuto(true);
    playFrom(0, true);
  };

  const mainLabel = !started
    ? noAudio
      ? "เริ่มอ่าน"
      : "เริ่มฟัง"
    : index < last
      ? noAudio
        ? "บรรทัดถัดไป"
        : "ฟังบรรทัดถัดไป"
      : noAudio
        ? heard
          ? "อ่านครบแล้ว"
          : "อ่านจบแล้ว"
        : "ฟังบรรทัดนี้อีกครั้ง";

  // Key vocabulary used in this scene's lines (mockup "Key Vocabulary").
  const sceneWords = useMemo(() => {
    const ids = [...new Set(lines.flatMap((l) => l.vocabularyRefs?.map((r) => r.id) ?? []))];
    return ids.map((id) => vocabulary.find((v) => v.id === id)).filter((v): v is VocabularyItem => !!v);
  }, [lines, vocabulary]);

  const transcript = (
    <DialoguePanel
      lines={lines}
      showThaiAll={thaiVisible}
      onVocab={onVocab}
      activeIndex={playing ? index : -1}
      onListen={(_l, i) => playFrom(i, false)}
    />
  );

  return (
    <section className="vn" aria-label="ฉากเรื่อง">
      <SceneBackdrop background={background} className="vn__stage">
        <div className="vn__cast" aria-hidden="true">
          {[current, other]
            .filter((l): l is DialogueLine => !!l)
            .map((l) => (
              <div key={l.speakerId} className={`vn__actor vn__actor--${sides[l.speakerId]}`}>
                <CharacterSprite speakerId={l.speakerId} label={l.speakerLabel} dim={l.speakerId !== speaking?.speakerId} />
              </div>
            ))}
        </div>

        <div
          className={`vn__bubble vn__bubble--${line.speakerId === "narration" ? "narration" : line.speakerId === "screen" ? "screen" : sides[line.speakerId] ?? "left"}`}
          aria-live="polite"
        >
          {isPerson(line) && <p className="vn__name">{speakerName(line)}</p>}
          {line.speakerId === "screen" && <p className="vn__name vn__name--screen">ข้อความบนจอ</p>}
          {textVisible ? (
            <>
              <p className="vn__en" lang="en">
                {renderWithVocab(line, onVocab)}
              </p>
              {thaiVisible && line.textTh && <p className="vn__th">{line.textTh}</p>}
            </>
          ) : !started ? (
            <p className="vn__hint">กด เริ่มฟัง แล้วฟังทีละบรรทัด หรือเปิดเล่นอัตโนมัติ</p>
          ) : (
            <p className="vn__listening">
              <span className={`vn__wave${playing ? " vn__wave--on" : ""}`} aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
              {playing ? "กำลังพูด… ฟังให้จบก่อน" : "ข้อความจะแสดงหลังคุณฟังและตอบคำถาม"}
            </p>
          )}
          {started && !noAudio && (
            <button type="button" className="vn__line-listen" aria-label={`ฟังบรรทัดนี้อีกครั้ง: ${line.speakerId === "narration" ? "ผู้บรรยาย" : speakerName(line)}`} onClick={() => playFrom(index, false)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11" />
              </svg>
            </button>
          )}
        </div>
      </SceneBackdrop>

      <div className="vn__progress" aria-hidden="true">
        {lines.map((_, i) => (
          <span key={i} className={i === index && started ? "is-current" : i < index || (heard && i <= index) ? "is-done" : undefined} />
        ))}
      </div>
      <p className="vn__status" role="status">
        {heard ? "ฟังครบแล้ว" : started ? `บรรทัด ${index + 1} จาก ${lines.length}` : `ฉากนี้มี ${lines.length} บรรทัด`}
        {playing ? " กำลังเล่น" : ""}
      </p>

      <div className="vn__controls">
        <button type="button" className="btn btn--ghost vn__prev" onClick={prev} disabled={!started || index === 0} aria-label="บรรทัดก่อนหน้า">
          <span aria-hidden="true">◀</span>
        </button>
        {playing && !auto ? (
          <button ref={mainRef} type="button" className="btn btn--primary vn__main" onClick={stop}>
            <span aria-hidden="true">■</span> หยุดเสียง
          </button>
        ) : (
          <button ref={mainRef} type="button" className="btn btn--primary vn__main" onClick={next} disabled={noAudio && heard}>
            <span aria-hidden="true">▶</span> {mainLabel}
          </button>
        )}
        {!noAudio && (
          <button type="button" className="btn btn--ghost vn__auto" aria-pressed={auto} onClick={toggleAuto}>
            {auto ? "หยุดเล่นอัตโนมัติ" : "เล่นอัตโนมัติ"}
          </button>
        )}
        {!noAudio && (
          <button type="button" className="btn btn--ghost" aria-pressed={rate === 0.75} onClick={() => onRateChange(rate === 1 ? 0.75 : 1)}>
            ความเร็ว: {rate === 1 ? "ปกติ" : "ช้า"}
          </button>
        )}
        {!heard && (
          <button type="button" className="vn__skip" onClick={() => { stop(); markHeard(); }}>
            ข้ามไปคำถาม
          </button>
        )}
      </div>

      <div className="vn__panel">
        <div className="vn__vocab">
          <p className="vn__panel-h">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11" />
            </svg>
            คำศัพท์สำคัญในฉาก
          </p>
          {sceneWords.length ? (
            <ul>
              {sceneWords.map((v) => (
                <li key={v.id}>
                  <button type="button" className="vn__word" lang="en" aria-haspopup="dialog" onClick={() => onVocab(v.id)}>
                    {v.en}
                  </button>
                  {thaiVisible && <span className="vn__word-th">{v.th}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="vn__hint">ฉากนี้ไม่มีคำศัพท์ใหม่</p>
          )}
        </div>
        <div className="vn__panel-actions">
          {!showThaiAll && (
            <button type="button" className="btn btn--ghost" aria-pressed={showThai} onClick={() => setShowThai((v) => !v)}>
              {showThai ? "ซ่อนคำแปล" : "แสดงคำแปล"}
            </button>
          )}
          {!noAudio && (
            <button type="button" className="btn btn--ghost" onClick={replayAll}>
              ฟังทั้งฉากอีกครั้ง
            </button>
          )}
        </div>
      </div>

      {!noAudio && !revealTranscript && (
        <button type="button" className="vn__transcript-toggle" aria-expanded={showTranscript} onClick={() => setShowTranscript((v) => !v)}>
          {showTranscript ? "ซ่อนบทพูด" : "แสดงบทพูด (transcript)"}
        </button>
      )}
      {!noAudio &&
        (showTranscript ? (
          <div className="vn__all">{transcript}</div>
        ) : revealTranscript ? (
          <details className="vn__all">
            <summary>ดูบทพูดทั้งฉาก</summary>
            {transcript}
          </details>
        ) : null)}
    </section>
  );
}
