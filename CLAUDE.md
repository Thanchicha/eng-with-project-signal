# Project SIGNAL — กฎสำหรับ Claude

เว็บเกมฝึก **ฟังและพูด** ภาษาอังกฤษ "Angels of Deceit: Project SIGNAL" — วงจรหลัก: ฟัง → เข้าใจ → พูด → เห็นผล (อ่าน/เขียนเป็นตัวช่วยเสริม)

## 1. ขอบเขตไฟล์ (บังคับ)

- อ่าน ค้น และแก้ไฟล์ได้ **เฉพาะในโฟลเดอร์โปรเจคนี้** เท่านั้น
- ห้ามอ่าน path นอกโฟลเดอร์ ทั้งผ่าน Read/Glob/Grep และผ่าน shell (`cat`, `type`, `Get-Content`, `ls ..` ฯลฯ) เว้นแต่ผู้ใช้สั่งในแชทชัดเจน
- ห้ามเปิด `node_modules/`, `dist/`, `.venv/`, `package-lock.json` เว้นแต่ debug ที่จำเป็นจริง
- `.claude/hooks/guard-paths.mjs` บล็อก tool ไฟล์ที่ชี้ออกนอกโฟลเดอร์อยู่แล้ว — อย่าพยายามเลี่ยง

## 2. สเปค = source of truth

- สเปคปัจจุบันคือ `PROJECT_SIGNAL_VIBE_CODING_BRIEF_Final.md` — **ห้ามอ่านทั้งไฟล์** ให้เริ่มที่ `docs/spec/00-index.md` แล้วเปิดเฉพาะไฟล์ที่ขั้นนั้นต้องใช้
- ฉบับเก่า (เน้นอ่าน) อยู่ใน `docs/archive/` ไม่ใช้เป็นสเปคแล้ว
- ห้ามเพิ่มฟีเจอร์นอก MVP (`07-mvp-scope-tech.md` §10): ไม่มี backend, auth, AI API, API key, analytics, accent scoring
- Canon AU ห้ามเบี่ยง: ทุกคนเป็นนักเรียน, ทีมเพิ่งรู้จักกัน, Kuro = Developer, Miyu = BA, Airi = PM ที่ถูกเรียก "Chief", Kuro+Miyu มีบทสำคัญทุกฉาก, ห้ามอ้าง Project Eden/Subject 06
- บทพูด, Listening Check, Speaking Prompt และ feedback อยู่ที่ `docs/story/epXX.md` (รูปแบบใน `docs/story/FORMAT.md`) — ห้ามแก้ `src/content/epXX.ts` / `index.ts` ด้วยมือ: แก้ markdown แล้วรัน `npm run content` (สคริปต์ตรวจรูปแบบและจะ fail ถ้าไม่ครบ)
- Schema อยู่ที่ `src/content/types.ts`; EP1–3 เล่นได้ (ปลดล็อกตามลำดับ), EP4–12 เป็น locked preview พร้อม listening/speaking mission

## 3. กฎเสียงและไมโครโฟน (บังคับ)

- ไม่ autoplay — เสียงเล่นเมื่อผู้เล่นกดเท่านั้น; มี stop, replay, ช้า/ปกติ ทุกจุดที่มีเสียง
- transcript อังกฤษซ่อนจนฟังรอบแรกจบ แต่ปุ่ม Show transcript ใช้ได้ตลอด; คำแปลไทยเป็นปุ่มแยก; มี setting "Always show text" และ text-only
- เสียงผ่าน `AudioPlayer` adapter (`src/features/speech/`) — ตรวจ capability ณ runtime, ห้าม assume ว่ามีเสียง English หรือ recognizer
- Speech recognition เป็น optional: แสดง privacy notice (เบราว์เซอร์อาจส่งเสียงไปบริการ online) และขอความยินยอมก่อนขอไมค์ครั้งแรก, ขอ permission ตอนผู้เล่นกดพูดเท่านั้น, ข้อความที่ได้แก้ไขได้
- ทุกจุดพูดต้องมี "I said it" และช่องพิมพ์ — การผ่านฉากไม่ขึ้นกับไมค์ browser หรือสำเนียง
- ห้ามเก็บเสียงหรือ transcript จากไมค์ (ทั้ง localStorage และที่อื่น); ห้ามให้คะแนนสำเนียงหรือเทียบคำต่อคำ
- feedback การพูด: You communicated / A natural option / One small improvement / Say it again — เปิดหลังผู้เล่นลองแล้ว

## 4. Stack (ล็อกแล้ว)

React + TypeScript + Vite · plain CSS + design tokens (`src/styles/tokens.css`) · hash router ใน `src/app/router.ts` · ไม่มี UI library หนัก · progress/settings ใน localStorage · content แยกใน `src/content/` · Web Speech API (speechSynthesis + SpeechRecognition แบบ optional)

## 5. ลำดับการสร้าง (แผนฟัง-พูด)

จบแต่ละขั้น: `npm run build` ต้องผ่าน → สรุปสั้น ๆ ให้ผู้ใช้ → รอผู้ใช้ตกลง → commit

1. เอกสาร/กฎ: แตก brief Final เป็น `docs/spec/`, FORMAT.md v2, mission ใน `episodes.ts`
2. ชั้นเสียง: `audioPlayer.ts`, `speechCapabilities.ts`, `speechInput.ts`, settings เสียงใน progress
3. เนื้อหา EP1: types + converter (ListeningCheck, SpeakingPrompt, intern turns, briefing) + `docs/story/ep01.md` ฉบับฟัง-พูด
4. ฉากเรื่อง audio-first: Intro (Before Listening), AudioScenePlayer, ListeningCheck, SpeakResponse, PhraseBank
5. บทเรียน: patterns ฟังก่อน, Shadow & Substitute, roleplay Stand-up, Mini Case briefing, Write by Yourself (เสริม)
6. Recap / Home / Notebook / Settings (Voice & accessibility) / progress การฟัง-พูด
7. EP2–3 ฉบับฟัง-พูด + QA (`tests/e2e/qa_acceptance.py`, stub เสียง/ไมค์) → ติ๊ก `docs/spec/14-acceptance.md`

**Done** = ทุกข้อใน `14-acceptance.md` ผ่านจากการทดสอบจริง — รันซ้ำด้วย `tests/e2e/qa_acceptance.py` (วิธีรันใน `tests/e2e/README.md`) หลังแก้ UI หรือ content ทุกครั้ง

## 6. ประหยัด token

- หาไฟล์ด้วย Glob/Grep ก่อน Read; ไฟล์ยาวใช้ offset/limit
- แก้ด้วย Edit เฉพาะจุด ไม่เขียนทับทั้งไฟล์; ไม่อ่านซ้ำไฟล์ที่เพิ่งแก้
- ไม่ spawn subagent เว้นแต่ผู้ใช้ขอ; ไม่รัน dev server ทิ้งไว้โดยไม่จำเป็น — ใช้ `npm run build` ตรวจ
- ไม่พิมพ์โค้ดซ้ำในแชท; สรุปผลเป็นข้อสั้น ๆ
- ใช้ skill `frontend-design` ตอนทำ UI และ `webapp-testing` ตอน QA เท่านั้น; ถ้า `frontend-design` ขัดกับ brief ให้ยึด `06-screens-ux.md` และ `docs/design/DESIGN.md`
- Playwright อยู่ใน `.venv/` แล้ว (ดู `tests/e2e/README.md`) ไม่ต้องติดตั้งใหม่
