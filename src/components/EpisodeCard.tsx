import { routeToHash } from "../app/router";
import type { EpisodeSummary } from "../content/types";
import "./EpisodeCard.css";

export type EpisodeStatus = "done" | "open" | "waiting" | "soon";

const STATUS: Record<EpisodeStatus, { icon: string; label: (prev: number) => string }> = {
  done: { icon: "✓", label: () => "จบแล้ว เล่นซ้ำได้" },
  open: { icon: "▶", label: () => "เล่นได้" },
  waiting: { icon: "🔒", label: (prev) => `ปลดล็อกเมื่อจบ EP${prev}` },
  soon: { icon: "🔒", label: () => "เร็ว ๆ นี้" },
};

interface Props {
  episode: EpisodeSummary;
  status: EpisodeStatus;
  current?: boolean;
}

export default function EpisodeCard({ episode, status, current }: Props) {
  const { icon, label } = STATUS[status];
  const reachable = status === "done" || status === "open";
  const body = (
    <>
      <p className="ep-card__title" lang="en">
        {episode.title}
      </p>
      <p className="ep-card__mystery">{episode.mysteryTh}</p>
      <dl className="ep-card__meta">
        <div>
          <dt>บทบาท</dt>
          <dd>{episode.rolesTh}</dd>
        </div>
        <div>
          <dt>ฟัง</dt>
          <dd>{episode.listeningMissionTh}</dd>
        </div>
        <div>
          <dt>พูด</dt>
          <dd>{episode.speakingMissionTh}</dd>
        </div>
      </dl>
      <p className={`ep-card__status ep-card__status--${status}`}>
        <span aria-hidden="true">{icon}</span> {label(episode.number - 1)}
      </p>
    </>
  );

  return (
    <li className={`ep-node ep-node--${status}`}>
      <span className="ep-node__dot" aria-hidden="true">
        {status === "done" ? "✓" : episode.number}
      </span>
      {reachable ? (
        <a
          className={`ep-card ep-card--link${current ? " ep-card--current" : ""}`}
          href={routeToHash({ name: "intro", episodeId: episode.id })}
          aria-label={`Episode ${episode.number}: ${episode.title} — ${label(0)}`}
        >
          <span className="ep-card__num">Episode {episode.number}</span>
          {body}
        </a>
      ) : (
        <div className="ep-card ep-card--locked">
          <span className="ep-card__num">Episode {episode.number}</span>
          {body}
        </div>
      )}
    </li>
  );
}
