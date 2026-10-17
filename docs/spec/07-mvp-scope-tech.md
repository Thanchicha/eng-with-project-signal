<!-- ที่มา: brief §10, §13, §15–16 -->
## 10. ขอบเขต MVP

### สร้างใน MVP

- Responsive web app ใช้ได้บนมือถือและ desktop
- หน้า Home, Episode Map, Episode Intro, Story Scene, Exercise, Mini Case, Recap
- Episode 1 เล่นได้จริงตั้งแต่ต้นจนจบแบบย่อ
- Episode 2–12 เป็นการ์ด preview/locked พร้อมเรื่องย่อ ไม่ต้องเขียนบทเต็มใน MVP
- ระบบ story content แยกจาก UI เป็นข้อมูลอ่านง่าย
- บทสนทนาตัวเลือก 2–3 ทางพร้อม feedback ภาษาไทย
- Vocabulary popup และสมุดคำศัพท์
- Sentence Pattern drill และช่องเขียนคำตอบ
- Progress บันทึกใน browser localStorage
- UI และปุ่มทั้งหมดทำงานได้ด้วย keyboard
- มี sample content ครบตาม schema ที่ระบุในส่วนถัดไป

### เลื่อนไป Phase 2

- บัญชีผู้ใช้และ cloud sync
- AI free-response coach เรียก API จริง
- Speech-to-text และการให้คะแนนการออกเสียง
- เสียงพากย์ครบทุกฉาก
- ระบบปรับความยากอัตโนมัติจากประวัติการเรียน
- ตอนเต็มทั้ง 12 ตอนและ branching ลึก
- Multiplayer, leaderboard, payment, admin CMS

### แนวทาง AI

MVP ไม่ควรต้องมี API key เพื่อให้หน้าเว็บทำงานได้ เนื้อเรื่อง ตัวเลือก และ feedback หลักเขียน/ตรวจไว้ล่วงหน้าได้ หากจะมี AI ให้แยกเป็น adapter ภายหลัง โดย:

- ใช้ AI เป็นผู้ช่วยอธิบายคำตอบอิสระ ไม่ใช่ผู้ตัดสินใจเนื้อเรื่อง
- ให้คำตอบเป็นมิตรและไม่ลงโทษสำเนียง
- ใช้ข้อมูลจำลองในโจทย์; ห้ามส่งข้อมูลส่วนตัวนักเรียนจริง
- เมื่อ API ใช้ไม่ได้ แสดง feedback ที่เตรียมไว้และเกมยังเล่นต่อได้
- ไม่เก็บ audio หรือคำตอบผู้เล่นนานเกินจำเป็น; MVP ไม่อัปโหลดเสียง

## 13. แนวทางเทคนิคสำหรับ AI Coding Tool

### Stack ที่แนะนำสำหรับ MVP

- React + TypeScript + Vite
- CSS modules หรือ plain CSS ที่มี design tokens; เลือกวิธีเดียวให้สม่ำเสมอ
- React Router ใช้ได้ถ้าจำเป็น; ถ้า flow ยังสั้น ใช้ state/router แบบง่าย
- ไม่มี backend ในรอบแรก
- localStorage สำหรับ progress
- เนื้อเรื่องเก็บใน `src/content/` เป็น JSON/TypeScript
- ใช้ SVG/CSS/emoji แบบควบคุมได้สำหรับ placeholder avatar; อย่าพึ่ง image API

ถ้ามี starter repo หรือ stack ที่กำหนดไว้แล้ว ให้รักษาของเดิมและปรับเอกสารนี้ให้เข้ากับมัน แทนการแทนที่โครงสร้างทั้งหมด

### ตัวอย่างโครงสร้างไฟล์

    src/
      app/
        App.tsx
        routes.tsx
      components/
        AppShell.tsx
        EpisodeCard.tsx
        DialoguePanel.tsx
        ChoiceList.tsx
        VocabularyPopover.tsx
        ProgressBar.tsx
        FeedbackCard.tsx
        PatternExercise.tsx
        MiniCasePanel.tsx
      content/
        characters.ts
        episodes.ts
        ep01.ts
      features/
        progress/
          progressStorage.ts
        vocabulary/
          vocabularyStorage.ts
      styles/
        tokens.css
        global.css

### หลักการ component

- เนื้อหาเรื่องและ state progression อย่ารวมเป็น component ยาวตัวเดียว
- DialoguePanel แสดงบทสนทนา; ChoiceList แสดงการตัดสินใจ; FeedbackCard แสดงผลการเรียน
- เก็บ content data แยก เพื่อแก้ภาษา/เพิ่มฉากได้โดยไม่เปลี่ยน rendering logic
- มี loading/error/fallback states สำหรับส่วนที่อ่าน localStorage หรือเสียง
- อย่าสร้าง backend, AI API, auth หรือระบบ analytics ใน MVP เว้นแต่ผู้ใช้ขอเพิ่ม

