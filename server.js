const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const { authenticateToken, authorizeRole } = require('./app/middleware/auth');

const usuariosRouter = require('./app/routes/usuarios');
const mascotasRouter = require('./app/routes/mascotas');
const donacionesRouter = require('./app/routes/donaciones');
const voluntariosRouter = require('./app/routes/voluntarios');
const actividadesRouter = require('./app/routes/actividades');
const authRouter = require('./app/routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// Configuración de Multer para guardar temporalmente
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'temp/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
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

// Nueva ruta para subir imágenes (Cloudinary)
app.post('/upload', upload.single('imagen'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ninguna imagen' });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    fs.unlinkSync(req.file.path); // elimina archivo temporal

    res.json({
      message: 'Imagen subida correctamente',
      url: result.secure_url // URL pública de Cloudinary
    });
  } catch (err) {
    res.status(500).json({ error: 'Error subiendo imagen a Cloudinary' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
