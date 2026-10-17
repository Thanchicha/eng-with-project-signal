<!-- ที่มา: brief §6 เนื้อหาพร้อมเล่น Episode 1 — ใช้คัดลงไฟล์ src/content/ep01.ts ตรงตัว -->
### เนื้อหาพร้อมเล่น: Episode 1

ส่วนนี้เป็น reference content สำหรับสร้าง vertical slice; UI สามารถแสดงฉากทีละบรรทัดและแทรก interaction ตาม scene ID ได้

#### Before Reading

**สถานการณ์:** CAGE School เข้าร่วมการแข่งขันนวัตกรรมระหว่างโรงเรียน ทีม 2-A ต้องใช้ข้อมูลช่วยปรับปรุงชีวิตนักเรียน แต่โจทย์ยังไม่บอกว่าควรแก้ปัญหาอะไร

**เป้าหมาย:** เข้าใจโจทย์, ถามว่าใครคือผู้ใช้, และไม่รีบสร้างวิธีแก้ก่อนรู้ปัญหา

**คำศัพท์:** project (โครงการ), goal (เป้าหมาย), problem (ปัญหา), solution (วิธีแก้), requirement (ข้อกำหนด/ความต้องการ), stakeholder (ผู้เกี่ยวข้อง), user (ผู้ใช้), deadline (กำหนดส่ง), assumption (ข้อสันนิษฐาน), evidence (หลักฐาน), scope (ขอบเขต), source (แหล่งที่มา)

#### Scene 1 — The Brief

บรรทัดเรื่อง:

- Narration: “At 7:55 on Monday, a message appeared on every classroom screen.”
- Screen: “FUTURE SCHOOL PROJECT — Use data to improve student life.”
- Student: “Can we build a robot that does our homework?”
- Chief: “We have six weeks. First, we need to understand the task.”
- Kuro: “That is not a complete brief. It does not define the users or the result.”
- Miyu: “Then we should ask what problem the school wants us to solve.”

**Interaction:** What should the team clarify first?

- A: “Who are the users, and what problem do they have?” — feedback: ช่วยกำหนดผู้ใช้และปัญหาก่อนคิด solution; skill tag: problem-framing
- B: “Which programming language should we use?” — feedback: เป็นคำถามเทคนิคที่อาจจำเป็นภายหลัง แต่ยังเร็วไปก่อนรู้ว่ากำลังสร้างอะไร; skill tag: solution-first
- C: “Can we start building today?” — feedback: แสดงความกระตือรือร้น แต่ยังไม่มี requirement หรือ evidence; skill tag: planning

#### Scene 2 — Meet the Team

บรรทัดเรื่อง:

- Chief: “I’m Airi Tachibana, but everyone calls me Chief. I’ll manage the project.”
- Lena: “I can talk to students and arrange interviews.”
- Rei: “I can check what data the school already has.”
- Shion: “I’ll look for risks and cases we may miss.”
- Kuro: “I can inspect the current system and build a prototype.”
- Miyu: “I’ll find out what students actually need.”
- Kuro: “You already know what they need?”
- Miyu: “No. That’s why I need to ask them.”
- Chief: “Good. No one owns the whole answer. We’ll share what we learn.”

**Interaction:** The player chooses one useful PM question:

- “What is our deadline?” — reveals six-week plan; feedback about schedule
- “Who approves the final project?” — reveals teacher and student committee; feedback about decision stakeholders
- “Can we do every idea on the board?” — feedback: ช่วยเปิดประเด็น scope; ชวนถามต่อว่าจะจัดลำดับอย่างไร

#### Scene 3 — Problem or Solution?

บทสนทนา:

- Kuro: “We can build a reporting app.”
- Miyu: “What problem will it solve?”
- Kuro: “Students can report problems.”
- Miyu: “Who will read the reports? What will they do next?”
- Kuro: “We can decide that later.”
- Miyu: “If we decide later, we may build the wrong thing.”
- Kuro: “A prototype can help people react to something real.”
- Chief: “Both points are useful. We’ll learn about the problem and test a small prototype later.”

**Interaction:** Select the best next step:

- A: Interview students about a recent problem — feedback: เก็บ evidence จากประสบการณ์จริง; preferred next scene
- B: Build every feature Kuro can think of — feedback: เสี่ยง scope ใหญ่และยังไม่รู้ผู้ใช้
- C: Ask the teacher to choose a problem for students — feedback: ครูเป็น stakeholder แต่ไม่ควรใช้แทนเสียงผู้ใช้ทั้งหมด

#### Scene 4 — The Board and the First Clue

บทสนทนา:

- Rei: “The school has old reports about Wi-Fi, cafeteria lines, and missing announcements.”
- Shion: “The reports do not include every student group.”
- Lena: “I can help us speak with students from different classes.”
- Miyu: “Let’s ask about the last time the problem happened, not only what they prefer.”
- Kuro: “I found a file in the project folder. It has no source or owner.”
- Miyu: “Do we know if students agreed to share this data?”
- Kuro: “No. We should not use it yet.”
- Screen note: “The top score came from the wrong campus.”
- Miyu: “Is that a warning or a joke?”
- Kuro: “We don’t know. First, we check the file safely.”
- Chief: “Tomorrow we bring evidence, not guesses.”

