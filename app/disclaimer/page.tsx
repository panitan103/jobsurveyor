export const metadata = { title: "Disclaimer · jobsurveyor" };

export default function DisclaimerPage() {
  return (
    <article className="legal panel">
      <h1>ข้อจำกัดความรับผิด · Disclaimer</h1>

      <div className="notice">
        This application acts like an advisor. It may give you wrong advice. Use it at your own
        risk. The developer will not be responsible for any action taken based on this app.
      </div>

      <h2>คะแนนไม่ใช่คำตอบ</h2>
      <p>
        คะแนนคำนวณจากคำสำคัญที่พบในประกาศกับน้ำหนักที่คุณตั้งไว้ เป็นเพียงเครื่องมือจัดลำดับ
        ไม่ได้อ่านคุณสมบัติของคุณ ไม่ได้ตรวจสอบนายจ้าง และไม่ได้ทำนายผลการสมัคร
      </p>
      <p className="en">
        Scores come from keyword matches and your weights. They do not read your qualifications,
        vet employers, or predict hiring outcomes.
      </p>

      <h2>ข้อมูลอาจเก่าหรือคลาดเคลื่อน</h2>
      <p>
        ข้อมูลมาจาก CSV ที่คุณนำเข้าเอง อาจเก่า ไม่ครบ หรือผิดพลาด ตรวจสอบประกาศต้นฉบับก่อนสมัครเสมอ
      </p>
      <p className="en">
        Data comes from the CSV you import and may be stale, incomplete, or wrong. Always verify the
        original posting before applying.
      </p>

      <h2>ไม่มีความสัมพันธ์กับแหล่งข้อมูล</h2>
      <p>
        โครงการนี้ไม่มีความเกี่ยวข้อง ไม่ได้รับการรับรอง และไม่ใช่ตัวแทนของเว็บไซต์หางานใด ๆ
        เครื่องหมายการค้าเป็นของเจ้าของแต่ละราย
      </p>
      <p className="en">
        This project is not affiliated with, endorsed by, or acting for any job board. Trademarks
        belong to their respective owners.
      </p>

      <h2>ความเสี่ยงของผู้ใช้</h2>
      <p>
        คุณเป็นผู้ตัดสินใจสมัครงาน ต่อรองเงินเดือน และเปิดเผยข้อมูลส่วนตัวต่อนายจ้างด้วยตัวเอง
        ผู้พัฒนาไม่รับผิดชอบต่อความเสียหายใด ๆ ที่เกิดจากการใช้เครื่องมือนี้
      </p>
      <p className="en">
        You decide where to apply, how to negotiate, and what personal data to share with employers.
        The developers accept no liability for losses arising from use of this tool.
      </p>
    </article>
  );
}
