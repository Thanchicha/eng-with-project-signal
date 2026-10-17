# Project SIGNAL — กฎสำหรับ Claude

เว็บเกมฝึกภาษาอังกฤษ "Angels of Deceit: Project SIGNAL" — MVP เล่นได้เฉพาะ Episode 1

## 1. ขอบเขตไฟล์ (บังคับ)

- อ่าน ค้น และแก้ไฟล์ได้ **เฉพาะในโฟลเดอร์โปรเจคนี้** เท่านั้น
- ห้ามอ่าน path นอกโฟลเดอร์ ทั้งผ่าน Read/Glob/Grep และผ่าน shell (`cat`, `type`, `Get-Content`, `ls ..` ฯลฯ) เว้นแต่ผู้ใช้สั่งในแชทชัดเจน
- ห้ามเปิด `node_modules/`, `dist/`, `package-lock.json` เว้นแต่ debug ที่จำเป็นจริง
- `.claude/hooks/guard-paths.mjs` บล็อก tool ไฟล์ที่ชี้ออกนอกโฟลเดอร์อยู่แล้ว — อย่าพยายามเลี่ยง

## 2. สเปค = source of truth

- **ห้ามอ่าน `PROJECT_SIGNAL_VIBE_CODING_BRIEF.md` ทั้งไฟล์** (ต้นฉบับเก็บไว้เป็น archive)
- เริ่มที่ `docs/spec/00-index.md` แล้วเปิดเฉพาะไฟล์ที่ milestone นั้นต้องใช้
- ห้ามเพิ่มฟีเจอร์นอก MVP (`07-mvp-scope-tech.md` §10): ไม่มี backend, auth, AI API, API key, analytics, speech-to-text
- Canon AU ห้ามเบี่ยง: ทุกคนเป็นนักเรียน, ทีมเพิ่งรู้จักกัน, Kuro = Developer, Miyu = BA, Airi = PM ที่ถูกเรียก "Chief", Kuro+Miyu มีบทสำคัญทุกฉาก, ห้ามอ้าง Project Eden/Subject 06
- บทพูด/feedback ของ EP1–3 อยู่ที่ `docs/story/ep01–03.md` (รูปแบบใน `docs/story/FORMAT.md`) — ห้ามแก้ `src/content/epXX.ts` / `index.ts` ด้วยมือ: แก้ markdown แล้วรัน `npm run content` (สคริปต์ตรวจรูปแบบและจะ fail ถ้าขาดหัวข้อ/feedback/vocab id ผิด)
- Schema อยู่ที่ `src/content/types.ts`; EP1–3 เล่นได้ (ปลดล็อกตามลำดับ), EP4–12 เป็น locked preview

## 3. Stack (ล็อกแล้ว)

React + TypeScript + Vite · plain CSS + design tokens (`src/styles/tokens.css`) · state-based router ง่าย ๆ (ไม่ใช้ React Router จนกว่าจะจำเป็น) · ไม่มี UI library หนัก · progress ใน localStorage · content แยกใน `src/content/` · โครงไฟล์ตาม §13

## 4. ลำดับการสร้าง (ทำทีละ milestone)

จบแต่ละขั้น: `npm run build` ต้องผ่าน → สรุปสั้น ๆ ให้ผู้ใช้ → รอผู้ใช้ตกลงก่อนไปขั้นถัดไป

1. Scaffold Vite React-TS + `tokens.css` (navy/teal, warm cream, coral/amber) + โครงโฟลเดอร์
2. Types ตาม schema §11 + `characters.ts`, `episodes.ts` (EP2–12 locked preview), `ep01.ts`
3. Home / Episode Map + Episode Intro
4. Story Scene: DialoguePanel, ChoiceList, FeedbackCard, Thai toggle, VocabularyPopover, Quest panel
5. Exercise (patterns, drills, write) + Mini Case + Speak Like an Intern (speechSynthesis แบบ optional)
6. Recap + progress/vocab storage (§12) + Settings (Thai hints, text size)
7. QA: keyboard, mobile ไม่มี scroll แนวนอน, prefers-reduced-motion → ติ๊ก `docs/spec/14-acceptance.md`

**Done** = ทุกข้อใน `14-acceptance.md` ผ่านจากการทดสอบจริง — รันซ้ำได้ด้วย `tests/e2e/qa_acceptance.py` (วิธีรันใน `tests/e2e/README.md`) หลังแก้ UI หรือ content ทุกครั้ง

## 5. ประหยัด token

- หาไฟล์ด้วย Glob/Grep ก่อน Read; ไฟล์ยาวใช้ offset/limit
- แก้ด้วย Edit เฉพาะจุด ไม่เขียนทับทั้งไฟล์; ไม่อ่านซ้ำไฟล์ที่เพิ่งแก้
- ไม่ spawn subagent เว้นแต่ผู้ใช้ขอ; ไม่รัน dev server ทิ้งไว้โดยไม่จำเป็น — ใช้ `npm run build` ตรวจ
- ไม่พิมพ์โค้ดซ้ำในแชท; สรุปผลเป็นข้อสั้น ๆ
- ใช้ skill `frontend-design` ตอนทำ UI (milestone 3–6) และ `webapp-testing` ตอน QA (milestone 7) เท่านั้น
- ถ้า `frontend-design` ขัดกับ brief (เช่น สี cream/coral) ให้ยึด `06-screens-ux.md` เสมอ
- `webapp-testing` ต้องใช้ Python + `pip install playwright` + `playwright install chromium` — ติดตั้งเมื่อถึง milestone 7 เท่านั้น
