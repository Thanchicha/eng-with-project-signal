import { navigate } from "../app/router";
import EpisodeCard, { type EpisodeStatus } from "../components/EpisodeCard";
import { episodeSummaries } from "../content/episodes";
import { isUnlocked, type Progress } from "../features/progress/progressStorage";
import "./HomeScreen.css";

interface Props {
  progress: Progress;
}

function statusOf(id: string, playable: boolean, progress: Progress): EpisodeStatus {
  if (progress.completedEpisodes.includes(id)) return "done";
  if (isUnlocked(id, progress)) return "open";
  return playable ? "waiting" : "soon";
}

export default function HomeScreen({ progress }: Props) {
  const playable = episodeSummaries.filter((e) => e.playable);
  const inProgress = progress.lastEpisodeId && !progress.completedEpisodes.includes(progress.lastEpisodeId)
    ? episodeSummaries.find((e) => e.id === progress.lastEpisodeId)
    : undefined;
  const nextOpen = playable.find((e) => !progress.completedEpisodes.includes(e.id) && isUnlocked(e.id, progress));
  const target = inProgress ?? nextOpen ?? playable[0];
  const ctaLabel = inProgress
    ? `เล่นต่อ Episode ${target.number}`
    : nextOpen
      ? `เริ่ม Episode ${target.number}`
      : "เล่นซ้ำ Episode 1";
  const doneCount = playable.filter((e) => progress.completedEpisodes.includes(e.id)).length;

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <p className="hero__series" lang="en">
          Angels of Deceit
        </p>
        <h1 id="hero-title" className="hero__title" lang="en">
          Project SIGNAL
        </h1>
        <SignalWave />
        <p className="hero__pitch">
          ช่วย Kuro, Miyu และเพื่อนร่วมทีมไขปริศนาข้อมูลในโรงเรียน พร้อมฝึกถาม อธิบาย และตัดสินใจเป็นภาษาอังกฤษที่ใช้ทำงานได้จริง
        </p>
        <p className="hero__level">
          บทสนทนาภาษาอังกฤษระดับ <strong>A2–B1</strong> มีคำแปลไทยให้เปิดดู ตอบผิดได้ ลองใหม่ได้เสมอ
        </p>
        <div className="hero__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate({ name: "intro", episodeId: target.id })}
          >
            {ctaLabel}
          </button>
          <span className="hero__next" lang="en">
            {target.title}
          </span>
        </div>
      </section>

      <section className="map" aria-labelledby="map-title">
        <div className="map__head">
          <h2 id="map-title">แผนที่คดี</h2>
          <p className="map__progress">
            จบแล้ว {doneCount} จาก {playable.length} ตอนที่เปิดให้เล่น
          </p>
        </div>
        <ol className="map__list">
          {episodeSummaries.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} status={statusOf(ep.id, ep.playable, progress)} current={ep.id === target.id} />
          ))}
        </ol>
      </section>
    </>
  );
}

/** The one bold moment: a signal that settles into a flat line, drawn once on load. */
function SignalWave() {
  return (
    <svg className="hero__wave" viewBox="0 0 320 40" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 20 H40 L52 6 L64 34 L76 10 L88 30 L100 16 L112 24 L124 19 L136 21 H320"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
    </svg>
  );
}
