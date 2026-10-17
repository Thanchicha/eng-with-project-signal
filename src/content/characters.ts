import type { Character, CharacterId } from "./types";

// Spec 02 §4 — AU canon: everyone is a student; the team has just met.
export const characters: Record<CharacterId, Character> = {
  kuro: {
    id: "kuro",
    name: "Kuro Kagami",
    callName: "Kuro",
    role: "Developer / Technical Lead",
    roleTh: "นักพัฒนา / หัวหน้าฝ่ายเทคนิค",
    traitsTh: "สุขุม ช่างสังเกต สนใจระบบเบื้องหลัง แสดงความใส่ใจด้วยการลงมือแก้ปัญหา",
    avatar: { initials: "K", color: "#2b1d45" },
  },
  miyu: {
    id: "miyu",
    name: "Miyu Luminous",
    callName: "Miyu",
    role: "Business Analyst",
    roleTh: "นักวิเคราะห์ธุรกิจ",
    traitsTh: "สุภาพภายนอก ขี้เล่นและอ่านคนเก่ง ถนัดสัมภาษณ์และสรุป requirement",
    avatar: { initials: "M", color: "#c13a82" },
  },
  chief: {
    id: "chief",
    name: "Airi Tachibana",
    callName: "Chief",
    role: "Project Manager",
    roleTh: "ผู้จัดการโครงการ",
    traitsTh: "หัวหน้าห้องที่จัดระบบเก่ง ทุกคนเรียก Chief แม้เธอจะขอให้เรียก Airi",
    avatar: { initials: "A", color: "#6d4bb8" },
  },
  rei: {
    id: "rei",
    name: "Rei Amane",
    callName: "Rei",
    role: "Data Analyst",
    roleTh: "นักวิเคราะห์ข้อมูล",
    traitsTh: "ยึดหลักฐานและตัวเลข ตรวจที่มาของข้อมูลเสมอ",
    avatar: { initials: "R", color: "#3f5fa6" },
  },
  lena: {
    id: "lena",
    name: "Lena Kurosawa",
    callName: "Lena",
    role: "UX Researcher / Partnership Coordinator",
    roleTh: "นักวิจัยผู้ใช้ / ผู้ประสานงานพันธมิตร",
    traitsTh: "เข้ากับคนง่าย รู้จักนักเรียนหลายกลุ่ม พาทีมไปพบผู้ใช้จริง",
    avatar: { initials: "L", color: "#a35a1f" },
  },
  shion: {
    id: "shion",
    name: "Shion Amane",
    callName: "Shion",
    role: "QA / Risk Analyst",
    roleTh: "ผู้ทดสอบคุณภาพ / วิเคราะห์ความเสี่ยง",
    traitsTh: "เงียบ สุขุม เห็นรายละเอียดและกรณีขอบที่คนอื่นข้ามไป",
    avatar: { initials: "S", color: "#5d5470" },
  },
};
