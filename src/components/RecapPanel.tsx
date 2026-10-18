import { useEffect, useState } from "react";
import { navigate } from "../app/router";
import { episodeSummaries } from "../content/episodes";
import type { Episode } from "../content/types";
import { isUnlocked, type Progress } from "../features/progress/progressStorage";
import { skillCounts } from "../features/progress/skills";
import { episodeXp, xpSummary } from "../features/progress/xp";
import { audioPlayer } from "../features/speech/audioPlayer";
import { canSpeak } from "../features/speech/speak";
import "./LearnSections.css";
import "./RecapPanel.css";

interface Props {
  episode: Episode;
  progress: Progress;
  onReplay: () => void;
}

/** Every speaking moment of an episode, as the ids LearnScreen/StoryScreen record. */
function speakingIds(ep: Episode): string[] {
  return [
    ...ep.scenes.flatMap((s) => (s.speakingPrompt ? [s.speakingPrompt.id] : [])),
    // Role-play turns: one id per scene in a chapter (the player said the lead's lines).
    ...ep.scenes.filter((s) => ep.chapters?.some((c) => c.sceneIds.includes(s.id))).map((s) => `${s.id}_role`),
    ...ep.shadowItems.map((i) => i.id),
    ...ep.speakPractice.turns.flatMap((t, i) => (t.kind === "intern" ? [`${ep.id}_rp${i}`] : [])),
    `${ep.id}_case`,
  ];
}

/**
 * Episode Complete (spec 06 G): what the team found, what the player listened to and said,
 * phrases to say again, scenes to hear again. Counts describe practice — never a grade.
 */
