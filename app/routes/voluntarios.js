const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar voluntarios
router.get('/', (req, res) => {
  db.all('SELECT * FROM voluntario', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear voluntario
router.post('/', (req, res) => {
  const { usuario_id, estado } = req.body;
  const sql = `INSERT INTO voluntario (usuario_id, estado) VALUES (?, ?)`;
  db.run(sql, [usuario_id, estado || 'activo'], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ voluntario_id: this.lastID, usuario_id, estado: estado || 'activo' });
  });
});

// Actualizar voluntario
router.put('/:id', (req, res) => {
  const { usuario_id, estado } = req.body;
  const sql = `UPDATE voluntario SET usuario_id=?, estado=? WHERE voluntario_id=?`;
  db.run(sql, [usuario_id, estado, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Eliminar voluntario
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM voluntario WHERE voluntario_id=?`;
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
