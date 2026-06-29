const { db } = require('../db');

async function verifyApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ message: 'API Key tidak ditemukan. Sertakan header x-api-key' });

    const result = await db.execute({
      sql: 'SELECT * FROM api_keys WHERE api_key = ? AND status = ?',
      args: [apiKey, 'active']
    });
    const row = result.rows[0];
    if (!row) return res.status(403).json({ message: 'API Key tidak valid atau sudah dinonaktifkan' });

    req.apiKeyOwner = row.user_id;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
}

module.exports = verifyApiKey;