export default function RecapPanel({ episode, progress, onReplay }: Props) {
  const canPlay = canSpeak() && !progress.settings.textOnly;
  const rate = progress.settings.audioRate;
  const [playingScene, setPlayingScene] = useState<string>();
  useEffect(() => () => audioPlayer.stop(), []);

  const checks = episode.scenes.flatMap((s) => (s.listeningCheck ? [s.listeningCheck.id] : []));
  const checksTried = checks.filter((id) => progress.triedChecks.includes(id)).length;
  const speaking = speakingIds(episode);
  const spoken = speaking.filter((id) => progress.spokenIds.includes(id)).length;
  const replays = progress.replays[episode.id] ?? 0;
  const skills = skillCounts(episode, progress.viewedChoices);
  const earned = episodeXp(progress, episode.id);
  const xp = xpSummary(progress);
  const next = episodeSummaries.find((e) => e.number === episode.number + 1);
  const nextOpen = next && isUnlocked(next.id, progress);

  // Phrases the player heard and said: the episode's patterns plus each scene's natural answer.
  const phrases = [
    ...episode.sentencePatterns.map((p) => p.example),
    ...episode.scenes.flatMap((s) => (s.speakingPrompt ? [s.speakingPrompt.feedback.naturalOption] : [])),
  ];

  const say = (text: string) => audioPlayer.playLines([{ speakerId: "narrator", textEn: text }], { rate });
  const playScene = (sceneId: string) => {
    const scene = episode.scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    setPlayingScene(sceneId);
    audioPlayer.playLines(scene.dialogue, { rate, onEnd: () => setPlayingScene(undefined), onError: () => setPlayingScene(undefined) });
  };

  return (
    <div className="recap">
      <section className="hud recap__xp" aria-labelledby="recap-xp">
        <p className="recap__xp-eyebrow" lang="en">
          Mission Complete
        </p>
        <h2 id="recap-xp" className="recap__xp-num">
          +{earned} XP <span className="recap__xp-sub">จากตอนนี้</span>
        </h2>
        <p className="recap__xp-level">
          Level {xp.level}
          <span className="recap__xp-bar" aria-hidden="true">
            <span style={{ width: `${(xp.intoLevel / xp.perLevel) * 100}%` }} />
          </span>
          <span>
            {xp.intoLevel} / {xp.perLevel} XP
          </span>
        </p>
        <p className="recap__xp-note">XP มาจากการลงมือฟัง พูด และลองทำ ตอบผิดก็ไม่เสีย XP</p>
      </section>

      <section className="paper" aria-labelledby="recap-story">
        <h2 id="recap-story" className="recap__h">ทีมค้นพบอะไร</h2>
        <ul className="note-list">
          {episode.recap.bulletsTh.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="hud recap__card" aria-labelledby="recap-practice">
        <h2 id="recap-practice" className="recap__h">สิ่งที่คุณได้ลองฟังและพูด</h2>
        {episode.recap.voiceMissionTh && <p className="recap__note">ภารกิจเสียง: {episode.recap.voiceMissionTh}</p>}
        <ul className="recap__stats">
          {checks.length > 0 && (
            <li>
              <span className="recap__stat-num">
                {checksTried}/{checks.length}
              </span>
              <span>คำถามจับใจความที่ได้ลองตอบ</span>
            </li>
          )}
          <li>
            <span className="recap__stat-num">{replays}</span>
            <span>ครั้งที่กดฟังฉากซ้ำ</span>
          </li>
          <li>
            <span className="recap__stat-num">
              {spoken}/{speaking.length}
            </span>
            <span>จุดที่ได้ลองพูดออกเสียง</span>
          </li>
        </ul>
        <p className="recap__note">ตัวเลขนี้บอกสิ่งที่คุณได้ลองทำ ไม่ใช่คะแนนความเก่ง และไม่มีการวัดสำเนียง</p>
      </section>

      <section className="paper" aria-labelledby="recap-phrases">
        <h2 id="recap-phrases" className="recap__h">วลีที่พูดได้ ลองพูดซ้ำ</h2>
        <ul className="recap__phrases" lang="en">
          {phrases.map((ph) => (
            <li key={ph}>
              <span>{ph}</span>
              {canPlay && (
                <button type="button" className="listen" aria-label={`ฟังแล้วพูดตาม: ${ph}`} onClick={() => say(ph)}>
                  ฟังแล้วพูดตาม
                </button>
              )}
            </li>
          ))}
        </ul>
        <p className="recap__label">คำศัพท์ทบทวน</p>
        <ul className="pattern__subs" lang="en">
          {episode.recap.reviewVocabulary.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </section>

      {canPlay && (
        <section className="paper" aria-labelledby="recap-scenes">
          <h2 id="recap-scenes" className="recap__h">ฟังฉากซ้ำ</h2>
          <ul className="recap__scenes">
            {episode.scenes.map((s, i) => (
              <li key={s.id}>
                {playingScene === s.id ? (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => {
                      audioPlayer.stop();
                      setPlayingScene(undefined);
                    }}
                  >
                    <span aria-hidden="true">■</span> หยุด ฉาก {i + 1}
                  </button>
                ) : (
                  <button type="button" className="btn btn--soft" onClick={() => playScene(s.id)}>
                    <span aria-hidden="true">▶</span> ฉาก {i + 1}: <span lang="en">{s.title}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="paper" aria-labelledby="recap-skills">
        <h2 id="recap-skills" className="recap__h">การสื่อสารในงาน</h2>
        <ul className="recap__skills">
          {skills.map((s) => (
            <li key={s.id}>
              <span className="recap__skill-name">
                {s.nameTh} <span lang="en">({s.nameEn})</span>
              </span>
              <span className="recap__skill-desc">{s.descTh}</span>
              <span className="recap__skill-count">
                {s.count > 0 ? `ได้เห็นผลของทางเลือกแบบนี้ ${s.count} ครั้ง` : "ลองเปิด \"ดูผลของการพูดแบบอื่น\" ในฉาก เพื่อเทียบวิธีสื่อสาร"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {episode.recap.nextTeaserTh && (
        <section className="recap__teaser" aria-labelledby="recap-next">
          <h2 id="recap-next" className="recap__h">ภารกิจถัดไป</h2>
          <p>{episode.recap.nextTeaserTh}</p>
        </section>
      )}

      <div className="recap__actions">
        {next && nextOpen ? (
          <button type="button" className="btn btn--primary" onClick={() => navigate({ name: "intro", episodeId: next.id })}>
            เริ่ม Episode {next.number}
          </button>
        ) : (
          next && <p className="recap__soon">Episode {next.number} จะเปิดให้เล่นเร็ว ๆ นี้</p>
        )}
        <button type="button" className="btn btn--ghost" onClick={() => navigate({ name: "notebook" })}>
          ทบทวนคำศัพท์
        </button>
        <button type="button" className="btn btn--ghost" onClick={onReplay}>
          เล่นเนื้อเรื่องซ้ำ
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => navigate({ name: "home" })}>
          กลับแผนที่คดี
        </button>
      </div>
    </div>
  );
}
