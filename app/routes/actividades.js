const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar actividades
router.get('/', (req, res) => {
  db.all('SELECT * FROM actividad', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear actividad
router.post('/', (req, res) => {
  const { titulo, descripcion, fecha_inicio, fecha_fin, imagen } = req.body;
  const sql = `INSERT INTO actividad (titulo, descripcion, fecha_inicio, fecha_fin, imagen) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [titulo, descripcion, fecha_inicio, fecha_fin, imagen], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ actividad_id: this.lastID, titulo, descripcion });
  });
});

// Actualizar actividad
router.put('/:id', (req, res) => {
  const { titulo, descripcion, fecha_inicio, fecha_fin, imagen } = req.body;
  const sql = `UPDATE actividad SET titulo=?, descripcion=?, fecha_inicio=?, fecha_fin=?, imagen=? WHERE actividad_id=?`;
  db.run(sql, [titulo, descripcion, fecha_inicio, fecha_fin, imagen, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Eliminar actividad
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM actividad WHERE actividad_id=?`;
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
