import type { Career, CareerId } from "./types";

// "Choose your path": the story stays the same for everyone; the chosen role only changes which
// episodes and phrases the home screen highlights. Each role is modelled by one teammate.
export const careers: Career[] = [
  {
    id: "ba",
    nameEn: "Business Analyst",
    nameTh: "นักวิเคราะห์ธุรกิจ",
    lead: "miyu",
    taglineEn: "Understand needs. Build the right thing.",
    taglineTh: "เข้าใจความต้องการ แล้วช่วยทีมสร้างสิ่งที่ถูกต้อง",
    skillsTh: ["สัมภาษณ์ผู้ใช้", "ถามคำถามปลายเปิด", "สรุป requirement"],
    keyPhrases: ["Could you give me a recent example?", "Let me check if I understand.", "So the requirement is that students can ___."],
  },
  {
    id: "data",
    nameEn: "Data Analyst",
    nameTh: "นักวิเคราะห์ข้อมูล",
    lead: "rei",
    taglineEn: "Turn data into honest insights.",
    taglineTh: "เปลี่ยนข้อมูลเป็นข้อค้นพบ พร้อมบอกข้อจำกัด",
    skillsTh: ["อ่านตัวเลขอย่างระวัง", "ตรวจที่มาของข้อมูล", "บอกข้อจำกัด"],
    keyPhrases: ["The data shows ___, but we don't know whether ___.", "The report includes ___, so the average may be ___.", "One limitation is that ___."],
  },
  {
    id: "pm",
    nameEn: "Project Manager",
    nameTh: "ผู้จัดการโครงการ",
    lead: "chief",
    taglineEn: "Connect people. Keep the plan moving.",
    taglineTh: "เชื่อมคนในทีม และพางานให้เดินต่อทันเวลา",
    skillsTh: ["ตั้งเป้าหมายและขอบเขต", "ถามกำหนดส่งและผู้ตัดสินใจ", "สรุป next step"],
    keyPhrases: ["What problem are we trying to solve?", "Could you confirm the deadline?", "Today we learned ___. Next, we will ___."],
  },
  {
    id: "ux",
    nameEn: "UX Researcher",
    nameTh: "นักวิจัยประสบการณ์ผู้ใช้",
    lead: "lena",
    taglineEn: "Listen to every user, not only the loud ones.",
    taglineTh: "ฟังผู้ใช้ทุกกลุ่ม รวมถึงเสียงที่หายไป",
    skillsTh: ["ขออนุญาตก่อนสังเกต", "ถามโดยไม่ชี้นำ", "หาเสียงที่ขาดในข้อมูล"],
    keyPhrases: ["Would you mind showing me how you use the form?", "Could you tell me what happened when ___?", "Most of the responses came from ___."],
  },
  {
    id: "dev",
    nameEn: "Developer",
    nameTh: "นักพัฒนา",
    lead: "kuro",
    taglineEn: "Build carefully. Test before you claim.",
    taglineTh: "สร้างอย่างรอบคอบ ทดสอบก่อนสรุป",
    skillsTh: ["อธิบายข้อจำกัดทางเทคนิค", "ทดสอบด้วยข้อมูลตัวอย่าง", "รายงานสถานะงาน"],
    keyPhrases: ["The prototype works, but it does not solve the main problem yet.", "I need to test how the files are joined before we say anything.", "We don't know whether ___. It's only a pattern."],
  },
  {
    id: "qa",
    nameEn: "QA / Risk Analyst",
    nameTh: "ผู้ทดสอบและวิเคราะห์ความเสี่ยง",
    lead: "shion",
    taglineEn: "Find the cases others miss.",
    taglineTh: "หากรณีที่คนอื่นมองข้าม และรายงานให้ทีมเข้าใจ",
    skillsTh: ["รายงาน bug ให้ทำซ้ำได้", "หากรณีขอบ", "แยกรูปแบบกับข้อพิสูจน์"],
    keyPhrases: ["Steps: ___. Expected: ___. Actual: ___.", "___ blocks some users. It is required, but ___ can't ___.", "It's a pattern. Not proof."],
  },
];

export function careerById(id: CareerId | undefined): Career | undefined {
  return careers.find((c) => c.id === id);
}
