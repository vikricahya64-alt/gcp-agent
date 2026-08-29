// extensions/loader.js
const fs = require('fs');
const path = require('path');

const EXTENSIONS = [
  './ping',
];

function registerExtensions(app) {
  console.log('[Loader] 🔥 registerExtensions DIPANGGIL');
  let loaded = 0, failed = 0;

  for (const extPath of EXTENSIONS) {
    console.log(`[Loader] Mencoba memuat: ${extPath}`);
    try {
      const fullPath = path.resolve(__dirname, extPath);
      console.log(`[Loader] fullPath: ${fullPath}`);
      if (!fs.existsSync(fullPath + '.js') && !fs.existsSync(fullPath + '.cjs')) {
        console.warn(`[Loader] File ${extPath} tidak ditemukan.`);
        continue;
      }
      const extModule = require(fullPath);
      if (typeof extModule.register === 'function') {
        extModule.register(app);
        console.log(`[Loader] ✅ ${extPath} berhasil.`);
        loaded++;
      } else {
        console.warn(`[Loader] ⚠️ ${extPath} tidak punya register().`);
        failed++;
      }
    } catch (err) {
      console.error(`[Loader] ❌ Gagal memuat ${extPath}:`, err.message);
      failed++;
    }
  }
  console.log(`[Loader] Selesai: ${loaded} berhasil, ${failed} gagal.`);
}

module.exports = { registerExtensions };
