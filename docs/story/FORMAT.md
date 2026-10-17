# รูปแบบไฟล์เนื้อเรื่อง (`docs/story/epXX.md`)

สัญญากลางระหว่างคนเขียนบทกับโค้ด — `src/content/epXX.ts` แปลงจากไฟล์เหล่านี้ ห้ามเปลี่ยนชื่อหัวข้อหรือ syntax โดยไม่แก้ไฟล์นี้

## หัวข้อตามลำดับ

### `## Meta`
```
- id: ep01
- title: A Problem Without a Name
- level: A2 | B1
- roles: PM, BA
- summaryTh: (2–4 บรรทัด)
- learningGoals:
  - ...
```

### `## Before Reading`
- `**สถานการณ์:**` ภาษาไทย 2–4 บรรทัด
- `**เป้าหมาย:**` ภาษาไทย
- ตารางคำศัพท์ 8–12 คำ:

| id | en | th | example |
| --- | --- | --- | --- |
| requirement | requirement | ข้อกำหนด/ความต้องการ | We need to check the requirements first. |

### `## Scene N — <ชื่อฉาก>` (EP1: 5–6 ฉาก, EP อื่น: 4–5 ฉาก)
```
- id: ep01_s1
- objective: Find out who will use the report.     ← แสดงใน Quest panel (EN)
- objectiveTh: หาว่าใครจะใช้รายงาน

Narration: "At 7:55 on Monday..." | "เวลา 7:55 วันจันทร์..."
Kuro: "That is not a complete [brief]." | "นั่นยังไม่ใช่โจทย์ที่ครบ"
```
- หนึ่งบรรทัดต่อหนึ่งคำพูด รูปแบบ `Speaker: "EN" | "TH"`
- speaker ที่ใช้ได้: Narration, Screen, Kuro, Miyu, Chief, Lena, Rei, Shion, Student, Teacher, IT, (ตัวละครรองตั้งชื่อเพิ่มได้ เช่น `Student (Yuto)`)
- ครอบคำศัพท์ด้วย `[word]` เมื่อ word ตรงกับ `id` ในตาราง หรือ `[text](vocab:id)` เมื่อรูปคำต่างกัน

#### `### Interaction`
```
- promptEn: What should the team clarify first?
- promptTh: ทีมควรถามให้ชัดเรื่องอะไรก่อน?

#### Choice A — "Who are the users, and what problem do they have?"
- skillTags: problem-framing
- nextScene: ep01_s2
- You communicated: ...      (ไทย)
- A natural option: "..."    (อังกฤษ)
- Why it works: ...          (ไทย)
- Try a pattern: "..."       (อังกฤษ + คำแทนที่ได้)
```
- 2–3 choices; ทุก choice ไปต่อได้ (ไม่มีทางตัน) — choice ที่ยังไม่ดีพอให้ feedback บอกว่าขาดอะไร แล้ว nextScene เดิม
- Choice ที่ดีที่สุดไม่ต้องอยู่ตำแหน่ง A เสมอ

### `## Analyst Note`
bullet ภาษาไทย: สิ่งที่รู้แล้ว / ยังเป็น assumption / คำถามถัดไป (ห้ามเฉลยปริศนาใหญ่)

### `## Business & Data Lesson`
หนึ่งแนวคิด + ตัวอย่างจากเรื่อง (ไทย มีศัพท์อังกฤษได้)

### `## Sentence Patterns`
3 แบบ: `1. **Pattern** — ตัวอย่าง` + `แทนคำ: a / b / c`

### `## Drills`
3–5 ข้อ:
```
1. type: substitution | reorder | fill | write
   - promptTh: ...
   - prompt: "Before we ___, we should ___."
   - hint: ...
   - acceptedExamples: "…" ; "…"
```

### `## Speak Like an Intern`
สถานการณ์ไทย 1 บรรทัด + บทสนทนา `Speaker: "EN" | "TH"` 6–10 บรรทัด

### `## Mini Case`
ตารางข้อมูล, คำกล่าวของ stakeholder, คำถาม EN 3–4 ข้อ, แม่แบบตอบ, คำตอบตัวอย่าง

### `## Recap`
bullet ไทย: เกิดอะไรขึ้น, ศัพท์ทบทวน, รูปประโยคทบทวน, ภารกิจถัดไป (teaser ตอนต่อไป)

## กฎเนื้อหา
- ภาษา A2–B1: ประโยคสั้น–กลาง, คำใหม่ไม่เกิน 12 คำ/ตอน, ศัพท์สำคัญจากตอนก่อนวนกลับมา
- บทสนทนารวม ~500–800 คำภาษาอังกฤษต่อตอน (ไม่นับ Drills/Speak/Mini Case)
- Kuro และ Miyu มีบทที่มีผลต่อเรื่องในทุกฉาก; ความสัมพันธ์ตามตาราง §6 ของตอนนั้น ห้ามสารภาพรัก
- Canon AU: ทุกคนเป็นนักเรียน, Airi = PM ที่ทุกคนเรียก "Chief", ห้ามอ้าง Project Eden/Subject 06/พลังพิเศษ
- ไม่เฉลยคำตอบคดีใหญ่ (§5) ก่อน EP11–12; เบาะแสต้องตรงกับ beat sheet ของตอนนั้น
- ไม่กล่าวหาบุคคลจาก log หรือคะแนน; ไม่ใช้ข้อมูลส่วนตัวจริง
