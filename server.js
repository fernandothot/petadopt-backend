const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const { authenticateToken, authorizeRole } = require('./app/middleware/auth');

const usuariosRouter = require('./app/routes/usuarios');
const mascotasRouter = require('./app/routes/mascotas');
const donacionesRouter = require('./app/routes/donaciones');
const voluntariosRouter = require('./app/routes/voluntarios');
const actividadesRouter = require('./app/routes/actividades');
const authRouter = require('./app/routes/auth');

const app = express();

app.use(cors());

// ⚠️ Solo parsear JSON en rutas que lo necesiten
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta local (no persistente en Render)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Root
app.get('/', (req, res) => {
  res.send('Bienvenido a PetAdopt API 🚀');
});

// Auth
app.use('/auth', authRouter);

// Rutas principales
app.use('/usuarios', usuariosRouter);
app.use('/mascotas', mascotasRouter);
app.use('/donaciones', donacionesRouter);
app.use('/voluntarios', voluntariosRouter);
app.use('/actividades', actividadesRouter);

// Ejemplo de ruta protegida solo para admin: borrar usuario
app.delete('/admin/usuarios/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const db = require('./app/db');
  db.run('DELETE FROM usuario WHERE usuario_id=?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Nueva ruta para subir imágenes
app.post('/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ninguna imagen' });
  }
  res.json({
    message: 'Imagen subida correctamente',
    file: req.file,
    url: `/uploads/${req.file.filename}` // devolver URL accesible
  });
});

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
