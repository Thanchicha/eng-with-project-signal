import type { ReactNode } from "react";
import { routeToHash, type Route } from "../app/router";
import { careerById } from "../content/careers";
import type { Progress } from "../features/progress/progressStorage";
import { xpSummary } from "../features/progress/xp";
import CharacterSprite from "./CharacterSprite";
import "./AppShell.css";

interface Props {
  route: Route;
  progress: Progress;
  children: ReactNode;
}

type Tab = { route: Route; label: string; icon: ReactNode; match: Route["name"][] };

const TABS: Tab[] = [
  { route: { name: "home" }, label: "หน้าแรก", match: ["home"], icon: <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" /> },
  {
    route: { name: "missions" },
    label: "ภารกิจ",
    match: ["missions", "intro", "play", "learn"],
    icon: <path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14M15 6v14" />,
  },
  { route: { name: "notebook" }, label: "คำศัพท์", match: ["notebook"], icon: <path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11" /> },
  {
    route: { name: "career" },
    label: "บทบาท",
    match: ["career"],
    icon: <path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4 7.2 18.9l.9-5.4L4.2 9.7l5.4-.8z" />,
  },
  {
    route: { name: "settings" },
    label: "ตั้งค่า",
    match: ["settings"],
    icon: <path d="M12 9a3 3 0 100 6 3 3 0 000-6zm8 3l-2.1-.6-.7-1.7 1-1.9-1.4-1.4-1.9 1-1.7-.7L12.6 4h-2l-.6 2.1-1.7.7-1.9-1-1.4 1.4 1 1.9-.7 1.7L4 11.4v2l2.1.6.7 1.7-1 1.9 1.4 1.4 1.9-1 1.7.7.6 2.1h2l.6-2.1 1.7-.7 1.9 1 1.4-1.4-1-1.9.7-1.7 2.1-.6z" />,
  },
];

export default function AppShell({ route, progress, children }: Props) {
  const xp = xpSummary(progress);
  const career = careerById(progress.career);

  const nav = (variant: "top" | "bottom") => (
    <nav aria-label="เมนูหลัก" className={`shell__tabs shell__tabs--${variant}`}>
      {TABS.map((t) => {
        const active = t.match.includes(route.name);
        return (
          <a key={t.label} href={routeToHash(t.route)} className="shell__tab" aria-current={active ? "page" : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="shell__tab-icon">
              {t.icon}
            </svg>
            <span>{t.label}</span>
          </a>
        );
      })}
    </nav>
  );

  return (
    <div className="shell">
      <header className="shell__header">
        <a className="shell__brand" href="#/" aria-label="Project SIGNAL หน้าแรก">
          <SignalMark />
          <span>Project SIGNAL</span>
        </a>
        {nav("top")}
        <a className="shell__profile" href="#/career" aria-label={`บทบาท ${career?.nameTh ?? "ยังไม่ได้เลือก"} เลเวล ${xp.level} มี ${xp.intoLevel} จาก ${xp.perLevel} XP`}>
          {career ? <CharacterSprite speakerId={career.lead} size="portrait" /> : <span className="shell__profile-empty" aria-hidden="true">?</span>}
          <span className="shell__profile-text" aria-hidden="true">
            <span className="shell__level">Level {xp.level}</span>
            <span className="shell__xpbar">
              <span style={{ width: `${(xp.intoLevel / xp.perLevel) * 100}%` }} />
            </span>
            <span className="shell__xp">
              {xp.intoLevel} / {xp.perLevel} XP
            </span>
          </span>
        </a>
      </header>
      <main className={`shell__main shell__main--${route.name}`} id="main">
        {children}
      </main>
      {nav("bottom")}
    </div>
  );
}

function SignalMark() {
  return (
    <svg className="shell__mark" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12h4l2-6 4 12 3-9 2 3h5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
