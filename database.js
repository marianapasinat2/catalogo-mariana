const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME     = 'catalogo_mariana';

let _db = null;

async function connect() {
  if (_db) return _db;
  if (!MONGODB_URI) throw new Error('Falta la variable de entorno MONGODB_URI');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  _db = client.db(DB_NAME);
  console.log('✅ Conectado a MongoDB Atlas');
  return _db;
}

function col() {
  return connect().then(db => db.collection('productos'));
}

// ── CRUD ───────────────────────────────────────────────────

async function getAllProductos() {
  const c = await col();
  const docs = await c.find({}).sort({ categoria: 1, nombre: 1 }).toArray();
  return docs.map(formatDoc);
}

async function getProductosByCategoria(categoria) {
  const c = await col();
  const docs = await c.find({ categoria }).sort({ nombre: 1 }).toArray();
  return docs.map(formatDoc);
}

async function getProductoById(id) {
  try {
    const c = await col();
    const doc = await c.findOne({ _id: new ObjectId(id) });
    return doc ? formatDoc(doc) : null;
  } catch {
    return null;
  }
}

async function createProducto({ nombre, descripcion, precio, categoria, imagen }) {
  const c = await col();
  const result = await c.insertOne({
    nombre,
    descripcion: descripcion || '',
    precio: parseFloat(precio) || 0,
    categoria,
    imagen: imagen || '',
    creadoEn: new Date()
  });
  return result.insertedId.toString();
}

async function updateProducto(id, { nombre, descripcion, precio, categoria, imagen }) {
  const c = await col();
  await c.updateOne(
    { _id: new ObjectId(id) },
    { $set: { nombre, descripcion, precio: parseFloat(precio) || 0, categoria, imagen } }
  );
}

async function deleteProducto(id) {
  const c = await col();
  await c.deleteOne({ _id: new ObjectId(id) });
}

// Convierte _id de Mongo a id simple para el frontend
function formatDoc(doc) {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

module.exports = {
  getAllProductos,
  getProductosByCategoria,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
};
