# Catálogo Artesanal — Mariana Pasinato

Catálogo web de artesanías con panel de administración. Categorías: Almohadones, Caminos, Velas y Alhajeros.

---

## ▶ Correr localmente

### 1. Requisitos previos
- Tener instalado **Node.js** (versión 18 o superior)
  - Descargalo de: https://nodejs.org

### 2. Instalar dependencias
Abrí una terminal en la carpeta del proyecto y ejecutá:
```bash
npm install
```

### 3. Arrancar el servidor
```bash
npm start
```

### 4. Abrir en el navegador
- 🛍 **Catálogo público**: http://localhost:3000
- 🔐 **Panel admin**: http://localhost:3000/admin (contraseña: `mariana2024`)

---

## 🔐 Cambiar la contraseña del admin

Creá un archivo llamado `.env` en la raíz del proyecto (copiando `.env.example`):
```
ADMIN_PASSWORD=tu_nueva_contraseña
SESSION_SECRET=cualquier_texto_aleatorio_largo
PORT=3000
```

---

## 🌐 Publicar en internet (gratis con Render.com)

> Con estos pasos vas a obtener una URL pública para compartir en redes.

### Paso 1 — Subir el código a GitHub

1. Creá una cuenta en https://github.com si no tenés
2. Creá un repositorio nuevo (privado o público)
3. Subí todos los archivos de esta carpeta al repositorio

### Paso 2 — Crear una cuenta en Render

1. Andá a https://render.com y creá una cuenta gratuita
2. Hacé clic en **"New +"** → **"Web Service"**
3. Conectá tu cuenta de GitHub y seleccioná el repositorio

### Paso 3 — Configurar el servicio

Completá los campos así:

| Campo | Valor |
|-------|-------|
| **Name** | catalogo-mariana |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### Paso 4 — Variables de entorno en Render

En la sección **"Environment"**, agregá:

| Variable | Valor |
|----------|-------|
| `ADMIN_PASSWORD` | tu contraseña |
| `SESSION_SECRET` | cualquier texto largo aleatorio |

### Paso 5 — Deploy

Hacé clic en **"Create Web Service"**. En unos minutos vas a tener una URL del estilo:
```
https://catalogo-mariana.onrender.com
```

¡Esa es la URL que compartís en Instagram, WhatsApp, etc.!

---

## 📁 Estructura del proyecto

```
catalogo/
├── server.js          ← Servidor principal
├── database.js        ← Manejo de base de datos SQLite
├── package.json       ← Dependencias
├── .env.example       ← Ejemplo de configuración
├── catalogo.db        ← Base de datos (se crea sola al arrancar)
├── uploads/           ← Fotos subidas (se crea sola)
└── public/
    ├── index.html     ← Catálogo público
    ├── admin.html     ← Panel de administración
    └── css/
        └── catalogo.css
```

---

## 📝 Uso del panel de administración

1. Ir a `/admin` e ingresar la contraseña
2. **Agregar producto**: completar el formulario de la izquierda y hacer clic en "Guardar producto"
3. **Editar producto**: hacer clic en "✏ Editar" en cualquier producto de la lista
4. **Eliminar producto**: hacer clic en "🗑" y confirmar en el modal
5. **Filtrar lista**: usar los botones de categoría arriba de la lista

---

## ⚠️ Nota sobre las imágenes en Render (plan gratuito)

El plan gratuito de Render usa un **filesystem efímero**: las imágenes subidas se pierden si el servicio se reinicia. Para evitar esto, una opción gratuita es usar **Cloudinary** para alojar las imágenes. Consultá si necesitás implementar esa opción.
