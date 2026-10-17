# Spec Index — Project SIGNAL

เนื้อหาคัดลอกตรงตัวจาก `PROJECT_SIGNAL_VIBE_CODING_BRIEF.md` แยกตามหัวข้อ เปิดเฉพาะไฟล์ที่งานต้องใช้

| ไฟล์ | หัวข้อ brief | เปิดเมื่อ |
| --- | --- | --- |
| `01-concept-learners.md` | §1–2 แนวคิด, ผู้เล่น, เป้าหมายเรียน | เขียนข้อความหน้า Home / คำอธิบายเกม |
| `02-world-characters.md` | §3–4 AU canon, ตัวละคร, stakeholder | `characters.ts`, เขียน/ตรวจบทพูด |
| `03-plot-12-episodes.md` | §5–6 คดี, ตาราง 12 ตอน, beat sheet, เฉลยท้ายภาค | `episodes.ts` (การ์ด EP2–12 preview) |
| `04-ep01-content.md` | เนื้อหาพร้อมเล่น EP1 (scene, choice, drill, mini case, recap) | `ep01.ts` |
| `05-gameplay-pedagogy.md` | §7–8 วงจรเล่น, โครงตอน, feedback 4 ส่วน, ระดับภาษา | FeedbackCard, Exercise, progress indicators |
| `06-screens-ux.md` | §9 หน้าจอ A–G, ทิศทางภาพ/สี | สร้าง/ตกแต่งหน้าจอ, `tokens.css` |
| `07-mvp-scope-tech.md` | §10 scope, §13 stack/โครงไฟล์, §15 prompt, §16 ลำดับหลัง MVP | scaffold, ตัดสินว่าฟีเจอร์อยู่ใน scope ไหม |
| `08-data-schema-storage.md` | §11 schema Episode/Scene/Choice, §12 localStorage | types, content, `progressStorage.ts` |
| `14-acceptance.md` | §14 เกณฑ์รับมอบ (checklist) | ตรวจงานท้าย milestone |

## ไฟล์ที่ต้องเปิดต่อ milestone

1. Scaffold → 07, 06 (เฉพาะ "ทิศทางภาพ")
2. Types + content → 08, 02, 03, 04
3. Home / Intro → 06 (A–B), 01
4. Story Scene → 06 (C–D), 05, 04
5. Exercise / Mini Case / Speak → 06 (E–F), 05, 04
6. Recap / storage / settings → 06 (G), 08
7. QA → 14
