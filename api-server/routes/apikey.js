const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { verifyJWT } = require('../middleware/verifyJWT');

const router = express.Router();

router.post('/generate', verifyJWT, (req, res) => {
    const newKey = 'APIKEY-' + crypto.randomUUID().replace(/-/g, '');
    db.prepare('INSERT INTO api_keys (user_id, api_key) VALUES (?, ?)').run(req.user.id, newKey);
    res.status(201).json({ message: 'API Key berhasil dibuat', api_key: newKey });
});

router.get('/my-keys', verifyJWT, (req, res) => {
  const keys = db.prepare('SELECT id, api_key, status, created_at FROM api_keys WHERE user_id = ?')
    .all(req.user.id);
  res.json(keys);
});

router.put('/revoke/:id', verifyJWT, (req, res) => {
  const key = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!key) return res.status(404).json({ message: 'API Key tidak ditemukan' });

  db.prepare('UPDATE api_keys SET status = ? WHERE id = ?').run('revoked', req.params.id);
  res.json({ message: 'API Key berhasil dinonaktifkan' });
});

module.exports = router;