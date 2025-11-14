const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar mascotas
router.get('/', (req, res) => {
  db.all('SELECT * FROM mascota', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear mascota
router.post('/', (req, res) => {
  const { nombre, especie, raza, edad, tamano, sexo, estado_salud, foto_url } = req.body;
  const sql = `INSERT INTO mascota (nombre, especie, raza, edad, tamano, sexo, estado_salud, foto_url) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [nombre, especie, raza, edad, tamano, sexo, estado_salud, foto_url], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mascota_id: this.lastID, nombre, especie, raza });
  });
});

// Actualizar mascota
router.put('/:id', (req, res) => {
  const { nombre, especie, raza, edad, tamano, sexo, estado_salud, foto_url } = req.body;
  const sql = `UPDATE mascota SET nombre=?, especie=?, raza=?, edad=?, tamano=?, sexo=?, estado_salud=?, foto_url=? WHERE mascota_id=?`;
  db.run(sql, [nombre, especie, raza, edad, tamano, sexo, estado_salud, foto_url, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

// Eliminar mascota
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM mascota WHERE mascota_id=?`;
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
