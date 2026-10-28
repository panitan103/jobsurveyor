export const metadata = { title: "Privacy Policy · jobsurveyor" };

export default function PrivacyPage() {
  return (
    <article className="legal panel">
      <h1>นโยบายความเป็นส่วนตัว · Privacy Policy</h1>
      <p className="small muted">อัปเดต: 28 ตุลาคม 2026 · Last updated: 28 October 2026</p>

      <h2>1. สรุปสั้น</h2>
      <p>
        ซอฟต์แวร์นี้ทำงานในเครื่องของคุณเอง ไม่มีบัญชีผู้ใช้ ไม่มี telemetry ไม่มี analytics
        และไม่ส่งข้อมูลออกไปยังเซิร์ฟเวอร์ของผู้พัฒนา
      </p>
      <p className="en">
        This software runs on your own machine. There are no accounts, no telemetry, no analytics,
        and no data is sent to the developers&apos; servers.
      </p>

      <h2>2. ข้อมูลที่จัดเก็บ</h2>
      <ul>
        <li>ข้อมูลงานที่คุณนำเข้า เก็บในไฟล์ SQLite ภายในเครื่อง (ค่าเริ่มต้น `./data/jobsurveyor.db`)</li>
        <li>น้ำหนักคะแนน การตั้งค่า และสถานะการสมัคร เก็บในไฟล์เดียวกัน</li>
        <li>cookie เดียวที่ใช้คือ `lang` สำหรับจำภาษาที่เลือก (อายุ 1 ปี)</li>
      </ul>
      <p className="en">
        Imported job data, weights, settings, and application status live in a local SQLite file.
        The only cookie is `lang`, which remembers your language choice for one year.
      </p>

      <h2>3. ไม่มีการส่งข้อมูลออก</h2>
      <p>
        ซอฟต์แวร์ไม่มีฟีเจอร์ AI ไม่มีระบบวิเคราะห์ภายนอก และไม่เรียก API ของบุคคลที่สาม
        ยกเว้นเมื่อคุณคลิกเปิดลิงก์ประกาศต้นฉบับ ซึ่งจะเป็นไปตามนโยบายของเว็บไซต์ปลายทาง
      </p>
      <p className="en">
        There is no AI feature, no external analytics, and no third-party API calls. The only
        outbound action is opening an original posting link that you click, subject to that site&apos;s
        own policies.
      </p>

      <h2>4. หากมีผู้ให้บริการโฮสต์แทนคุณ</h2>
      <p>
        หากคุณใช้งานผ่านอินสแตนซ์ที่บุคคลอื่นโฮสต์ ผู้ให้บริการนั้นอาจเก็บ log การเข้าถึง (เช่น IP)
        ตามความจำเป็นด้านความปลอดภัย ซึ่งอยู่นอกการควบคุมของซอฟต์แวร์นี้ ผู้ให้บริการต้องแจ้งนโยบายของตนแยกต่างหาก
      </p>
      <p className="en">
        If you use an instance hosted by someone else, that operator may keep access logs (such as
        IP addresses) for security. That is outside this software&apos;s control and requires a
        separate notice from the operator.
      </p>

      <h2>5. สิทธิ์ของคุณ (PDPA)</h2>
      <p>
        เนื่องจากข้อมูลอยู่ในเครื่องคุณ คุณจึงเข้าถึง แก้ไข ส่งออก หรือลบได้เองทุกเมื่อ
        การลบไฟล์ฐานข้อมูลถือเป็นการลบข้อมูลถาวร แนะนำให้สำรองข้อมูลก่อนลบ
      </p>
      <p className="en">
        Because data lives on your machine, you can access, correct, export, or delete it yourself
        at any time. Deleting the database file permanently removes it — back up first.
      </p>

      <h2>6. เด็กและผู้เยาว์</h2>
      <p>
        เครื่องมือนี้มีไว้สำหรับผู้หางานทั่วไป ไม่ได้ออกแบบสำหรับเด็ก หากเป็นผู้เยาว์
        ควรใช้โดยได้รับความรู้และความยินยอมจากผู้ปกครองตามกฎหมายท้องถิ่น
      </p>
      <p className="en">
        This tool is intended for job seekers and is not directed at children. Minors should use it
        with the knowledge and consent of a parent or guardian under local law.
      </p>

      <h2>7. ติดต่อ</h2>
      <p>เปิด issue ใน repository ของโปรเจกต์สำหรับคำถามด้านความเป็นส่วนตัว</p>
      <p className="en">Open an issue in the project repository for privacy questions.</p>
    </article>
  );
}
