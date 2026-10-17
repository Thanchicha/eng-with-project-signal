# Spec Index — Project SIGNAL (ฟัง → พูด)

เนื้อหาคัดลอกตรงตัวจาก `PROJECT_SIGNAL_VIBE_CODING_BRIEF_Final.md` (ฉบับ 18 ต.ค. 2026 เน้นฟังและพูด) แยกตามหัวข้อ เปิดเฉพาะไฟล์ที่งานต้องใช้
ฉบับเก่า (เน้นอ่าน) เก็บที่ `docs/archive/` — ไม่ใช้เป็นสเปคแล้ว

| ไฟล์ | หัวข้อ brief | เปิดเมื่อ |
| --- | --- | --- |
| `01-concept-learners.md` | §1–2 แนวคิด, เสาหลัก (ฟังแล้วต้องใช้), เป้าหมายผู้เรียน | ข้อความหน้า Home / คำอธิบายเกม |
| `02-world-characters.md` | §3–4 AU canon, ตัวละคร, stakeholder | `characters.ts`, เขียน/ตรวจบทพูด |
| `03-plot-12-episodes.md` | §5–6 คดี, ตาราง 12 ตอน, **Listening/Speaking Mission ทุกตอน**, beat sheet, เฉลยท้ายภาค | `episodes.ts`, เขียน EP2+ |
| `04-ep01-content.md` | EP1 ฉบับฟัง-พูด: Before Listening, Listening Check, Speak to Continue, Stand-up with Chief, Mini Case briefing | `docs/story/ep01.md` |
| `05-gameplay-pedagogy.md` | §7–8 วงจรฟัง→พูด 9 ขั้น, โหมดพูด, โครงตอน 13 ส่วน, ระดับการเปิด transcript, feedback การพูด | StoryScreen, SpeakResponse, LearnScreen |
| `06-screens-ux.md` | §9 หน้าจอ A–H (รวม Voice Settings) และทิศทางภาพ | สร้าง/ตกแต่งหน้าจอ |
| `07-mvp-scope-tech.md` | §10 scope + ข้อจำกัดเสียงบนเว็บ, §13 โครงไฟล์ (AudioScenePlayer, SpeakResponse, speech/*), §15–16 | ตัดสินว่าอยู่ใน scope ไหม, ชั้นเสียง |
| `08-data-schema-storage.md` | §11 schema (ListeningCheck, SpeakingPrompt, audio), §12 localStorage | types, converter, progress |
| `14-acceptance.md` | §14 เกณฑ์รับมอบ 15 ข้อ (checklist) | ตรวจงานท้ายแต่ละขั้น |

## ไฟล์ที่ต้องเปิดต่อขั้น (แผนฟัง-พูด)

1. เอกสาร/กฎ → 00, 14
2. ชั้นเสียง (audioPlayer, speechInput) → 07 (ข้อจำกัดเสียง + หลักการ component), 08 §12
3. เนื้อหา EP1 → 08, 04, 05, 02
4. ฉากเรื่อง audio-first → 06 (B–C, H), 05
5. บทเรียนหลังเรื่อง → 06 (D–F), 05, 04
6. Recap / Settings / Progress → 06 (G–H), 08 §12, 05 (คะแนน/ความคืบหน้า)
7. EP2–3 + QA → 03 (mission), 14
