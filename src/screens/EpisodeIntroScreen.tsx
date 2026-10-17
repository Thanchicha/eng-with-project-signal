import { useEffect, useState } from "react";
import { navigate } from "../app/router";
import { audioPlayer, type AudioRate } from "../features/speech/audioPlayer";
import { getSpeechCapabilities, onVoicesChanged } from "../features/speech/speechCapabilities";
import Avatar from "../components/Avatar";
import { characters } from "../content/characters";
import { episodeContent } from "../content";
import type { CharacterId } from "../content/types";
import { isUnlocked, type Progress } from "../features/progress/progressStorage";
import "./EpisodeIntroScreen.css";

interface Props {
  episodeId: string;
  progress: Progress;
  onBegin: (episodeId: string) => void;
}

export default function EpisodeIntroScreen({ episodeId, progress, onBegin }: Props) {
  const ep = episodeContent[episodeId];
  const [showVocab, setShowVocab] = useState(false);

  if (!ep || !isUnlocked(episodeId, progress)) {
    return (
      <section className="intro-missing">
        <h1>ตอนนี้ยังเล่นไม่ได้</h1>
        <p>{ep ? `จบ Episode ${ep.number - 1} ก่อน แล้วตอนนี้จะปลดล็อก` : "ไม่พบตอนที่เลือก"}</p>
        <button type="button" className="btn btn--primary" onClick={() => navigate({ name: "home" })}>
          กลับแผนที่คดี
        </button>
      </section>
    );
  }

  // Main cast in canonical order (Kuro and Miyu lead every episode), limited to who speaks here.
  const speakers = new Set(ep.scenes.flatMap((s) => s.dialogue.map((d) => d.speakerId)));
  const cast = (Object.keys(characters) as CharacterId[]).filter((id) => speakers.has(id));
  const listenFirst = ep.format === 2;
  const resuming =
    progress.lastEpisodeId === ep.id && !!progress.lastSceneId && progress.lastSceneId !== "learn" && !progress.completedEpisodes.includes(ep.id);

  return (
    <article className="intro" aria-labelledby="intro-title">
      <a className="intro__back" href="#/">
        กลับแผนที่คดี
      </a>

      <header className="intro__head">
        <p className="intro__num">
          Episode {ep.number} <span className="intro__level">ระดับ {ep.level}</span>
        </p>
        <h1 id="intro-title" lang="en">
          {ep.title}
        </h1>
        {ep.summaryTh.split("\n").map((line) => (
          <p key={line} className="intro__summary">
            {line}
          </p>
        ))}
      </header>

      <div className="intro__paper">
        <section aria-labelledby="before-title">
          <h2 id="before-title">{listenFirst ? "ก่อนฟัง" : "ก่อนอ่าน"}</h2>
          <p>
            <strong>สถานการณ์:</strong> {ep.contextTh}
          </p>
          <p>
            <strong>{listenFirst ? "เป้าหมายการฟัง:" : "เป้าหมาย:"}</strong> {ep.goalTh}
          </p>
          {ep.hintWords.length > 0 && (
            <p className="intro__hints">
              <strong>คำใบ้ก่อนฟัง:</strong>{" "}
              {ep.hintWords.map((w) => (
                <span key={w} className="chip" lang="en">
                  {w}
                </span>
              ))}
            </p>
          )}
        </section>

        {(ep.listeningMissionTh || ep.speakingMissionTh) && (
          <section aria-labelledby="mission-title">
            <h2 id="mission-title">ภารกิจเสียงของตอนนี้</h2>
            <dl className="intro__missions">
              {ep.listeningMissionTh && (
                <div>
                  <dt>ฟัง</dt>
                  <dd>{ep.listeningMissionTh}</dd>
                </div>
              )}
              {ep.speakingMissionTh && (
                <div>
                  <dt>พูด</dt>
                  <dd>{ep.speakingMissionTh}</dd>
                </div>
              )}
            </dl>
            <SoundCheck rate={progress.settings.audioRate} textOnly={progress.settings.textOnly} />
          </section>
        )}

        <section aria-labelledby="goals-title">
          <h2 id="goals-title">สิ่งที่จะได้ฝึก</h2>
          <ul className="intro__goals">
            {ep.learningGoals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <p className="intro__roles">
            บทบาทในตอนนี้:{" "}
            {ep.roles.map((r) => (
              <span key={r} className="chip">
                {r}
              </span>
            ))}
          </p>
        </section>

        <section aria-labelledby="cast-title">
          <h2 id="cast-title">ตัวละครในตอนนี้</h2>
          <ul className="intro__cast">
            {cast.map((id) => (
              <li key={id}>
                <Avatar characterId={id} />
                <span>
                  <span className="intro__cast-name">{characters[id].callName}</span>
                  <span className="intro__cast-role">{characters[id].roleTh}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="vocab-title">
          <h2 id="vocab-title">คำศัพท์สำคัญ</h2>
          {listenFirst && !showVocab ? (
            <>
              <p className="intro__hint">แนะนำให้ลองฟังก่อน คำศัพท์ทั้งหมดจะขีดเส้นให้แตะดูในบทพูดหลังฟัง</p>
              <button type="button" className="btn btn--soft" onClick={() => setShowVocab(true)}>
                ดูคำศัพท์ทั้ง {ep.vocabulary.length} คำตอนนี้
              </button>
            </>
          ) : (
            <p className="intro__hint">กดที่คำเพื่อดูประโยคตัวอย่าง</p>
          )}
          {(!listenFirst || showVocab) && (
          <ul className="intro__vocab">
            {ep.vocabulary.map((v) => (
              <li key={v.id}>
                <details>
                  <summary>
                    <span lang="en" className="intro__vocab-en">
                      {v.en}
                    </span>
                    <span className="intro__vocab-th">{v.th}</span>
                  </summary>
                  <p lang="en" className="intro__vocab-example">
                    {v.example}
                  </p>
                </details>
              </li>
            ))}
          </ul>
          )}
        </section>
      </div>

      <div className="intro__cta">
        <button type="button" className="btn btn--primary intro__begin" onClick={() => onBegin(ep.id)}>
          {resuming ? "เล่นต่อจากฉากล่าสุด" : "เริ่มตอนนี้"}
        </button>
      </div>
    </article>
  );
}

/** Optional sound check (spec 06 B). Plays only on request; the mic is never asked for here. */
function SoundCheck({ rate, textOnly }: { rate: AudioRate; textOnly: boolean }) {
  const [caps, setCaps] = useState(getSpeechCapabilities);
  const [played, setPlayed] = useState(false);
  useEffect(() => onVoicesChanged(() => setCaps(getSpeechCapabilities())), []);

  if (textOnly) return <p className="intro__hint">เปิดโหมดข้อความอย่างเดียวอยู่ บทพูดจะแสดงเป็นข้อความแทนเสียง (เปลี่ยนได้ในตั้งค่า)</p>;
  if (!caps.tts) return <p className="intro__hint">เบราว์เซอร์นี้เล่นเสียงไม่ได้ เกมจะแสดงบทพูดเป็นข้อความแทน</p>;
  return (
    <p className="intro__soundcheck">
      <button
        type="button"
        className="btn btn--soft"
        onClick={() => {
          audioPlayer.playLines([{ speakerId: "miyu", textEn: "Hi, I'm Miyu. Can you hear me clearly?" }], { rate });
          setPlayed(true);
        }}
      >
        ทดสอบเสียง
      </button>
      <span className="intro__hint">
        {!caps.englishVoice
          ? "ยังไม่พบเสียงภาษาอังกฤษ ถ้าไม่ได้ยิน เกมจะให้อ่านบทพูดแทน"
          : played
            ? "ได้ยินแล้วใช่ไหม ถ้าไม่ได้ยิน ลองเพิ่มเสียงอุปกรณ์ หรือเปิดโหมดข้อความในตั้งค่า"
            : "เสียงจะเล่นเมื่อคุณกดเท่านั้น"}
      </span>
    </p>
  );
}