**Interaction:** What should the team do with the file?

- A: Record where it was found and ask IT to confirm its source — feedback: รักษา evidence และขอผู้ดูแลระบบตรวจที่มา
- B: Publish it to the team chat so everyone can inspect it — feedback: แชร์ข้อมูลที่ไม่ทราบที่มา/สิทธิ์อาจสร้างความเสี่ยง
- C: Delete it immediately — feedback: ป้องกันการเปิดดูโดยไม่จำเป็นได้ แต่ทำให้เสียหลักฐาน; ควรจำกัดการเข้าถึงและแจ้ง IT

**Episode end:** ทีมเริ่มแผนสัมภาษณ์นักเรียนและเก็บเบาะแสเรื่อง campus ID โดยไม่มีใครถูกกล่าวหา

#### Analyst Note

- ข้อมูลไฟล์ไม่มี source จึงยังใช้สรุปหรือจัดอันดับไม่ได้
- ข้อความ “wrong campus” เป็น lead ที่ต้องตรวจ ไม่ใช่ข้อพิสูจน์ว่าโรงเรียนใดทำผิด
- Miyu แยก problem discovery ออกจาก solution design
- Kuro แสดงความรับผิดชอบด้วยการไม่ import ไฟล์ที่ไม่ทราบที่มา
- Chief จัดงานให้เดินต่อได้โดยไม่ต้องมีคำตอบทันที

#### Business & Data Lesson

ใช้กรอบ **User → Problem → Evidence → Success** ก่อนเลือก Solution:

- ใครกำลังเจอปัญหา?
- ปัญหาเกิดขึ้นเมื่อไรและอย่างไร?
- มีหลักฐานอะไรสนับสนุน?
- จะรู้ได้อย่างไรว่าดีขึ้น?

#### Sentence Patterns และ Drills

1. **We need to + verb** — We need to understand the problem.  
   แทนคำ: interview students / check the source / define the goal
2. **We don’t know whether + clause** — We don’t know whether the data is correct.  
   แทนคำ: the file is safe / students need this feature / the report is complete
3. **Before we + action, we should + action** — Before we use the file, we should check its source.  
   แทนคำ: build the app / talk to users; share the report / ask the data owner

ให้ผู้เล่นสร้าง 3–5 ประโยคด้วย pattern เหล่านี้และมี Show Example/Hint ได้

#### Speak Like an Intern

สถานการณ์: ผู้จัดการมอบหมายให้ทำ dashboard แต่ยังไม่ได้อธิบายผู้ใช้หรือการตัดสินใจ

- Manager: “Please create a dashboard for student problems.”
- Intern: “Could I ask a few questions about the requirements?”
- Manager: “Of course.”
- Intern: “Who will use the dashboard?”
- Manager: “The student committee and teachers.”
- Intern: “What decisions do they need to make?”
- Manager: “They need to choose which problem to address first.”
- Intern: “Let me check if I understand. We need to show the impact of each problem, not only the number of reports.”
- Manager: “Exactly.”

MVP: ให้กดฟังด้วย browser speech synthesis ได้ถ้ามีเสียง หรือให้ผู้เล่นอ่านตามเอง; การไม่มีเสียงต้องไม่ขัดขวางการเล่น

#### Mini Case

| ปัญหาที่ถูกรายงาน                     | จำนวนรายงาน |
| ------------------------------------- | ----------: |
| Slow Wi-Fi                            |          45 |
| Long cafeteria lines                  |          30 |
| Missing announcements                 |          15 |
| No wheelchair access to one classroom |           6 |
| Other                                 |           4 |

ผู้บริหารบอกว่า “Slow Wi-Fi has the most reports, so it must be our first priority.”

ให้ผู้เล่นตอบเป็นภาษาอังกฤษ:

- What else should we ask?
- Do we know how the students were selected?
- Does the number of reports show the severity of the problem?
- Who is affected by the access issue?

แม่แบบช่วยตอบ:

- “The data shows that ****\_\_****.”
- “However, we don’t know whether ****\_\_****.”
- “Before we decide, we should ****\_\_****.”

ตัวอย่างคำตอบที่ยอมรับ: “The data shows that Wi-Fi received the most reports. However, we don’t know how many students were affected by each problem. Before we decide, we should compare both impact and severity.”

#### Episode Recap

- ทีมได้โจทย์และกำหนดวิธีเริ่มค้นหาปัญหา
- ยังไม่ตัดสินใจสร้างแอปจนกว่าจะรู้ความต้องการ
- พบไฟล์ไม่มีแหล่งที่มาและเบาะแสเรื่อง wrong campus
- คำศัพท์ทบทวน: problem, requirement, stakeholder, evidence, source, scope
- รูปประโยคทบทวน: We need to… / We don’t know whether… / Before we…, we should…
