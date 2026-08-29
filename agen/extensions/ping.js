// extensions/ping.js
function register(app) {
  app.get('/ping-ekstensi', (req, res) => {
    res.json({ status: 'ok', from: 'ekstensi', timestamp: new Date().toISOString() });
  });
  console.log('[Ping] Endpoint /ping-ekstensi terdaftar');
}
module.exports = { register };
