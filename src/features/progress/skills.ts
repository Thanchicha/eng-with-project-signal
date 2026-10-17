import type { Episode } from "../../content/types";

// Spec 05 §7 progress indicators. They reflect what the player practiced — never a score or rank.
// Tags that only describe a trap (solution-first, assumption, leading-question) count toward nothing.
export const SKILLS = [
  {
    id: "communication",
    nameEn: "Clear Communication",
    nameTh: "สื่อสารชัดเจน",
    descTh: "ถามให้ชัด ขอคำอธิบาย และสรุปให้คนอื่นเข้าใจ",
    tags: ["clarification", "open-question", "tone", "summarizing", "bug-report", "problem-framing"],
  },
  {
    id: "evidence",
    nameEn: "Evidence Thinking",
    nameTh: "คิดจากหลักฐาน",
    descTh: "แยกหลักฐานออกจากข้อสันนิษฐาน และบอกข้อจำกัดของข้อมูล",
    tags: ["evidence", "limitation", "sampling", "data-quality"],
  },
  {
    id: "teamwork",
    nameEn: "Teamwork",
    nameTh: "ทำงานเป็นทีม",
    descTh: "ฟังผู้ใช้และผู้เกี่ยวข้อง วางแผนร่วมกัน และดูแลความเสี่ยง",
    tags: ["user-research", "stakeholder-mapping", "planning", "scope", "requirement", "accessibility", "consent", "privacy", "risk"],
  },
] as const;

/** How many of the episode's viewed choices practiced each skill. */
export function skillCounts(episode: Episode, viewedChoices: string[]) {
  const viewed = episode.scenes.flatMap((s) => s.interaction?.choices ?? []).filter((c) => viewedChoices.includes(c.id));
  return SKILLS.map((skill) => ({
    ...skill,
    count: viewed.filter((c) => c.skillTags.some((t) => (skill.tags as readonly string[]).includes(t))).length,
  }));
}
