// extensions/ping.js
function register(app) {
  app.get('/ping', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), message: 'Ekstensi berjalan!' });
  });
  console.log('[Ping] Endpoint /ping terdaftar');
}
module.exports = { register };
