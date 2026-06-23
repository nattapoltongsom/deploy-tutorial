// ========================================
// Express App — ง่ายที่สุด
// ========================================
// app ตัวนี้คือสิ่งที่เราจะ deploy ขึ้น Kubernetes
// มี 2 endpoints:
//   GET /        → ส่ง Hello World (หน้าหลัก)
//   GET /health  → ให้ Kubernetes เช็คว่า app ยังทำงานอยู่

const express = require('express');
const app = express();

// อ่าน PORT จาก environment variable
// ถ้าไม่มีก็ใช้ 3000 เป็นค่า default
const PORT = process.env.PORT || 3000;

// ─── GET / → หน้าหลัก ───
app.get('/', (req, res) => {
  res.json({
    message: 'Hello Kubernetes! 🚀',
    version: '1.0.0'
  });
});

// ─── GET /health → Health Check ───
// Kubernetes จะส่ง request มาที่นี่ทุกๆ 10 วินาที
// ถ้าตอบไม่ได้ → K8s จะ restart app ให้อัตโนมัติ
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// เริ่ม server
app.listen(PORT, () => {
  console.log(`✅ Server ทำงานที่ port ${PORT}`);
});