## 15. Prompt เริ่มต้นสำหรับนำไป Vibe Code

นำข้อความนี้พร้อมเอกสารทั้งฉบับไปให้ AI coding tool:

> สร้างเว็บเกมภาษาอังกฤษชื่อ Angels of Deceit: Project SIGNAL ตาม brief ที่แนบมา เริ่มทำ MVP แบบเล่นได้จริงเฉพาะ Episode 1 ก่อน ใช้ React, TypeScript และ Vite ถ้า repository มี stack อยู่แล้ว ให้ตรวจของเดิมและใช้รูปแบบเดิมก่อนสร้างไฟล์ใหม่
>
> ให้เริ่มจากอ่านไฟล์และสรุปโครงสร้างที่มี จากนั้นสร้างหน้า Home/episode map, Episode intro, story scene, vocabulary popup, choice feedback, sentence pattern drills, mini case และ recap ให้ครบวงจรของ Episode 1 เนื้อเรื่องและ feedback ต้องเป็น data-driven แยกจาก UI และบันทึก progress ด้วย localStorage ห้ามต้องใช้ API key เพื่อเล่น
>
> ยึด canon ของ AU ใน brief: ทุกคนเป็นนักเรียน สมาชิกทีมเพิ่งมารู้จักกัน, Kuro เป็น Developer, Miyu เป็น Business Analyst, Airi เป็น PM แต่ถูกเรียกว่า Chief, Kuro และ Miyu มีบทสำคัญทุกตอน และความรู้สึกของทั้งคู่ค่อย ๆ พัฒนาจากการทำงานร่วมกัน ห้ามต่อปม Project Eden/Subject 06 จากเส้นเรื่องหลัก
>
> ใช้ภาษา UI ไทยเป็นหลัก ส่วนบทสนทนาและประโยคฝึกเป็นภาษาอังกฤษระดับ A2–B1 พร้อมคำแปลที่เปิดดูได้ คำตอบต้องมี feedback ภาษาไทยที่สุภาพและบอกเหตุผล ผู้เล่นต้องลองใหม่ได้เสมอ ห้ามลงโทษสำเนียงหรือทำให้พิมพ์ผิดแล้วติดทางตัน
>
> ใช้ดีไซน์ responsive แนวโรงเรียนเทคโนโลยีลึกลับแต่เป็นมิตร ตัวอักษรอ่านง่าย มี contrast ดี ปุ่มใช้งานด้วย keyboard ได้ ใช้ avatar placeholder ได้ ไม่ต้องเรียก image generation, voice, speech recognition, AI API, backend หรือ auth ใน MVP
>
> ก่อนเขียนโค้ด ให้รายงานสิ่งที่พบใน repository และแผนไฟล์สั้น ๆ แล้วลงมือสร้างเฉพาะ MVP ตาม brief เมื่อเสร็จให้สรุปไฟล์หลัก วิธีเปิดเว็บ และส่วนที่ยังเป็น placeholder อย่าเพิ่ม feature นอกขอบเขตเอง

---

## 16. ลำดับทำงานหลังได้เว็บ MVP

1. ตรวจ flow ว่าเล่น Episode 1 จบได้จริงบนมือถือและ desktop
2. ให้ผู้เรียนภาษาอังกฤษระดับใกล้เคียงกลุ่มเป้าหมายทดลองฉากและดูว่าคำอธิบายเข้าใจง่ายหรือไม่
3. ปรับระดับคำศัพท์ จังหวะเรื่อง ความยาวฉาก และ feedback จากการทดลอง
4. เติม Episode 2–3 เพื่อพิสูจน์ว่าโครงสร้าง content เพิ่มตอนใหม่ได้ง่าย
5. ค่อยตัดสินใจเพิ่ม AI free response หรือเสียง จากหลักฐานว่าช่วยผู้เรียนจริง

### ข้อสรุปการออกแบบ

เริ่มจากหนึ่ง vertical slice ที่ครบวงจร: อ่านเรื่อง → เข้าใจศัพท์ → ตัดสินใจสื่อสาร → ได้ feedback → คิดวิเคราะห์ mini case → เห็นผลในเรื่อง เมื่อวงจรนี้สนุกและช่วยให้ผู้เล่นนำประโยคไปใช้ได้ จึงค่อยขยายเป็น 12 ตอนและเพิ่ม AI/เสียง
