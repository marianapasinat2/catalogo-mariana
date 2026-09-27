const express    = require('express');
const session    = require('express-session');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const db         = require('./database');

// ── Configuración ──────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mariana2024';
const SESSION_SECRET = process.env.SESSION_SECRET  || 'mp_catalogo_secret_2024';
const PORT           = process.env.PORT            || 3000;

const app = express();

// ── Directorios estáticos ──────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 horas
}));

// ── Multer (upload de imágenes) ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
             && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp)'));
  }
});

// ── Middleware de autenticación ────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.adminLoggedIn) return next();
  res.status(401).json({ error: 'No autorizado. Por favor iniciá sesión.' });
}

// ══════════════════════════════════════════════════════════════════════════════
//  RUTAS PÚBLICAS — API de catálogo
// ══════════════════════════════════════════════════════════════════════════════

// Todos los productos (o filtrado por ?categoria=)
app.get('/api/productos', (req, res) => {
  try {
    const { categoria } = req.query;
    const productos = categoria
      ? db.getProductosByCategoria(categoria)
      : db.getAllProductos();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  RUTAS ADMIN — autenticación
// ══════════════════════════════════════════════════════════════════════════════

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.adminLoggedIn = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Contraseña incorrecta' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.adminLoggedIn) });
});

// ══════════════════════════════════════════════════════════════════════════════
//  RUTAS ADMIN — CRUD de productos  (requieren auth)
// ══════════════════════════════════════════════════════════════════════════════

// Crear producto
app.post('/api/admin/productos', requireAuth, upload.single('imagen'), (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria } = req.body;
    if (!nombre || !categoria) {
      return res.status(400).json({ error: 'Nombre y categoría son obligatorios' });
    }
    const imagen = req.file ? `/uploads/${req.file.filename}` : '';
    const id = db.createProducto({
      nombre: nombre.trim(),
      descripcion: (descripcion || '').trim(),
      precio: parseFloat(precio) || 0,
      categoria,
      imagen
    });
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar producto
app.put('/api/admin/productos/:id', requireAuth, upload.single('imagen'), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existente = db.getProductoById(id);
    if (!existente) return res.status(404).json({ error: 'Producto no encontrado' });

    const { nombre, descripcion, precio, categoria } = req.body;
    // Si se sube nueva imagen, usarla; si no, conservar la anterior
    const imagen = req.file ? `/uploads/${req.file.filename}` : existente.imagen;

    db.updateProducto(id, {
      nombre: (nombre || existente.nombre).trim(),
      descripcion: descripcion !== undefined ? descripcion.trim() : existente.descripcion,
      precio: precio !== undefined ? parseFloat(precio) : existente.precio,
      categoria: categoria || existente.categoria,
      imagen
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar producto
app.delete('/api/admin/productos/:id', requireAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existente = db.getProductoById(id);
    if (!existente) return res.status(404).json({ error: 'Producto no encontrado' });

    // Eliminar imagen del disco si existe
    if (existente.imagen && existente.imagen.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, existente.imagen);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    db.deleteProducto(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Fallback: páginas HTML ─────────────────────────────────────────────────────
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Arrancar ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Catálogo Mariana Pasinato corriendo en http://localhost:${PORT}`);
  console.log(`🔐 Panel admin: http://localhost:${PORT}/admin\n`);
});
