const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta local (no persistente en Render)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Listar mascotas
router.get('/', (req, res) => {
  db.all('SELECT * FROM mascota', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear mascota con foto (opcional)
router.post('/', upload.single('foto'), (req, res) => {
  const { nombre, especie, raza, edad, tamano, sexo, estado_salud } = req.body;

  // Validación: nombre obligatorio
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El campo nombre es obligatorio' });
  }

  const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `INSERT INTO mascota (nombre, especie, raza, edad, tamano, sexo, estado_salud, foto_url) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [nombre, especie, raza, edad, tamano, sexo, estado_salud, foto_url], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mascota_id: this.lastID, nombre, especie, raza, foto_url });
  });
});

// Actualizar mascota (con nueva foto opcional)
router.put('/:id', upload.single('foto'), (req, res) => {
  const { nombre, especie, raza, edad, tamano, sexo, estado_salud } = req.body;

  // Validación: nombre obligatorio
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El campo nombre es obligatorio' });
  }

  const foto_url = req.file ? `/uploads/${req.file.filename}` : req.body.foto_url;

  const sql = `UPDATE mascota 
               SET nombre=?, especie=?, raza=?, edad=?, tamano=?, sexo=?, estado_salud=?, foto_url=? 
               WHERE mascota_id=?`;
  db.run(sql, [nombre, especie, raza, edad, tamano, sexo, estado_salud, foto_url, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes, foto_url });
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
