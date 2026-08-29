// api/index.js – Entry point Vercel
const app = require('../agen/server.js');

// ===== ENDPOINT HEALTH CHECK =====
app.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Agentic AI server berjalan dengan sehat'
  });
});
// ================================

console.log('[api/index.js] Server agentic AI siap menerima permintaan');

module.exports = app;
