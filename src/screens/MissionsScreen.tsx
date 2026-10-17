import EpisodeCard from "../components/EpisodeCard";
import { episodeSummaries } from "../content/episodes";
import { statusOf, nextEpisode } from "../features/progress/episodeStatus";
import type { Progress } from "../features/progress/progressStorage";
import "./HomeScreen.css";

/** Full mission list: all 12 episodes with role, listening and speaking mission (spec 06 A). */
export default function MissionsScreen({ progress }: { progress: Progress }) {
  const playable = episodeSummaries.filter((e) => e.playable);
  const done = playable.filter((e) => progress.completedEpisodes.includes(e.id)).length;
  const target = nextEpisode(progress).episode;

  return (
    <section className="map" aria-labelledby="map-title">
      <div className="map__head">
        <h1 id="map-title">แผนที่คดี</h1>
        <p className="map__progress">
          จบแล้ว {done} จาก {playable.length} ตอนที่เปิดให้เล่น
        </p>
      </div>
      <ol className="map__list">
        {episodeSummaries.map((ep) => (
          <EpisodeCard key={ep.id} episode={ep} status={statusOf(ep, progress)} current={ep.id === target.id} />
        ))}
      </ol>
    </section>
  );
}
