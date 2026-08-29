const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }
}).single('file');

const KEY = process.env.GEMINI_API_KEY;
const REPO = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(REPO, "skills");
const PORT = process.env.PORT || 3000;

if (!KEY) {
  console.error("❌ FATAL ERROR: GEMINI_API_KEY belum diset di Environment Variables Vercel!");
}

const genAI = new GoogleGenerativeAI(KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
} catch (e) { console.log("Skill kosong."); }

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

app.post("/ask", async (req, res) => {
  const q = (req.body.question || "").trim();
  if (!q) return res.status(400).json({ error: "Pertanyaan kosong" });
  try {
    const top = pick(q);
    const context = top.length 
      ? top.map(x => `=== SKILL: ${x.name} ===\n${x.preview}`).join("\n\n")
      : "(tidak ada skill spesifik; gunakan pengetahuan umum)";
    const r = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Kamu agen AI ahli Google Cloud. Jawab singkat.\n\nKonteks:\n" + context + "\n\nPertanyaan: " + q }] }]
    });
    res.json({ answer: r.response.text(), skills: top.map(x => x.name) });
  } catch (e) { 
    console.error("Error /ask:", e.message);
    res.status(500).json({ error: e.message }); 
  }
});

app.post("/upload", async (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ error: "Upload Error: " + err.message });
    if (!req.file) return res.status(400).json({ error: "Tidak ada file yang dipilih" });
    try {
      const imagePart = { inlineData: { data: req.file.buffer.toString('base64'), mimeType: req.file.mimetype } };
      // Tambahkan log untuk memantau apakah file sampai ke sini
      console.log("File diterima:", req.file.originalname, "Ukuran:", req.file.size);
      
      const r = await model.generateContent({ contents: [{ role: "user", parts: [{ text: "Analisis gambar ini secara detail." }, imagePart] }] });
      
      res.json({ message: "Upload berhasil!", answer: r.response.text(), file: { name: req.file.originalname, size: req.file.size } });
    } catch (e) { 
      // Ini adalah kunci untuk melihat error asli dari Google!
      console.error("❌ ERROR GEMINI SAAT UPLOAD:", e.message);
      res.status(500).json({ error: e.message }); 
    }
  });
});

// ================== UI SEMPURNA & RESPONSIF ==================
const HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>Agent GCP</title>
  <link rel="icon" href="data:,">
  <style>
    * { box-sizing: border-box; }
    html, body { height: 100%; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      height: 100dvh;
    }
    header {
      padding: 15px;
      background: #1e293b;
      text-align: center;
      font-weight: 700;
      font-size: 18px;
      border-bottom: 1px solid #334155;
      flex-shrink: 0;
    }
    #chat {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #0f172a;
      scroll-behavior: smooth;
    }
    .msg {
      max-width: 85%;
      padding: 12px 14px;
      border-radius: 16px;
      line-height: 1.5;
      font-size: 15px;
      word-wrap: break-word;
      white-space: pre-wrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .user { align-self: flex-end; background: #2563eb; border-bottom-right-radius: 4px; }
    .bot { align-self: flex-start; background: #334155; border-bottom-left-radius: 4px; }
    .tag { display: block; margin-top: 8px; font-size: 11px; color: #94a3b8; font-style: italic; }

    .footer {
      background: #1e293b;
      padding: 12px;
      border-top: 1px solid #334155;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .upload-row { display: flex; gap: 10px; align-items: center; }

    /* Trik Label Untuk WebView Android */
    #fileInput {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      overflow: hidden;
      z-index: -1;
    }
    .btn-upload {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      white-space: nowrap;
      display: inline-block;
      text-align: center;
      transition: background 0.2s;
    }
    .btn-upload:hover { background: #1d4ed8; }
    .btn-upload:active { transform: scale(0.98); }

    #file-preview {
      flex: 1;
      font-size: 13px;
      color: #94a3b8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      background: #0f172a;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #334155;
    }

    .chat-row { display: flex; gap: 10px; }
    input[type=text] {
      flex: 1;
      padding: 12px 16px;
      border-radius: 24px;
      border: 1px solid #334155;
      background: #0f172a;
      color: white;
      font-size: 16px;
      outline: none;
    }
    input[type=text]:focus { border-color: #2563eb; }
    button[type=submit] {
      background: #2563eb; color: white; border: none; padding: 12px 20px;
      border-radius: 24px; font-weight: 700; cursor: pointer; font-size: 16px;
    }
    button[type=submit]:active { transform: scale(0.98); }
  </style>
</head>
<body>
  <header>🤖 Agen AI Google Cloud</header>
  
  <div id="chat"></div>

  <div class="footer">
    <div class="upload-row">
      <!-- Perbaikan Utama: Label for="" akan otomatis memicu file dialog di WebView tanpa perlu JS .click() -->
      <input type="file" id="fileInput" accept="image/*">
      <label for="fileInput" class="btn-upload">📎 Upload</label>
      <span id="file-preview"></span>
    </div>
    <form class="chat-row" onsubmit="return kirim(event)">
      <input id="q" placeholder="Tanya soal Google Cloud..." autocomplete="off">
      <button type="submit">Kirim</button>
    </form>
  </div>

<script>
  function add(cls, text) {
    var d = document.createElement('div');
    d.className = 'msg ' + cls;
    d.textContent = text;
    document.getElementById('chat').appendChild(d);
    d.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
    } catch (err) { bot.textContent = 'Error: ' + err.message; }
    return false;
  }

  // Event listener saat file dipilih
  document.getElementById('fileInput').addEventListener('change', async function() {
    if (this.files && this.files.length > 0) {
      const file = this.files[0];
      const preview = document.getElementById('file-preview');
      const formData = new FormData();
      formData.append('file', file);

      preview.textContent = '⏳ Uploading...';
      try {
        const res = await fetch('/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
          preview.textContent = '✅ ' + data.file.name;
          if (data.answer) {
            add('user', '📷 [Mengunggah gambar: ' + data.file.name + ']');
            add('bot', data.answer);
          }
        } else {
          preview.textContent = '❌ ' + (data.error || 'Gagal upload');
        }
      } catch (err) {
        preview.textContent = '❌ Error: ' + err.message;
      }
      this.value = '';
    }
  });
</script>
</body>
</html>`;

app.get("/", (req, res) => { res.send(HTML); });

if (require.main === module) {
  app.listen(PORT, () => console.log("Server jalan di port " + PORT));
}

module.exports = app;
