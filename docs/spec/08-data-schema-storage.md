<!-- ที่มา: brief §11–12 -->
## 11. โครงสร้างข้อมูลเนื้อหา

แนะนำให้เก็บเนื้อเรื่องเป็น JSON/TypeScript objects เพื่อให้แก้ข้อความและเพิ่มตอนได้โดยไม่แตะ component UI

### รูปแบบ Episode

    Episode {
      id: string,
      title: string,
      level: "A2" | "B1",
      summaryTh: string,
      learningGoals: string[],
      roles: string[],
      vocabulary: VocabularyItem[],
      scenes: Scene[],
      analystNote: string,
      businessLesson: string,
      sentencePatterns: SentencePattern[],
      drills: Drill[],
      miniCase: MiniCase,
      recap: string
    }

### รูปแบบ Scene และ Dialogue

    Scene {
      id: string,
      objective: string,
      dialogue: DialogueLine[],
      interaction?: ChoiceInteraction | TextInteraction,
      nextSceneId?: string
    }

    DialogueLine {
      speakerId: string,
      textEn: string,
      textTh?: string,
      vocabularyRefs?: string[]
    }

    ChoiceInteraction {
      promptEn: string,
      promptTh: string,
      choices: Choice[]
    }

    Choice {
      id: string,
      textEn: string,
      feedbackTh: string,
      naturalAlternative?: string,
      skillTags: string[],
      nextSceneId?: string
    }

### ตัวอย่างเนื้อหา interaction

    {
      "id": "ep01_scene03_choice01",
      "promptEn": "What should Miyu ask the student first?",
      "promptTh": "Miyu ควรถามนักเรียนว่าอะไรเป็นอย่างแรก?",
      "choices": [
        {
          "id": "ask_example",
          "textEn": "Could you give me a recent example?",
          "feedbackTh": "คำถามนี้ชวนผู้ใช้เล่าเหตุการณ์จริง ช่วยให้ทีมเข้าใจปัญหาก่อนเสนอวิธีแก้",
          "naturalAlternative": "Can you tell me about the last time this happened?",
          "skillTags": ["clarification", "user-research"]
        },
        {
          "id": "offer_solution",
          "textEn": "Would an app solve this problem?",
          "feedbackTh": "สุภาพ แต่รีบเสนอวิธีแก้เร็วไป ผู้ใช้อาจตอบเอาใจ ลองถามถึงประสบการณ์ก่อน",
          "skillTags": ["solution-first"]
        }
      ]
    }

UI ต้องรองรับว่าคำตอบตัวเลือกทุกแบบอาจเป็นประโยชน์ต่อการเรียนรู้ แม้บางคำตอบจะพาทีมไปถามต่อเพิ่ม ไม่ควรแสดง schema internals ให้ผู้เล่นเห็น

---

## 12. สถานะและการบันทึกความคืบหน้า

ข้อมูล localStorage ที่ควรเก็บ:

- episodeId และ sceneId ล่าสุด
- ตอนที่ปลดล็อก
- คำศัพท์ที่กดบันทึกหรือควรทบทวน
- drill ที่ลองแล้วและ pattern ที่ผ่านการฝึก
- setting เช่น Thai hints เปิด/ปิด และ text size
- completion state

ห้ามเก็บชื่อจริง โรงเรียนจริง อีเมล เสียง หรือข้อมูลอ่อนไหวใน MVP
