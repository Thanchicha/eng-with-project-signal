# Art Brief — ภาพประกอบแบบ Visual Novel สำหรับ Project SIGNAL

เอกสารนี้บอกว่าต้องเตรียมภาพอะไรให้ Claude เพื่อทำฉากแบบ "พื้นหลัง + ตัวละครยืนคุยกัน" (VN style)
รายชื่อตัวละครและฉากด้านล่างดึงจาก `docs/story/ep01–03.md` จริง

## 1. กติการ่วมทุกภาพ

- **ห้ามมีข้อความฝังในภาพ** (ชื่อเรื่อง, คำบรรยาย, ป้าย ERROR, ภาษาญี่ปุ่น/ไทย) — เกมแสดงข้อความเอง ทำให้แปล อ่านด้วย screen reader และแก้บทได้
- **ยึด canon AU:** ทุกคนเป็นนักเรียนโรงเรียน CAGE, ไม่มีพลังพิเศษ, ไม่มีโซ่/กรงที่สื่อว่าถูกขัง, ไม่อ้างปมครอบครัว/Project Eden
  (key art ที่มีอยู่ใช้เป็น reference ด้านสไตล์และสีได้ แต่ข้อความบนภาพเป็นเรื่องสาย SS1)
- สไตล์เดียวกันทุกภาพ: anime, โทนม่วงกลางคืน + ชมพูนีออน ตาม `docs/design/DESIGN.md` (ฉากกลางวันให้สว่างขึ้นแต่ยังมีโทนม่วง-ชมพู)
- สิทธิ์ใช้งาน: ต้องเป็นภาพที่คุณมีสิทธิ์ใช้ในเว็บนี้ (วาดเอง, จ้าง, หรือ AI ที่เงื่อนไขอนุญาต) — แจ้งแหล่งที่มาไว้ใน `src/assets/art/CREDITS.md`

## 2. ภาพตัวละคร (sprites)

| สเปค | ค่า |
| --- | --- |
| ขนาด canvas | 1024 × 1536 px (2:3) เท่ากันทุกไฟล์ |
| ท่า | ครึ่งตัว (เอวขึ้นไป) หันหน้าตรงหรือเฉียงเล็กน้อย |
| พื้นหลัง | โปร่งใส (PNG หรือ WebP แบบ alpha) |
| ตำแหน่ง | ระดับสายตาอยู่ที่ความสูงเดียวกันทุกตัว (~ 25% จากขอบบน), ตัวละครอยู่กลาง canvas |
| ไฟล์ | WebP ≤ 300 KB ต่อไฟล์ |
| ชื่อไฟล์ | `<character>_<expression>.webp` เช่น `kuro_neutral.webp`, `miyu_smile.webp` |

### ตัวละครหลักและสีหน้าที่ต้องมี

| ตัวละคร | จำเป็น | ควรมี |
| --- | --- | --- |
| **Kuro** (Developer) | neutral, thinking, serious, surprised, smile-small | embarrassed, determined |
| **Miyu** (BA) | neutral, smile, curious, serious, playful | worried, embarrassed |
| **Chief / Airi** (PM) | neutral, smile, serious | stern |
| **Rei** (Data) | neutral, thinking, serious | — |
| **Lena** (UX) | neutral, smile, cheerful | — |
| **Shion** (QA) | neutral, serious, thinking | — |

รวมขั้นต่ำ **21 ภาพ** (Kuro 5, Miyu 5, Chief 3, Rei 3, Lena 3, Shion 3)

### ตัวละครรองใน EP1–3 (1 ภาพ neutral ต่อคน หรือ silhouette ก็พอ)

Haru, Taku, Nana (EP1) · Sora (EP2) · Mei — ใช้ screen reader บนมือถือ (EP3) · Ms. Hayashi ครูผู้ดูแลโครงการ (EP3) · เจ้าหน้าที่โรงอาหาร (EP2 Mini Case)

### Character reference sheet (แนะนำมาก)

1 หน้า/ตัวละครหลัก: หน้าตรง + ข้าง + ชุดนักเรียน + จุดสังเกต (ทรงผม, สีตา, แว่น, เครื่องประดับ) ช่วยให้ทุกภาพตรงกัน

## 3. ภาพพื้นหลัง (backgrounds)

| สเปค | ค่า |
| --- | --- |
| ขนาด | 1920 × 1080 px (16:9) |
| safe area มือถือ | จุดสำคัญอยู่ในกรอบกลางกว้าง ~ 610 px (มือถือจะ crop เป็นแนวตั้ง) |
| ไฟล์ | WebP ≤ 400 KB, ไม่มีคน/ตัวละครในภาพ |
| ชื่อไฟล์ | `bg_<place>_<time>.webp` |

