import type { ReactNode } from "react";
import { navigate, type Route } from "../app/router";
import "./AppShell.css";

interface Props {
  route: Route;
  children: ReactNode;
}

export default function AppShell({ route, children }: Props) {
  return (
    <div className="shell">
      <header className="shell__header">
        <a className="shell__brand" href="#/" aria-label="Project SIGNAL หน้าแรก">
          <SignalMark />
          <span>Project SIGNAL</span>
        </a>
        <nav aria-label="เมนูหลัก" className="shell__nav">
          <button
            type="button"
            className="shell__navlink"
            aria-current={route.name === "notebook" ? "page" : undefined}
            onClick={() => navigate({ name: "notebook" })}
          >
            สมุดคำศัพท์
          </button>
          <button
            type="button"
            className="shell__navlink"
            aria-current={route.name === "settings" ? "page" : undefined}
            onClick={() => navigate({ name: "settings" })}
          >
            ตั้งค่า
          </button>
        </nav>
      </header>
      <main className="shell__main" id="main">
        {children}
      </main>
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
