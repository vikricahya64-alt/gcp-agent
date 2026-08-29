// api/ping.js – Endpoint health check terpisah
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Agentic AI server berjalan dengan sehat (dari ping.js)'
  });
};
