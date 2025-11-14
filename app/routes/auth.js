const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { SECRET_KEY } = require('../middleware/auth');

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido, direccion, contrasena, rol, rolNombre } = req.body;

    if (!nombre || !apellido || !contrasena) {
      return res.status(400).json({ error: 'Nombre, apellido y contraseña son obligatorios' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const sqlUsuario = `INSERT INTO usuario (nombre, apellido, direccion, contrasena) VALUES (?, ?, ?, ?)`;
    db.run(sqlUsuario, [nombre, apellido, direccion || null, hashedPassword], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const usuario_id = this.lastID;

      // Determinar rol por nombre (por defecto: adoptante)
      const rolTexto = rolNombre || rol || 'adoptante';
      const sqlRol = 'SELECT rol_id FROM rol WHERE nombre = ?';

      db.get(sqlRol, [rolTexto], (err2, rolRow) => {
        if (err2) return res.status(500).json({ error: err2.message });
        if (!rolRow) return res.status(400).json({ error: 'Rol inválido' });

        const sqlUsuarioRol = 'INSERT INTO usuario_rol (usuario_id, rol_id) VALUES (?, ?)';
        db.run(sqlUsuarioRol, [usuario_id, rolRow.rol_id], function (err3) {
          if (err3) return res.status(500).json({ error: err3.message });

          res.status(201).json({
            usuario_id,
            nombre,
            apellido,
            direccion,
            rol: rolTexto
          });
        });
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { nombre, contrasena } = req.body;

  if (!nombre || !contrasena) {
    return res.status(400).json({ error: 'Nombre y contraseña son obligatorios' });
  }

  const sqlUser = 'SELECT * FROM usuario WHERE nombre = ?';
  db.get(sqlUser, [nombre], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    try {
      const validPassword = await bcrypt.compare(contrasena, user.contrasena);
      if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

      // Obtener rol principal del usuario
      const sqlRol = `
        SELECT r.nombre AS rol
        FROM usuario_rol ur
        JOIN rol r ON r.rol_id = ur.rol_id
        WHERE ur.usuario_id = ?
        LIMIT 1
      `;

      db.get(sqlRol, [user.usuario_id], (err2, rolRow) => {
        if (err2) return res.status(500).json({ error: err2.message });

        const rol = rolRow ? rolRow.rol : 'adoptante';

        const payload = { usuario_id: user.usuario_id, rol };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' });

        res.json({ token, rol });
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error al verificar credenciales' });
    }
  });
});

module.exports = router;
