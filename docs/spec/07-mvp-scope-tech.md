<!-- ที่มา: brief Final §10, §13, §15–16 -->
## 10. ขอบเขต MVP

### สร้างใน MVP

- Responsive web app ใช้ได้บนมือถือและ desktop
- หน้า Home, Episode Map, Episode Intro, Listen/Story Scene, Speak Response, Exercise, Mini Case, Recap
- Episode 1 เล่นได้จริงตั้งแต่ต้นจนจบแบบย่อ
- Episode 2–12 เป็นการ์ด preview/locked พร้อมเรื่องย่อ ไม่ต้องเขียนบทเต็มใน MVP
- ระบบ story content แยกจาก UI เป็นข้อมูลอ่านง่าย
- เสียงภาษาอังกฤษสำหรับทุกบทสนทนา EP1 ผ่าน TTS ใน browser หรือ audio assets; ต้องมี voice/audio adapter เพื่อเปลี่ยนแหล่งเสียงได้
- Listening Check อย่างน้อยฉากละหนึ่งข้อ พร้อมเล่นซ้ำและ slow playback
- transcript ซ่อนไว้จนฟังครั้งแรกจบ โดยเปิดได้ทุกเมื่อและมี always-show-text setting
- ผู้เล่นพูดตอบในกิจกรรมหลักอย่างน้อย 3 จุดของ EP1; รองรับ speech recognition เมื่อใช้งานได้ และมี speak-aloud / typed fallback
- transcript จาก speech recognition แก้ไขได้; feedback หลักอิง intent/สาระ ไม่ให้คะแนน accent หรือเทียบคำต่อคำ
- บทสนทนา/ตัวเลือก 2–3 ทางพร้อม feedback ภาษาไทยที่เปิดหลังผู้เล่นลองตอบ
- Vocabulary popup และสมุดศัพท์เน้นคำที่ได้ยินในบท
- Sentence Pattern drill ให้ฟังก่อนพูดตาม/เปลี่ยนคำ; ช่องเขียนเป็นตัวช่วย ไม่ใช่ด่านหลัก
- Progress บันทึกใน browser localStorage
- UI และปุ่มทั้งหมดทำงานได้ด้วย keyboard
- มี sample content ครบตาม schema ที่ระบุในส่วนถัดไป

### เลื่อนไป Phase 2

- บัญชีผู้ใช้และ cloud sync
- AI free-response coach ที่ประเมินคำตอบนอกบทสนทนาที่เตรียมไว้
- การวิเคราะห์การพูดเชิงลึก/การออกเสียง; หากเพิ่มต้องไม่ใช้ accent เป็นเกณฑ์ความเก่ง
- เสียงนักพากย์เฉพาะตัวละครครบทั้ง 12 ตอน (MVP ใช้ TTS หรือเสียงต้นแบบได้)
- ระบบปรับความยากอัตโนมัติจากประวัติการเรียน
- ตอนเต็มทั้ง 12 ตอนและ branching ลึก
- Multiplayer, leaderboard, payment, admin CMS

### แนวทาง AI

MVP เล่นได้โดยไม่ต้องมี API key เนื้อเรื่อง Listening Check, phrase bank และ feedback หลักกำหนดไว้ล่วงหน้าได้ การฟังเสียงเป็น feature หลัก ส่วน AI free-response เป็นภายหลัง โดย:

- ใช้ AI เป็น speaking coach ช่วยตีความคำตอบอิสระ ไม่ใช่ผู้ตัดสินใจเนื้อเรื่อง
- ให้คำตอบเป็นมิตรและไม่ลงโทษสำเนียง
- ใช้ข้อมูลจำลองในโจทย์; ห้ามส่งข้อมูลส่วนตัวนักเรียนจริง
- เมื่อ API ใช้ไม่ได้ แสดง feedback ที่เตรียมไว้และเกมยังเล่นต่อได้
- ก่อนเปิด speech recognition ต้องอธิบายว่าเสียงอาจออกจากอุปกรณ์ไปยังบริการ recognition ของ browser เมื่อใช้แบบ online; ขอความยินยอมแยก และให้เลือกพูดเองโดยไม่ใช้ recognition หรือพิมพ์แทนได้
- MVP ไม่ส่งเสียงไปยัง server ของเกมและไม่บันทึกเสียงผู้เล่น; หากเลือกใช้ recognition แบบ online ให้ระบุการประมวลผลนั้นอย่างชัดเจน, แสดงผลเป็นข้อความแก้ไขได้, และไม่เก็บ transcript ไว้หลัง interaction
- ถ้า browser ไม่มี speech recognition ให้เปิด fallback โดยไม่ทำให้ภารกิจหรือ progress หยุด

