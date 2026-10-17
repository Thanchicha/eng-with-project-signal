# รูปแบบไฟล์เนื้อเรื่อง v2 — ฟังก่อน แล้วพูด (`docs/story/epXX.md`)

สัญญากลางระหว่างคนเขียนบทกับโค้ด — `npm run content` แปลงไฟล์เหล่านี้เป็น `src/content/epXX.ts`
ห้ามเปลี่ยนชื่อหัวข้อหรือ syntax โดยไม่แก้ไฟล์นี้และ `scripts/story-to-ts.mjs`
อ้างอิง: `docs/spec/04-ep01-content.md`, `05-gameplay-pedagogy.md`, `08-data-schema-storage.md`

## หัวข้อตามลำดับ

### `## Meta`
```
- id: ep01
- title: A Problem Without a Name
- level: A2 | B1
- roles: PM, BA
- listeningMission: ฟังโจทย์และบทสนทนาทีมเพื่อระบุสิ่งที่ยังไม่ชัด
- speakingMission: ถาม Chief, ขอ example จากผู้ใช้, สรุป fact และ unknown
- summaryTh: |
    (2–4 บรรทัด)
- learningGoals:
  - ...
```

### `## Before Listening`
- `**สถานการณ์:**` ไทย 2–4 บรรทัด
- `**เป้าหมายการฟัง:**` ไทย
- `**คำใบ้ก่อนฟัง:**` 2–3 คำภาษาอังกฤษ คั่นด้วย `, ` (ไม่จำเป็นต้องอยู่ในตารางศัพท์ เช่น brief EP1 ใช้ project, problem, improve)
- ตารางคำศัพท์ 8–12 คำ (แสดงหลังผู้เล่นลองฟังรอบแรก หรือเมื่อกดเปิดเอง):

| id | en | th | example |
| --- | --- | --- | --- |

### `## Scene N — <ชื่อฉาก>` (ทุกตอน 6–7 ฉาก)
```
- id: ep01_s1
- objective: Find out who will use the report.   ← Quest panel (EN)
- objectiveTh: หาว่าใครจะใช้รายงาน
- listenFor: ฟังว่าโจทย์ยังขาดอะไร                 ← เป้าหมายการฟังของฉาก (ไทย สั้น)
- background: bg_classroom_morning               ← ไม่บังคับ: ชื่อภาพฉาก public/art/bg/<name>.webp (ดู docs/art/ART_BRIEF.md)

Narration: "At 7:55 on Monday..." | "เวลา 7:55 วันจันทร์..."
Kuro: "That is not a complete [brief]." | "นั่นยังไม่ใช่โจทย์ที่ครบ"
```
- หนึ่งบรรทัดต่อหนึ่งคำพูด `Speaker: "EN" | "TH"` — ทุกบรรทัดเป็นเสียงที่เล่นได้ จึงเขียนให้ "ฟังรู้เรื่อง": ประโยคสั้น–กลาง ไม่มีวงเล็บหรือสัญลักษณ์ที่อ่านออกเสียงไม่ได้
- speaker: Narration, Screen, Kuro, Miyu, Chief, Lena, Rei, Shion, หรือตัวละครรอง เช่น `Student (Sora)`
- `[word]` เมื่อตรงกับ id ในตาราง, `[text](vocab:id)` เมื่อรูปคำต่างกัน

#### `### Listening Check` (ทุกฉากหลัก — ถามเป็นไทย ไม่ใช้ข้อสอบอ่านยาว)
```
- promptTh: ส่วนใดขาดไปจากโจทย์ของโรงเรียน?
- type: gist | detail
- choices:
  - a: ผู้ใช้และปัญหาที่ต้องการแก้
  - b: สีของหน้าจอ
  - c: ชื่อโปรแกรมที่จะใช้
- answer: a
- feedbackTh: Kuro บอกว่าโจทย์ "does not define the users or the result" ...
```
- ตอบผิดได้ ลองซ้ำได้ ไม่ล็อกเรื่อง; `feedbackTh` อธิบายว่าได้ยินคำตอบจากใคร/ประโยคไหน

#### `### Speak to Continue` (EP1 ต้องมีอย่างน้อย 3 ฉาก; แนะนำทุกฉาก)
```
- situationTh: พูดถาม Chief ให้ชี้แจงโจทย์ด้วยหนึ่งประโยค
- promptEn: Ask Chief to clarify the brief.
- askedBy: Chief                       ← ตัวละครที่ถามผู้เล่น (เสียงของเขาเล่นก่อน)
- askLine: "So, what do you want to ask first?"
- goal: ask | clarify | summarize | report | suggest
- phraseFrames: "What problem are we trying to solve?" ; "Who are the users for ___?"
- modelResponses: "Could you clarify the main problem?" ; "Who are the users for this project?"
- acceptedIntents: ถามว่าปัญหาหลักคืออะไร ; ถามว่าใครคือผู้ใช้
- You communicated: ...       (ไทย — เจตนาที่ผู้เล่นน่าจะสื่อได้เมื่อใช้ frame นี้)
- A natural option: "..."     (อังกฤษ)
- One small improvement: ...  (ไทย — ปรับทีละจุด เช่น เติม Could you… ให้สุภาพขึ้น)
```
- model response เป็นตัวอย่าง ไม่ใช่คำตอบเดียวที่ผ่าน; feedback เปิดหลังผู้เล่นลองพูด/กด I said it/พิมพ์

