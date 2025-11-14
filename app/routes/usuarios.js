const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar usuarios
router.get('/', (req, res) => {
  db.all('SELECT * FROM usuario', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear usuario
router.post('/', (req, res) => {
  const { nombre, apellido, direccion, contrasena } = req.body;
  const sql = `INSERT INTO usuario (nombre, apellido, direccion, contrasena) VALUES (?, ?, ?, ?)`;
  db.run(sql, [nombre, apellido, direccion, contrasena], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ usuario_id: this.lastID, nombre, apellido, direccion });
  });
});

// Actualizar usuario
router.put('/:id', (req, res) => {
  const { nombre, apellido, direccion, contrasena } = req.body;
  const sql = `UPDATE usuario SET nombre=?, apellido=?, direccion=?, contrasena=? WHERE usuario_id=?`;
  db.run(sql, [nombre, apellido, direccion, contrasena, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Eliminar usuario
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM usuario WHERE usuario_id=?`;
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
