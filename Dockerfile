# ========================================
# Dockerfile — วิธีสร้าง Docker Image
# ========================================
# Docker อ่านไฟล์นี้ทีละบรรทัด แล้วสร้าง "image" ออกมา
# image = กล่องที่มี app + Node.js + dependencies พร้อมรัน

# ใช้ Node.js 20 บน Alpine Linux (ตัวเล็ก ประหยัดพื้นที่)
FROM node:20-alpine

# สร้าง folder /app ใน container
WORKDIR /app

# คัดลอก package.json ก่อน แล้ว install
# (ทำแยกเพื่อ cache — ถ้า package.json ไม่เปลี่ยน ไม่ต้อง install ใหม่)
COPY package.json ./
RUN npm install --production

# คัดลอก source code ที่เหลือ
COPY . .

# บอกว่า container ใช้ port 3000
EXPOSE 3000

# คำสั่งรัน app
CMD ["node", "index.js"]
