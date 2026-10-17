import { characters } from "../content/characters";
import type { CharacterId } from "../content/types";
import "./Avatar.css";

interface Props {
  characterId: CharacterId;
  size?: "sm" | "md";
}

/** Placeholder avatar: initials on the character's color (no image API in MVP). */
export default function Avatar({ characterId, size = "md" }: Props) {
  const c = characters[characterId];
  return (
    <span className={`avatar avatar--${size}`} style={{ background: c.avatar.color }} aria-hidden="true">
      {c.avatar.initials}
    </span>
  );
}
