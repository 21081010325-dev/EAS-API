const express = require('express');
const crypto = require('crypto');
const { db } = require('../db');
const { verifyJWT } = require('../middleware/verifyJWT');

const router = express.Router();

router.post('/generate', verifyJWT, async (req, res) => {
  try {
    const newKey = 'APIKEY-' + crypto.randomUUID().replace(/-/g, '');
    await db.execute({ sql: 'INSERT INTO api_keys (user_id, api_key) VALUES (?, ?)', args: [req.user.id, newKey] });
    res.status(201).json({ message: 'API Key berhasil dibuat', api_key: newKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

router.get('/my-keys', verifyJWT, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT id, api_key, status, created_at FROM api_keys WHERE user_id = ?',
      args: [req.user.id]
    });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

router.put('/revoke/:id', verifyJWT, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM api_keys WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.user.id]
    });
    if (!result.rows[0]) return res.status(404).json({ message: 'API Key tidak ditemukan' });

    await db.execute({ sql: 'UPDATE api_keys SET status = ? WHERE id = ?', args: ['revoked', req.params.id] });
    res.json({ message: 'API Key berhasil dinonaktifkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;