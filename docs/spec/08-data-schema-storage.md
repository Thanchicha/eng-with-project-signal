<!-- ที่มา: brief Final §11–12 -->
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
      listeningChecks: ListeningCheck[],
      speakingPrompts: SpeakingPrompt[],
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
      listeningCheck?: ListeningCheck,
      speakingPrompt?: SpeakingPrompt,
      choiceInteraction?: ChoiceInteraction,
      nextSceneId?: string
    }

    DialogueLine {
      speakerId: string,
      textEn: string,
      textTh?: string,
      vocabularyRefs?: string[],
      audio?: {
        assetUrl?: string,
        voiceHint?: string,
        rate?: number
      }
    }

    ListeningCheck {
      id: string,
      promptTh: string,
      choices: { id: string, labelTh: string }[],
      answerId: string,
      feedbackTh: string,
      transcriptUnlock: "after-first-play" | "on-demand"
    }

    SpeakingPrompt {
      id: string,
      situationTh: string,
      promptEn: string,
      goal: "ask" | "clarify" | "summarize" | "report" | "suggest",
      phraseFrames: string[],
      modelResponses: string[],
      acceptedIntents: string[],
      feedbackTh: string,
      nextSceneId: string
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

ตัวเลือกที่เตรียมไว้ใช้เป็น phrase support หรือผลลัพธ์ของเจตนาการสื่อสาร ไม่ใช่แทนการพูดทั้งหมด: ให้ผู้เล่นลองพูดก่อน แล้วเลือก “I used this idea” หรือ “I tried my own words” เพื่อดำเนินเกม; ถ้ามี speech recognition ให้แสดง transcript เป็นตัวช่วยตรวจตนเอง ไม่ตัดสินความหมายอัตโนมัติใน MVP

### ตัวอย่าง SpeakingPrompt

    {
      "id": "ep01_scene03_speak01",
      "situationTh": "นักเรียนบอกว่าโรงอาหารมีปัญหา แต่ยังเล่าไม่ชัด",
      "promptEn": "Ask the student for a real example.",
      "goal": "ask",
      "phraseFrames": ["Could you tell me more about ___?", "Can you give me an example of ___?"],
      "modelResponses": ["Could you tell me more about the problem?", "Can you give me an example of what happened yesterday?"],
      "acceptedIntents": ["asks for a concrete recent example", "asks when or how the problem happened"],
      "feedbackTh": "การขอตัวอย่างช่วยให้ผู้ใช้เล่าประสบการณ์จริง ก่อนทีมจะเลือกวิธีแก้",
      "nextSceneId": "ep01_scene04"
    }

Model response เป็นตัวอย่าง ไม่ใช่คำตอบเดียวที่ผ่าน

---

## 12. สถานะและการบันทึกความคืบหน้า

ข้อมูล localStorage ที่ควรเก็บ:

- episodeId และ sceneId ล่าสุด
- ตอนที่ปลดล็อก
- คำศัพท์ที่กดบันทึกหรือควรทบทวน
- listening checks ที่ลองแล้วและจำนวนครั้งที่ replay
- speaking prompts ที่ลองแล้วและ pattern ที่พูดฝึก
- setting เช่น Thai hints, show transcript, audio speed และ text size
- completion state

ห้ามเก็บชื่อจริง โรงเรียนจริง อีเมล audio recording, transcript จากไมโครโฟน หรือข้อมูลอ่อนไหวใน MVP; เก็บเฉพาะ progress และ settings ใน localStorage

---
