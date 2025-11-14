const express = require('express');
const cors = require('cors');
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

// Root
app.get('/', (req, res) => {
  res.send('Bienvenido a PetAdopt API 🚀');
});

// Auth
app.use('/auth', authRouter);

// Rutas principales (por ahora públicas; puedes protegerlas con authenticateToken si lo deseas)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
