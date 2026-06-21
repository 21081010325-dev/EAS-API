const express = require('express');
const db = require('../db');
const verifyApiKey = require('../middleware/verifyApiKey');

const router = express.Router();
router.use(verifyApiKey); 

router.post('/', (req, res) => {
  const { nama_produk, harga, stok, deskripsi } = req.body;
  if (!nama_produk || harga === undefined) {
    return res.status(400).json({ message: 'nama_produk dan harga wajib diisi' });
  }
  const result = db.prepare(
    'INSERT INTO products (user_id, nama_produk, harga, stok, deskripsi) VALUES (?, ?, ?, ?, ?)'
  ).run(req.apiKeyOwner, nama_produk, harga, stok || 0, deskripsi || '');
  res.status(201).json({ message: 'Produk berhasil dibuat', id: result.lastInsertRowid });
});

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM products WHERE user_id = ?').all(req.apiKeyOwner));
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.apiKeyOwner);
  if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
  res.json(product);
});

router.put('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.apiKeyOwner);
  if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

  const { nama_produk, harga, stok, deskripsi } = req.body;
  db.prepare('UPDATE products SET nama_produk=?, harga=?, stok=?, deskripsi=? WHERE id=?').run(
    nama_produk ?? product.nama_produk,
    harga ?? product.harga,
    stok ?? product.stok,
    deskripsi ?? product.deskripsi,
    req.params.id
  );
  res.json({ message: 'Produk berhasil diupdate' });
});

router.delete('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.apiKeyOwner);
  if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Produk berhasil dihapus' });
});

module.exports = router;