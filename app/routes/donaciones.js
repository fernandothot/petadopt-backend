const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar donaciones
router.get('/', (req, res) => {
  db.all('SELECT * FROM donacion', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear donación
router.post('/', (req, res) => {
  const { usuario_id, tipo_donacion, monto, detalle } = req.body;
  const sql = `INSERT INTO donacion (usuario_id, tipo_donacion, monto, detalle) VALUES (?, ?, ?, ?)`;
  db.run(sql, [usuario_id, tipo_donacion, monto, detalle], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ donacion_id: this.lastID, usuario_id, tipo_donacion, monto, detalle });
  });
});

// Actualizar donación
router.put('/:id', (req, res) => {
  const { usuario_id, tipo_donacion, monto, detalle } = req.body;
  const sql = `UPDATE donacion SET usuario_id=?, tipo_donacion=?, monto=?, detalle=? WHERE donacion_id=?`;
  db.run(sql, [usuario_id, tipo_donacion, monto, detalle, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Eliminar donación
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM donacion WHERE donacion_id=?`;
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