| ไฟล์ | ใช้ในฉาก |
| --- | --- |
| `bg_classroom_morning` | EP1 S1; EP3 S3–S4 (ห้องเรียนปีหนึ่ง) |
| `bg_classroom_afterschool` | EP1 S2–S5; EP3 S5, S8–S9 |
| `bg_library_corner` | EP1 S7–S8 (สัมภาษณ์ Taku กับ Nana) |
| `bg_school_hallway` | EP1 S9, S15; EP2 S14; EP3 S12 (ทางเดินกลางวัน) |
| `bg_project_room_whiteboard` | EP1 S6, S10–S12; EP2 S1–S2, S8–S10; EP3 S1–S2, S10, S13–S15 |
| `bg_it_office` | EP1 S13–S14 (ห้อง IT) |
| `bg_cafeteria_kitchen` | EP2 S3, S13 |
| `bg_cafeteria_lunch` | EP2 S4–S7 (คิวหลายแถว ไม่มีป้าย) |
| `bg_cafeteria_signs` | EP2 S11–S12 (มีป้ายกระดาษเหนือแถว — ป้ายไม่มีตัวอักษรอ่านได้) |
| `bg_station_evening` | EP2 S15 The Walk Back |
| `bg_hallway_evening` | EP3 S6–S7 (Mei ทดสอบแบบสอบถามบนมือถือ) |
| `bg_teacher_office` | EP3 S11 พบครู Hayashi |

ชื่อภาพของแต่ละฉากกำหนดไว้ในบทแล้ว (`- background:` ใน `docs/story/epXX.md`) วางไฟล์ชื่อตรงกันแล้วจะแสดงเอง

## 4. ภาพเสริม (ไม่บังคับ)

- **Episode cover** ต่อตอน 1600 × 900 ไม่มีข้อความ (ใช้บนการ์ดแผนที่คดีและหน้า Intro)
- **CG ฉากสำคัญ** 1–2 ภาพ/ตอน เช่น Kuro กับ Miyu พบไฟล์ไม่มี source (EP1 S5)
- **โลโก้** "Project SIGNAL" แบบ SVG หรือ PNG โปร่งใส

### ช่องภาพที่ UI ใช้อยู่แล้ว (ถ้าไม่มีไฟล์จะใช้ภาพแทนอัตโนมัติ)
| ช่อง | ที่ใช้ | ไฟล์ที่ใช้ | ภาพแทน |
| --- | --- | --- | --- |
| Stage sprite | VN stage | `characters/<id>_<expression>.webp` | เงาตัวละครสีตาม avatar |
| Portrait | การ์ดบทบาท, ผู้ถามในหน้าฝึกพูด, Feedback, โปรไฟล์บนแถบหัว | ไฟล์ sprite เดียวกัน (ครอปช่วงอก-ศีรษะอัตโนมัติ) ดังนั้นให้ใบหน้าอยู่ ~25% จากขอบบน | เงาตัวละคร |
| Episode thumbnail | แถว Mission Map หน้าแรก | `bg/<background ของฉากแรก>.webp` | ฉากเมืองกลางคืน CSS |
| Scene background | VN stage | `bg/<name>.webp` ตาม `- background:` ในบท | ฉากเมืองกลางคืน CSS |

## 5. ส่งให้ Claude อย่างไร

1. วางไฟล์ใน `src/assets/art/characters/` และ `src/assets/art/bg/` ตามชื่อด้านบน
2. บอกว่าภาพครบแค่ไหน — ส่งทีละชุดได้ เกมจะใช้ avatar วงกลมเดิมแทนภาพที่ยังไม่มี
3. Claude จะเพิ่ม:
   - **รูปแบบบทใหม่** เช่น `Kuro[thinking]: "..." | "..."` และ `- background: bg_cafeteria_lunch` ต่อฉาก (ใส่ให้ EP1–3 อัตโนมัติจากบริบท แล้วให้คุณตรวจ)
   - **VN stage**: พื้นหลัง + ตัวละครสูงสุด 2 ตัว, คนพูดสว่าง คนฟังจางลง, เปลี่ยนสีหน้าตามบรรทัด, เฟดเบา ๆ (ปิดเมื่อ reduced motion)
   - alt text ไทยทุกภาพ และโหลดแบบ lazy เพื่อให้มือถือเร็ว
4. ถ้าอยากได้เสียงพากย์จริงภายหลัง: ไฟล์ต่อบรรทัด `<sceneId>_<lineNo>.mp3` — ระบบเสียงรองรับ `audio.assetUrl` อยู่แล้ว
