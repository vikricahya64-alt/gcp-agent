// extensions/loader.js
const fs = require('fs');
const path = require('path');

const EXTENSIONS = [
  './ping',
];

function registerExtensions(app) {
  console.log('[Loader] Memulai pendaftaran ekstensi...');
  let loaded = 0, failed = 0;

  for (const extPath of EXTENSIONS) {
    try {
      const fullPath = path.resolve(__dirname, extPath);
      if (!fs.existsSync(fullPath + '.js') && !fs.existsSync(fullPath + '.cjs')) {
        console.warn(`[Loader] Ekstensi ${extPath} tidak ditemukan, dilewati.`);
        continue;
      }
      const extModule = require(fullPath);
      if (typeof extModule.register === 'function') {
        extModule.register(app);
        console.log(`[Loader] ✅ ${extPath} berhasil didaftarkan.`);
        loaded++;
      } else {
        console.warn(`[Loader] ⚠️ ${extPath} tidak memiliki fungsi register().`);
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
