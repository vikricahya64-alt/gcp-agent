const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Upload (Wajib memoryStorage untuk Vercel, maksimal 4MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }
}).single('file');

const KEY = process.env.GEMINI_API_KEY;
const REPO = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(REPO, "skills");
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Fungsi membaca skill
function findSkills(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) findSkills(p, out);
    else if (name === "SKILL.md") out.push(p);
  }
  return out;
}

let index = [];
try {
  index = findSkills(SKILLS_DIR).map(f => ({
    name: f.replace(SKILLS_DIR + "/", "").replace("/SKILL.md", ""),
    preview: fs.readFileSync(f, "utf-8").slice(0, 2000)
  }));
  console.log("Skill dimuat: " + index.length);
} catch (e) {
  console.log("Folder skills tidak ditemukan atau kosong, melanjutkan tanpa skill.");
}

const STOP = new Set(["apa", "itu", "ini", "dan", "yang", "di", "ke", "dari"]);
function tokens(q) { return q.toLowerCase().split(/\W+/).filter(t => t && !STOP.has(t)); }

function pick(q) {
  const words = tokens(q);
  return index.map(it => {
    const nameHay = it.name.toLowerCase().replace(/-/g, " ");
    const prevHay = it.preview.toLowerCase();
    let s = 0;
    for (const w of words) { if (nameHay.includes(w) || prevHay.includes(w)) s++; }
    return { ...it, s };
  }).sort((a,b) => b.s - a.s).slice(0, 3).filter(x => x.s > 0);
}

// ===================== ROUTE CHAT =====================
app.post("/ask", async (req, res) => {
  const q = (req.body.question || "").trim();
  if (!q) return res.status(400).json({ error: "Pertanyaan kosong" });
  try {
    const top = pick(q);
    const context = top.length 
      ? top.map(x => `=== SKILL: ${x.name} ===\n${x.preview}`).join("\n\n")
      : "(tidak ada skill spesifik; gunakan pengetahuan umum)";
    
    const r = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Kamu agen AI ahli Google Cloud. Jawab dengan singkat, padat, dan jelas.\n\nKonteks:\n" + context + "\n\nPertanyaan: " + q }] }]
    });
    
    res.json({ answer: r.response.text(), skills: top.map(x => x.name) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===================== ROUTE UPLOAD =====================
app.post("/upload", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log("Multer Error:", err.message);
      return res.status(400).json({ error: "Upload Error: " + err.message });
    }
    if (!req.file) {
      console.log("Tidak ada file diterima");
      return res.status(400).json({ error: "Tidak ada file yang dipilih" });
    }

    console.log("File berhasil masuk:", req.file.originalname, req.file.size);
    // Anda bisa menambahkan logika pengolahan gambar ke Gemini di sini menggunakan req.file.buffer

    res.json({
      message: "Upload berhasil!",
      file: {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      }
    });
  });
});

// ===================== FRONTEND HTML & CSS =====================
const HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agent GCP</title>
  <style>
    body{margin:0;font-family:system-ui,sans-serif;background:#0e1621;color:#fff}
    header{padding:12px;background:#1e293b;text-align:center;font-weight:bold}
    #chat{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;height:60vh}
    .msg{max-width:85%;padding:10px;border-radius:10px;white-space:pre-wrap}
    .user{align-self:flex-end;background:#0ea5e9;color:#fff}
    .bot{align-self:flex-start;background:#1e293b}
    .tag{display:block;margin-top:6px;font-size:11px;color:#94a3b8}
    form{display:flex;gap:8px;padding:10px;background:#1e293b}
    input[type=text]{flex:1;padding:12px;border-radius:10px;border:none;font-size:16px}
    button{padding:12px 16px;border-radius:10px;border:none;background:#0ea5e9;color:#fff;font-weight:bold}
    
    /* === PERBAIKAN CSS UNTUK TAMPILAN HP (AGAR TIDAK TERPOTONG) === */
    .upload-area{background:#1e293b;padding:10px;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
    .upload-area input[type=file]{flex:1;min-width:100px;font-size:12px;color:#e2e8f0}
    .upload-area button{background:#0ea5e9;white-space:nowrap}
    .upload-area button:hover{background:#38bdf8}
    #file-preview{color:#94a3b8;font-size:13px;width:100%}
  </style>
</head>
<body>
  <header>🤖 Agen AI Google Cloud</header>
  
  <div class="upload-area">
    <input type="file" id="fileInput">
    <!-- === PERBAIKAN TOMBOL (type="button" DITAMBAHKAN) === -->
    <button type="button" onclick="uploadFile()">📎 Upload</button>
    <span id="file-preview"></span>
  </div>

  <div id="chat"></div>
  
  <form onsubmit="return kirim(event)">
    <input id="q" placeholder="Tanya soal Google Cloud...">
    <button>Kirim</button>
  </form>

<script>
  function add(cls, text) {
    var d = document.createElement('div');
    d.className = 'msg ' + cls;
    d.textContent = text;
    document.getElementById('chat').appendChild(d);
    d.scrollIntoView(false);
    return d;
  }

  async function kirim(e) {
    e.preventDefault();
    var q = document.getElementById('q').value.trim();
    if (!q) return false;
    add('user', q);
    document.getElementById('q').value = '';
    var bot = add('bot', '⏳ Berpikir...');
    try {
      var r = await fetch('/ask', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({question: q})});
      var d = await r.json();
      bot.textContent = d.answer || d.error;
      if (d.skills && d.skills.length) {
        var t = document.createElement('span');
        t.className = 'tag';
        t.textContent = '🚀 ' + d.skills.join(', ');
        bot.appendChild(t);
      }
    } catch (err) {
      bot.textContent = 'Error: ' + err.message;
    }
    return false;
  }

  async function uploadFile() {
    console.log("Tombol upload diklik!");
    const input = document.getElementById('fileInput');
    const preview = document.getElementById('file-preview');
    const file = input.files[0];

    if (!file) {
      preview.textContent = 'Pilih file dulu!';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      preview.textContent = '⏳ Uploading...';
      const res = await fetch('/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        preview.textContent = '✅ ' + data.file.name + ' (' + data.file.size + ' bytes)';
      } else {
        preview.textContent = '❌ ' + (data.error || 'Gagal upload');
      }
    } catch (err) {
      preview.textContent = '❌ Error: ' + err.message;
    }
  }
</script>
</body>
</html>`;

// Route untuk menampilkan HTML
app.get("/", (req, res) => { res.send(HTML); });

// Jalankan server secara lokal, namun biarkan Vercel mengambil alih jika di-deploy
if (require.main === module) {
  app.listen(PORT, () => console.log("Server jalan di port " + PORT));
}

module.exports = app;
