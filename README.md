# Thungara 🎵

ค้นหาเพลงลูกทุ่งไทยจากเนื้อร้อง 1,500 เพลง — พิมพ์หรือร้องก็ค้นได้

## Features

- **ค้นหาอัจฉริยะ** — ใช้ TF-IDF Cosine Similarity จับคู่เนื้อเพลงแบบ real-time
- **ร้องค้นหา** — กดไมค์แล้วร้องหรือพูดเนื้อเพลง ระบบแปลงเสียงเป็นข้อความแล้วค้นหาให้ (Web Speech API)
- **ไฮไลท์คำค้น** — คำที่ตรงกันจะถูกเน้นสีในผลลัพธ์และหน้าเนื้อเพลง
- **ตัวกรอง** — กรองตามศิลปิน, อารมณ์เพลง, ปีที่ออก
- **Dark Mode** — สลับโหมดมืด/สว่าง หรือตามค่าระบบ
- **PWA** — ติดตั้งลงหน้าจอมือถือได้ ใช้งาน offline ได้
- **Web Worker** — ประมวลผลการค้นหาใน background thread ไม่กระตุก

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla — ไม่ใช้ framework)
- **Search Engine**: TF-IDF vectorization + cosine similarity + exact match + word overlap (hybrid scoring)
- **Tokenizer**: Longest-match greedy สำหรับตัดคำภาษาไทย
- **Voice**: Web Speech API (th-TH)
- **Offline**: Service Worker + Cache API
- **Performance**: Web Worker สำหรับ search computation

## Project Structure

```
index.html          — Single-file web app (HTML + CSS + JS)
search-worker.js    — Web Worker สำหรับค้นหาใน background
sw.js               — Service Worker สำหรับ caching/offline
data.json           — ข้อมูลเพลง + TF-IDF vectors (pre-computed)
manifest.json       — PWA manifest
preprocess.py       — Script สร้าง data.json จาก CSV
```

## Getting Started

### รันบนเครื่อง

```bash
# ใช้ Python HTTP server
python -m http.server 8765

# เปิดเบราว์เซอร์ไปที่
# http://localhost:8765
```

### Deploy

Static site — deploy ได้ทุกที่:

- **Vercel**: Import repo → Framework: Other → Deploy
- **Netlify**: Drag & drop โฟลเดอร์
- **GitHub Pages**: Settings → Pages → Deploy from branch

## การสร้างข้อมูลใหม่

หากต้องการอัปเดตข้อมูลเพลง:

```bash
python preprocess.py
```

Script จะอ่านไฟล์ CSV และสร้าง `data.json` ที่มี TF-IDF vectors พร้อมใช้

> **หมายเหตุ**: ไฟล์ CSV ต้นฉบับไม่ได้อยู่ใน repo (อยู่ใน .gitignore)

## License

MIT
