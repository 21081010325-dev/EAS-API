const db = require('../db');

function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ message: 'API Key tidak ditemukan. Sertakan header x-api-key' });
  }

  const row = db.prepare('SELECT * FROM api_keys WHERE api_key = ? AND status = ?').get(apiKey, 'active');
  if (!row) {
    return res.status(403).json({ message: 'API Key tidak valid atau sudah dinonaktifkan' });
  }

  req.apiKeyOwner = row.user_id; // dipakai biar tiap user cuma lihat data miliknya sendiri
  next();
}

module.exports = verifyApiKey;