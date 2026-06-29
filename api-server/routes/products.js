const express = require('express');
const { db } = require('../db');
const verifyApiKey = require('../middleware/verifyApiKey');

const router = express.Router();
router.use(verifyApiKey);

router.post('/', async (req, res) => {
  try {
    const { nama_produk, harga, stok, deskripsi } = req.body;
    if (!nama_produk || harga === undefined) {
      return res.status(400).json({ message: 'nama_produk dan harga wajib diisi' });
    }
    const result = await db.execute({
      sql: 'INSERT INTO products (user_id, nama_produk, harga, stok, deskripsi) VALUES (?, ?, ?, ?, ?)',
      args: [req.apiKeyOwner, nama_produk, harga, stok || 0, deskripsi || '']
    });
    res.status(201).json({ message: 'Produk berhasil dibuat', id: Number(result.lastInsertRowid) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM products WHERE user_id = ?', args: [req.apiKeyOwner] });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.apiKeyOwner]
    });
    if (!result.rows[0]) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.apiKeyOwner]
    });
    const product = existing.rows[0];
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const { nama_produk, harga, stok, deskripsi } = req.body;
    await db.execute({
      sql: 'UPDATE products SET nama_produk=?, harga=?, stok=?, deskripsi=? WHERE id=?',
      args: [
        nama_produk ?? product.nama_produk,
        harga ?? product.harga,
        stok ?? product.stok,
        deskripsi ?? product.deskripsi,
        req.params.id
      ]
    });
    res.json({ message: 'Produk berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.apiKeyOwner]
    });
    if (!existing.rows[0]) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [req.params.id] });
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;