#### `### Interaction` (optional choice support — แสดงหลังพูด เพื่อดูผลของเจตนาแบบต่าง ๆ)
```
- promptEn: What should the team clarify first?
- promptTh: ทีมควรถามให้ชัดเรื่องอะไรก่อน?

#### Choice A — "Who are the users, and what problem do they have?"
- skillTags: problem-framing
- nextScene: ep01_s2
- You communicated: ...
- A natural option: "..."
- Why it works: ...
- Try a pattern: "..."
```
- 2–3 choices; ทุก choice ไปต่อได้ ฉากที่ไม่มี Interaction ไปฉากถัดไปตามลำดับ

### `## Analyst Note`
bullet ไทย: สิ่งที่รู้ / assumption / คำถามถัดไป (ห้ามเฉลยปริศนาใหญ่)

### `## Business & Data Lesson`
หนึ่งแนวคิด + ตัวอย่างจากเรื่อง

### `## Sentence Patterns` (3 แบบที่ "ได้ยิน" ในตอน — ผู้เล่นฟังตัวอย่างก่อนเห็นรูปแบบ)
`1. **Pattern** — ตัวอย่าง` + `แทนคำ: a / b / c`

### `## Shadow & Substitute` (3–5 ข้อ — ฟังต้นแบบ แล้วพูดตาม/แทนคำ)
```
1. mode: shadow | substitute
   - promptTh: ฟังแล้วพูดตาม จากนั้นเปลี่ยนเป็นงานของ Rei
   - modelPhrase: "Could you tell me more about the problem?"
   - frame: "Could you tell me more about ___?"
   - substitutions: the last report / the current process
   - hint: ...
   - examples: "Could you tell me more about the last report?" ; "..."
```

### `## Speak Like an Intern` (roleplay ทีละ turn)
```
สถานการณ์: Chief มอบหมายให้ทำ dashboard แต่ยังไม่ได้อธิบายผู้ใช้

Manager: "Please create a dashboard for student problems." | "ช่วยทำ dashboard ..."
Intern: พูดขอถาม requirement อย่างสุภาพ => "Could I ask a few questions about the requirements?"
Manager: "Of course." | "ได้สิ"
```
- บรรทัด `Intern:` = prompt ไทย `=>` model response อังกฤษ (เปิดหลังผู้เล่นพูด); บรรทัดอื่นเป็นเสียงของตัวละคร

### `## Mini Case`
- ตารางข้อมูล
- `Briefing (Speaker): "EN" | "TH"` — เสียงสรุปสถานการณ์ (ผู้เล่นกด Play Briefing)
- `**คำถาม (พูดตอบเป็นภาษาอังกฤษ):**` bullet, `**แม่แบบช่วยตอบ:**` bullet, `**คำตอบตัวอย่าง:**` (เปิดหลังผู้เล่นลองพูด)

### `## Write by Yourself` (เสริม — ไม่นับเป็นด่านหลัก)
รูปแบบเดียวกับ Drills เดิม: `1. type: fill | write | reorder` + promptTh / prompt / hint / acceptedExamples

### `## Recap`
bullet ไทย + `**คำศัพท์ทบทวน:**`, `**ภารกิจเสียง:**`, `**รูปประโยคทบทวน:**` (คั่น ` / `), `**ตอนต่อไป:**`

## กฎเนื้อหา
- A2–B1, คำใหม่ไม่เกิน 12 คำ/ตอน, ศัพท์สำคัญวนกลับมาในหลายฉากเพื่อให้จำผ่านการฟัง
- บทพูดรวม ~850–950 คำ/ตอน (ผู้ใช้ขอให้ยาวกว่ากรอบ 500–800 คำใน brief); แต่ละฉากฟังจบในราว 1–1.5 นาที; Kuro และ Miyu มีบทที่มีผลต่อเรื่องทุกฉาก; ความสัมพันธ์ตามตาราง §6 ห้ามสารภาพรัก
- Canon AU, ไม่เฉลยคดีใหญ่ก่อน EP11–12, ไม่กล่าวหาบุคคลจาก log/คะแนน, ไม่ใช้ข้อมูลส่วนตัวจริง
- feedback ไม่ใช่แค่ถูก/ผิด, ไม่พูดถึงสำเนียง, ยอมรับหลายคำตอบเมื่อความหมายเหมาะสม
