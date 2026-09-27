const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'catalogo.json');

// ── Inicializar archivo si no existe ──────────────────────
function getDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ productos: [], nextId: 1 }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── CRUD ───────────────────────────────────────────────────

function getAllProductos() {
  const db = getDb();
  return db.productos.sort((a, b) =>
    a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre)
  );
}

function getProductosByCategoria(categoria) {
  return getAllProductos().filter(p => p.categoria === categoria);
}

function getProductoById(id) {
  return getDb().productos.find(p => p.id === id) || null;
}

function createProducto({ nombre, descripcion, precio, categoria, imagen }) {
  const db = getDb();
  const producto = {
    id: db.nextId++,
    nombre,
    descripcion: descripcion || '',
    precio: parseFloat(precio) || 0,
    categoria,
    imagen: imagen || ''
  };
  db.productos.push(producto);
  saveDb(db);
  return producto.id;
}

function updateProducto(id, { nombre, descripcion, precio, categoria, imagen }) {
  const db = getDb();
  const idx = db.productos.findIndex(p => p.id === id);
  if (idx === -1) return;
  db.productos[idx] = { ...db.productos[idx], nombre, descripcion, precio, categoria, imagen };
  saveDb(db);
}

function deleteProducto(id) {
  const db = getDb();
  db.productos = db.productos.filter(p => p.id !== id);
  saveDb(db);
}

module.exports = {
  getAllProductos,
  getProductosByCategoria,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
};