### ข้อจำกัดเสียงบนเว็บที่ต้องเผื่อไว้

- Text-to-speech และ speech recognition เป็นความสามารถคนละส่วน; UI ควรมี adapter แยกสำหรับเล่นเสียงตัวละครและรับคำพูดผู้เล่น
- Speech recognition ใน browser ยังรองรับไม่เท่ากันทุก browser; บาง implementation ใช้บริการ server และส่งเสียงออกจากอุปกรณ์ จึงต้องมี fallback และคำอธิบาย privacy ก่อนเปิดไมค์
- ใช้ API ที่ตรวจพบ ณ runtime เท่านั้น ห้าม assume ว่าทุกเครื่องมีเสียง English หรือ recognizer
- แหล่งเสียงบทสนทนาควรถอดเปลี่ยนได้: TTS สำหรับต้นแบบ, audio file สำหรับเสียงที่ผ่านการเลือก/บันทึกภายหลัง
- อ่านเอกสารประกอบ: [MDN: Using the Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API) และ [MDN: SpeechRecognition availability](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)

---

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
        AudioScenePlayer.tsx
        ListeningCheck.tsx
        SpeakResponse.tsx
        PhraseBank.tsx
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
        speech/
          audioPlayer.ts
          speechInput.ts
          speechCapabilities.ts
      styles/
        tokens.css
        global.css

### หลักการ component

- เนื้อหาเรื่องและ state progression อย่ารวมเป็น component ยาวตัวเดียว
- AudioScenePlayer แยกการเล่นเสียงจาก transcript; ListeningCheck ตรวจใจความ; SpeakResponse รับคำตอบเสียง/ข้อความ; FeedbackCard อธิบายสิ่งที่สื่อได้
- เก็บ content data แยก เพื่อแก้ภาษา/เพิ่มฉากได้โดยไม่เปลี่ยน rendering logic
- มี loading/error/fallback states สำหรับเสียง, speech input และ localStorage; ถ้า voice recognition ล้มเหลวให้ไปต่อด้วย text/self-check ได้
- AudioPlayer เป็น interface ที่รองรับ TTS ในต้นแบบและ audio assets ภายหลัง
- SpeechInput ตรวจ capability ณ runtime; แสดง privacy notice ก่อนเริ่ม recognition และหยุด listening เมื่อผู้เล่นจบ/ยกเลิก
- อย่าสร้าง backend, AI API, auth หรือระบบ analytics ใน MVP เว้นแต่ผู้ใช้ขอเพิ่ม

---

## 15. Prompt เริ่มต้นสำหรับนำไป Vibe Code

นำข้อความนี้พร้อมเอกสารทั้งฉบับไปให้ AI coding tool:

