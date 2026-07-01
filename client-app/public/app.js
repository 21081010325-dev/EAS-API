function getApiBase() {
  const base = localStorage.getItem('api_base') || '';
  return base.replace(/\/+$/, ''); // selalu bersihkan trailing slash saat dipakai
}

function saveSettings() {
  let base = document.getElementById('apiBase').value.trim();
  base = base.replace(/\/+$/, '');
  localStorage.setItem('api_base', base);
  localStorage.setItem('api_key', document.getElementById('apiKey').value.trim());
  alert('Tersimpan!'); location.reload();
}

async function loadProducts() {
  const base = getApiBase();
  const key = localStorage.getItem('api_key');
  if (!base || !key) return;

  const res = await fetch(`${base}/api/products`, { headers: { 'x-api-key': key } });
  const data = await res.json();
  const tbody = document.getElementById('productList');

  if (!Array.isArray(data)) {
    tbody.innerHTML = `<tr><td colspan="5">${data.message || 'Gagal memuat data'}</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(p => `
    <tr>
      <td>${p.id}</td><td>${p.nama_produk}</td><td>${p.harga}</td><td>${p.stok}</td>
      <td>
        <button onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
        <button onclick="deleteProduct(${p.id})">Hapus</button>
      </td>
    </tr>`).join('');
}

document.getElementById('productForm').onsubmit = async (e) => {
  e.preventDefault();
  const base = getApiBase();
  const key = localStorage.getItem('api_key');
  const editId = document.getElementById('editId').value;

  const body = {
    nama_produk: document.getElementById('nama_produk').value,
    harga: parseInt(document.getElementById('harga').value),
    stok: parseInt(document.getElementById('stok').value),
    deskripsi: document.getElementById('deskripsi').value
  };

  const url = editId ? `${base}/api/products/${editId}` : `${base}/api/products`;
  const method = editId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method, headers: { 'Content-Type': 'application/json', 'x-api-key': key }, body: JSON.stringify(body)
  });
  const result = await res.json();
  alert(result.message);
  e.target.reset();
  document.getElementById('editId').value = '';
  loadProducts();
};

function editProduct(p) {
  document.getElementById('editId').value = p.id;
  document.getElementById('nama_produk').value = p.nama_produk;
  document.getElementById('harga').value = p.harga;
  document.getElementById('stok').value = p.stok;
  document.getElementById('deskripsi').value = p.deskripsi;
}

async function deleteProduct(id) {
  if (!confirm('Hapus produk ini?')) return;
  const base = getApiBase();
  const key = localStorage.getItem('api_key');
  const res = await fetch(`${base}/api/products/${id}`, { method: 'DELETE', headers: { 'x-api-key': key } });
  alert((await res.json()).message);
  loadProducts();
}

window.onload = () => {
  document.getElementById('apiBase').value = localStorage.getItem('api_base') || '';
  document.getElementById('apiKey').value = localStorage.getItem('api_key') || '';
  loadProducts();
};