const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

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

// Listar mascotas
router.get('/', (req, res) => {
  db.all('SELECT * FROM mascota', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear mascota con foto (subida a Cloudinary)
router.post('/', upload.single('foto'), async (req, res) => {
  const { nombre, especie, raza, edad, tamano, sexo, estado_salud } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El campo nombre es obligatorio' });
  }

  let foto_url = null;
  if (req.file) {
    console.log("📸 Archivo recibido:", req.file.path);
    try {
      if (fs.existsSync(req.file.path)) {
        const result = await cloudinary.uploader.upload(req.file.path);
        foto_url = result.secure_url;
        fs.unlinkSync(req.file.path);
        console.log("✅ Imagen subida a Cloudinary:", foto_url);
      } else {
        console.error("❌ Archivo no encontrado:", req.file.path);
        return res.status(500).json({ error: 'Archivo temporal no encontrado' });
      }
    } catch (err) {
      console.error("❌ Error Cloudinary:", err.message);
      return res.status(500).json({ error: 'Error subiendo imagen a Cloudinary', detalle: err.message });
    }
  }

  const sql = `INSERT INTO mascota (nombre, especie, raza, edad, tamano, sexo, estado_salud, foto_url) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [nombre, especie, raza, edad, tamano, sexo, estado_salud, foto_url], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mascota_id: this.lastID, nombre, especie, raza, foto_url });
  });
});

// Actualizar mascota (con nueva foto opcional)
router.put('/:id', upload.single('foto'), async (req, res) => {
  const { nombre, especie, raza, edad, tamano, sexo, estado_salud } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El campo nombre es obligatorio' });
  }

  let foto_url = req.body.foto_url || null;
  if (req.file) {
    console.log("📸 Archivo recibido para actualización:", req.file.path);
    try {
      if (fs.existsSync(req.file.path)) {
        const result = await cloudinary.uploader.upload(req.file.path);
        foto_url = result.secure_url;
        fs.unlinkSync(req.file.path);
        console.log("✅ Imagen actualizada en Cloudinary:", foto_url);
      } else {
        console.error("❌ Archivo no encontrado:", req.file.path);
        return res.status(500).json({ error: 'Archivo temporal no encontrado' });
      }
    } catch (err) {
      console.error("❌ Error Cloudinary:", err.message);
      return res.status(500).json({ error: 'Error subiendo imagen a Cloudinary', detalle: err.message });
    }
  }

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