> สร้างเว็บเกมฝึกฟังและพูดภาษาอังกฤษชื่อ Angels of Deceit: Project SIGNAL ตาม brief ที่แนบมา เริ่มทำ MVP แบบเล่นได้จริงเฉพาะ Episode 1 ก่อน ใช้ React, TypeScript และ Vite ถ้า repository มี stack อยู่แล้ว ให้ตรวจของเดิมและใช้รูปแบบเดิมก่อนสร้างไฟล์ใหม่
>
> ให้เริ่มจากอ่านไฟล์และสรุปโครงสร้างที่มี จากนั้นสร้าง Home/episode map, Episode intro, audio-first story scene, listening check, transcript/คำแปลแบบเปิดได้, speak response, vocabulary popup, sentence pattern shadowing, mini case แบบพูดสรุป และ recap ให้ครบวงจร EP1 เนื้อหาเสียงและ feedback ต้องเป็น data-driven แยกจาก UI และบันทึกเฉพาะ progress/settings ด้วย localStorage ห้ามต้องใช้ API key เพื่อเล่น
>
> ยึด canon ของ AU ใน brief: ทุกคนเป็นนักเรียน สมาชิกทีมเพิ่งมารู้จักกัน, Kuro เป็น Developer, Miyu เป็น Business Analyst, Airi เป็น PM แต่ถูกเรียกว่า Chief, Kuro และ Miyu มีบทสำคัญทุกตอน และความรู้สึกของทั้งคู่ค่อย ๆ พัฒนาจากการทำงานร่วมกัน ห้ามต่อปม Project Eden/Subject 06 จากเส้นเรื่องหลัก
>
> ใช้ภาษา UI ไทยเป็นหลัก ส่วนเสียงบทสนทนาและคำตอบฝึกเป็นภาษาอังกฤษระดับ A2–B1 เปิดฉากด้วยการฟัง; ซ่อน transcript จนฟังครั้งแรกจบแต่เปิดได้ทุกเมื่อ มี play/replay/slow controls และ speaking prompts อย่างน้อย 3 จุด ให้พูดก่อนเปิด model answer ถ้า speech recognition รองรับ ให้ใช้เป็น transcript ที่แก้ไขได้หลังผู้เล่นยินยอมเท่านั้น และแสดง privacy notice ว่า recognition แบบ online อาจส่งเสียงไปยังบริการของ browser; ห้ามส่งเสียงไปยัง server ของเกมหรือเก็บเสียง/transcript ผู้เล่น ถ้าไม่ยินยอม/ไม่รองรับให้มี I said it และ typed fallback ห้ามบล็อก progress และห้ามให้คะแนน accent
>
> ใช้ดีไซน์ responsive แนวโรงเรียนเทคโนโลยีลึกลับแต่เป็นมิตร ตัวอักษรอ่านง่าย มี contrast ดี ปุ่มใช้งานด้วย keyboard ได้ ใช้ avatar placeholder ได้ ใช้ browser TTS หรือเสียง placeholder ผ่าน AudioPlayer adapter; ตรวจ speech-recognition capability ณ runtime, แสดง privacy notice ก่อนขอไมค์ และมี fallback เสมอ ไม่ต้องใช้ AI API, backend หรือ auth ใน MVP
>
> ก่อนเขียนโค้ด ให้รายงานสิ่งที่พบใน repository และแผนไฟล์สั้น ๆ แล้วลงมือสร้างเฉพาะ MVP ตาม brief เมื่อเสร็จให้สรุปไฟล์หลัก วิธีเปิดเว็บ และส่วนที่ยังเป็น placeholder อย่าเพิ่ม feature นอกขอบเขตเอง

---

## 16. ลำดับทำงานหลังได้เว็บ MVP

1. ตรวจ flow ว่าเล่น Episode 1 จบได้จริงบนมือถือและ desktop
2. ให้ผู้เรียนภาษาอังกฤษระดับใกล้เคียงกลุ่มเป้าหมายทดลองฉากและดูว่าคำอธิบายเข้าใจง่ายหรือไม่
3. ปรับระดับคำศัพท์ จังหวะเรื่อง ความยาวฉาก และ feedback จากการทดลอง
4. เติม Episode 2–3 เพื่อพิสูจน์ว่าโครงสร้าง content เพิ่มตอนใหม่ได้ง่าย
5. ค่อยตัดสินใจเพิ่ม AI speaking coach, เสียงพากย์เฉพาะตัวละคร หรือ voice analytics จากหลักฐานว่าช่วยผู้เรียนจริง

### ข้อสรุปการออกแบบ

เริ่มจากหนึ่ง vertical slice ที่ครบวงจร: ฟังฉาก → จับใจความ → พูดตอบ → เปิด transcript/feedback → พูดซ้ำหรือใช้ pattern ใหม่ → ฟัง briefing และพูดสรุป mini case → เห็นผลในเรื่อง การอ่าน/เขียนช่วยเสริมหลังผู้เล่นได้ลองใช้เสียงของตัวเอง เมื่อวงจรนี้มีประโยชน์จึงค่อยขยายเป็น 12 ตอนและเพิ่ม AI coach/เสียงพากย์เต็มรูปแบบ
