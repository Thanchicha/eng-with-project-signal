import type { ReactNode } from "react";
import { backgroundUrl } from "../features/art/artAssets";
import "./SceneBackdrop.css";

interface Props {
  background?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Scene background: the illustration when it exists in src/assets/art/bg, otherwise a CSS night
 * city in the key-art palette. Purely decorative — the scene title and dialogue carry the meaning.
 */
export default function SceneBackdrop({ background, children, className = "" }: Props) {
  const url = backgroundUrl(background);
  return (
    <div className={`backdrop ${url ? "backdrop--art" : "backdrop--city"} ${className}`}>
      {url ? (
        <img className="backdrop__img" src={url} alt="" aria-hidden="true" />
      ) : (
        <svg className="backdrop__city" viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <circle cx="340" cy="34" r="24" className="backdrop__moon" />
          <path
            className="backdrop__far"
            d="M0 160V96h18V80h14v16h10V70h20v26h12V60h16v36h14V84h18v12h12V66h22v30h10V76h16v20h14V58h18v38h12V88h16v8h14V72h20v24h12V82h16v14h10V64h18v32h12v64z"
          />
          <path
            className="backdrop__near"
            d="M0 160v-38h26v-22h22v22h16v-30h24v30h14v-18h20v18h18v-40h26v40h12v-26h22v26h18v-34h24v34h14v-20h20v20h16v-28h24v28h20v38z"
          />
        </svg>
      )}
      <div className="backdrop__content">{children}</div>
    </div>
  );
}
