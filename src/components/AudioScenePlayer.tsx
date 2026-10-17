import { useEffect, useState } from "react";
import type { DialogueLine } from "../content/types";
import { audioPlayer, type AudioRate } from "../features/speech/audioPlayer";
import { hasTts } from "../features/speech/speechCapabilities";
import DialoguePanel, { SpeakerBadge, speakerName } from "./DialoguePanel";
import "./AudioScenePlayer.css";

interface Props {
  lines: DialogueLine[];
  rate: AudioRate;
  onRateChange: (rate: AudioRate) => void;
  /** Reveal the transcript without the player asking (after the listening check, or by setting). */
  revealTranscript: boolean;
  /** No audio at all: show the transcript as the scene. */
  textOnly: boolean;
  showThaiAll: boolean;
  onVocab: (vocabId: string) => void;
  /** First full listen (or full read in text mode) finished. */
  onHeard: () => void;
  /** Player pressed play again after the first listen. */
  onReplay?: () => void;
}

/**
 * Audio-first scene (spec 06 C): the player presses Play — never autoplay. Speaker names and
 * avatars show while the English text stays hidden until the transcript is revealed or asked for.
 */
export default function AudioScenePlayer({
  lines,
  rate,
  onRateChange,
  revealTranscript,
  textOnly,
  showThaiAll,
  onVocab,
  onHeard,
  onReplay,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(-1);
  const [plays, setPlays] = useState(0);
  const [audioFailed, setAudioFailed] = useState(!hasTts());
  const [showTranscript, setShowTranscript] = useState(false);
  const [heard, setHeard] = useState(false);

  const noAudio = textOnly || audioFailed;
  const transcriptVisible = noAudio || revealTranscript || showTranscript;

  // Stop speech when the scene changes or the screen closes.
  useEffect(() => () => audioPlayer.stop(), []);

  const markHeard = () => {
    if (heard) return;
    setHeard(true);
    onHeard();
  };

  const play = (from: DialogueLine[], offset = 0) => {
    if (plays > 0 && offset === 0) onReplay?.();
    setPlays((n) => n + 1);
    setPlaying(true);
    audioPlayer.playLines(from, {
      rate,
      onLine: (i) => setActive(i + offset),
      onEnd: () => {
        setPlaying(false);
        setActive(-1);
        if (offset === 0) markHeard();
      },
      onError: () => {
        setPlaying(false);
        setActive(-1);
        setAudioFailed(true);
      },
    });
  };

  const stop = () => {
    audioPlayer.stop();
    setPlaying(false);
    setActive(-1);
  };

  const current = active >= 0 ? lines[active] : undefined;
  const speakers = [...new Map(lines.filter((l) => l.speakerId !== "narration" && l.speakerId !== "screen").map((l) => [l.speakerId, l])).values()];

  return (
    <section className="scene-audio" aria-label="เสียงของฉาก">
      {noAudio ? (
        <div className="scene-audio__notice" role="status">
          <p>
            {textOnly
              ? "โหมดข้อความอย่างเดียว: อ่านบทพูดด้านล่างแทนการฟัง"
              : "อุปกรณ์นี้เล่นเสียงภาษาอังกฤษไม่ได้ อ่านบทพูดด้านล่างแทน แล้วลองอ่านออกเสียงเองได้"}
          </p>
          {!heard && (
            <button type="button" className="btn btn--primary" onClick={markHeard}>
              อ่านจบแล้ว
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="scene-audio__controls">
            {playing ? (
              <button type="button" className="btn btn--primary scene-audio__main" onClick={stop}>
                <span aria-hidden="true">■</span> หยุดเสียง
              </button>
            ) : (
              <button type="button" className="btn btn--primary scene-audio__main" onClick={() => play(lines)}>
                <span aria-hidden="true">▶</span> {plays === 0 ? "ฟังฉากนี้" : "ฟังทั้งฉากอีกครั้ง"}
              </button>
            )}
            <button
              type="button"
              className="btn btn--ghost"
              aria-pressed={rate === 0.75}
              onClick={() => onRateChange(rate === 1 ? 0.75 : 1)}
            >
              ความเร็ว: {rate === 1 ? "ปกติ" : "ช้า"}
            </button>
          </div>

          <div className="scene-audio__stage" aria-live="polite">
            <ul className="scene-audio__cast" aria-label="ผู้พูดในฉากนี้">
              {speakers.map((l) => (
                <li key={l.speakerId} className={current?.speakerId === l.speakerId ? "is-speaking" : undefined}>
                  <SpeakerBadge line={l} />
                  <span>{speakerName(l)}</span>
                </li>
              ))}
            </ul>
            <p className="scene-audio__now">
              {current
                ? `กำลังเล่น ${active + 1}/${lines.length}: ${current.speakerId === "narration" ? "ผู้บรรยาย" : current.speakerId === "screen" ? "ข้อความบนจอ" : speakerName(current)}`
                : plays === 0
                  ? "กดฟังก่อน บทพูดจะซ่อนไว้จนกว่าคุณจะลองฟังและตอบคำถาม"
                  : `ฟังแล้ว ${plays} ครั้ง ฟังซ้ำหรือฟังทีละบรรทัดได้ไม่จำกัด`}
            </p>
          </div>
        </>
      )}

      {!noAudio && !revealTranscript && (
        <button
          type="button"
          className="scene-audio__toggle"
          aria-expanded={showTranscript}
          onClick={() => setShowTranscript((v) => !v)}
        >
          {showTranscript ? "ซ่อนบทพูด" : "แสดงบทพูด (transcript)"}
        </button>
      )}

      {transcriptVisible && (
        <DialoguePanel
          lines={lines}
          showThaiAll={showThaiAll}
          onVocab={onVocab}
          activeIndex={active}
          onListen={noAudio ? undefined : (_l, i) => play(lines.slice(i, i + 1), i)}
        />
      )}
    </section>
  );
}
