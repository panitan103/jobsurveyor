export const metadata = { title: "Terms of Use · jobsurveyor" };

export default function TermsPage() {
  return (
    <article className="legal panel">
      <h1>ข้อกำหนดการใช้งาน · Terms of Use</h1>
      <p className="small muted">อัปเดต: 28 ตุลาคม 2026 · Last updated: 28 October 2026</p>

      <h2>1. ซอฟต์แวร์นี้คืออะไร</h2>
      <p>
        jobsurveyor เป็นซอฟต์แวร์ open-source สำหรับนำเข้าข้อมูลประกาศงานจากไฟล์ CSV
        ให้คะแนนตามน้ำหนักคำสำคัญที่ผู้ใช้กำหนด และแสดงแดชบอร์ดสำหรับเปรียบเทียบงาน
        ตัวซอฟต์แวร์ไม่สมัครงาน ไม่ติดต่อนายจ้าง และไม่รับประกันผลลัพธ์ใด ๆ
      </p>
      <p className="en">
        jobsurveyor is open-source software that imports job postings from CSV, scores them with
        user-defined keyword weights, and provides a comparison dashboard. It does not apply for
        jobs, contact employers, or guarantee any outcome.
      </p>

      <h2>2. สัญญาอนุญาต</h2>
      <p>
        ซอฟต์แวร์เผยแพร่ภายใต้ Apache License 2.0 คุณสามารถใช้ แก้ไข และเผยแพร่ต่อได้ตามเงื่อนไขของสัญญาอนุญาต
      </p>
      <p className="en">Released under the Apache License 2.0. See the LICENSE file in the repository.</p>

      <h2>3. ข้อมูลที่คุณนำเข้าเป็นความรับผิดชอบของคุณ</h2>
      <p>
        ซอฟต์แวร์นี้ไม่มีตัวดึงข้อมูลจากเว็บไซต์ใด ๆ มาพร้อมกัน ผู้ใช้ต้องเตรียมไฟล์ CSV เอง
        และต้องมีสิทธิ์ตามกฎหมายหรือได้รับอนุญาตให้ใช้ข้อมูลนั้น รวมถึงต้องปฏิบัติตามข้อกำหนด
        การใช้งาน (Terms of Service), นโยบาย robots และกฎหมายลิขสิทธิ์ของแหล่งข้อมูลต้นทาง
        ผู้พัฒนาไม่รับผิดชอบต่อการนำเข้าหรือเผยแพร่ข้อมูลที่ละเมิดสิทธิ์ของบุคคลอื่น
      </p>
      <p className="en">
        No web scraper is bundled. You prepare the CSV yourself and are responsible for having the
        right or permission to use that data, and for complying with the source site&apos;s terms,
        robots policy, and copyright law. The developers are not responsible for data you import or
        republish.
      </p>

      <h2>4. ไม่รับประกัน</h2>
      <p>
        ซอฟต์แวร์ให้ “ตามสภาพที่เป็น” (AS IS) และ “ตามที่มีอยู่” (AS AVAILABLE) โดยไม่มีการรับประกันใด ๆ
        ทั้งโดยชัดแจ้งหรือโดยปริยาย รวมถึงความถูกต้อง ความสมบูรณ์ ความเหมาะสมต่อวัตถุประสงค์เฉพาะ
        และการไม่ละเมิดสิทธิ์ คะแนนที่คำนวณได้เป็นเพียง heuristic ไม่ใช่คำแนะนำด้านการจ้างงาน
      </p>
      <p className="en">
        Provided “AS IS” and “AS AVAILABLE”, without warranties of any kind, express or implied,
        including accuracy, completeness, fitness for a particular purpose, or non-infringement.
        Scores are heuristics, not employment advice.
      </p>

      <h2>5. ข้อจำกัดความรับผิด</h2>
      <p>
        ภายในขอบเขตสูงสุดที่กฎหมายอนุญาต ผู้พัฒนาและผู้มีส่วนร่วมไม่รับผิดชอบต่อความเสียหาย
        ความสูญเสีย โอกาสที่สูญหาย ค่าจ้าง หรือค่าใช้จ่ายใด ๆ ที่เกิดจากการใช้หรือไม่สามารถใช้ซอฟต์แวร์นี้
      </p>
      <p className="en">
        To the maximum extent permitted by law, the developers and contributors are not liable for
        any damages, losses, lost opportunities, or costs arising from use of, or inability to use,
        this software.
      </p>

      <h2>6. การใช้งานที่ยอมรับได้</h2>
      <ul>
        <li>ห้ามใช้ซอฟต์แวร์เพื่อละเมิดกฎหมายหรือสิทธิ์ของบุคคลอื่น</li>
        <li>ห้ามใช้เพื่อดึงข้อมูลจำนวนมากจากแหล่งที่ไม่ได้อนุญาต</li>
        <li>ห้ามแอบอ้างว่าเป็นบริการอย่างเป็นทางการของแหล่งข้อมูลใด ๆ</li>
      </ul>
      <p className="en">
        Do not use the software to break the law or third-party rights, to bulk-collect data from
        sources you are not authorised to use, or to imply official affiliation with any job board.
      </p>

      <h2>7. การเปลี่ยนแปลง</h2>
      <p>ข้อกำหนดนี้อาจปรับปรุงเมื่อซอฟต์แวร์เปลี่ยน เวอร์ชันล่าสุดอยู่ใน repository</p>
      <p className="en">These terms may be updated with the software. The current version lives in the repository.</p>
    </article>
  );
}
