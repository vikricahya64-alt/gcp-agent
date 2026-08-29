// api/index.js
const app = require('../agen/server.js');

// ===== HEALTH CHECK =====
app.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server agentic AI berjalan dengan sehat'
  });
});
// ========================

module.exports = app;
