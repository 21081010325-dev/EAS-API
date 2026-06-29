const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { JWT_SECRET } = require('../middleware/verifyJWT');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ? OR email = ?',
      args: [username, email]
    });
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Username atau email sudah terdaftar' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.execute({
      sql: 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      args: [username, email, hashedPassword]
    });
    res.status(201).json({ message: 'Registrasi berhasil', user_id: Number(result.lastInsertRowid) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await db.execute({ sql: 'SELECT * FROM users WHERE username = ?', args: [username] });
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Username atau password salah' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Username atau password salah' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ message: 'Login berhasil', token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;