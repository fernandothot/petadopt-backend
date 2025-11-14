const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./petadopt.db', (err) => {
  if (err) console.error('Error al conectar con SQLite:', err.message);
  else console.log('Conectado a SQLite.');
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  // Crear tabla rol
  db.run(`CREATE TABLE IF NOT EXISTS rol (
    rol_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL
  )`);

  // Insertar roles iniciales si no existen
  const roles = ['admin', 'voluntario', 'adoptante'];
  roles.forEach(r => {
    db.run(`INSERT OR IGNORE INTO rol (nombre) VALUES (?)`, [r]);
  });

  // Crear tabla usuario
  db.run(`CREATE TABLE IF NOT EXISTS usuario (
    usuario_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    direccion TEXT,
    contrasena TEXT NOT NULL
  )`);

  // Crear tabla usuario_rol (relación muchos a muchos)
  db.run(`CREATE TABLE IF NOT EXISTS usuario_rol (
    usuario_id INTEGER,
    rol_id INTEGER,
    PRIMARY KEY(usuario_id, rol_id),
    FOREIGN KEY(usuario_id) REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY(rol_id) REFERENCES rol(rol_id) ON DELETE CASCADE
  )`);

  // Mascotas
  db.run(`CREATE TABLE IF NOT EXISTS mascota (
    mascota_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    especie TEXT,
    raza TEXT,
    edad INTEGER,
    tamano TEXT,
    sexo TEXT,
    estado_salud TEXT,
    disponibilidad_adopcion INTEGER DEFAULT 1,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    foto_url TEXT
  )`);

  // Historial de cuidados
  db.run(`CREATE TABLE IF NOT EXISTS historial_cuidados (
    historial_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mascota_id INTEGER NOT NULL,
    tipo_cuidado TEXT,
    fecha DATE DEFAULT CURRENT_DATE,
    descripcion TEXT,
    FOREIGN KEY(mascota_id) REFERENCES mascota(mascota_id) ON DELETE CASCADE
  )`);

  // Adopciones
  db.run(`CREATE TABLE IF NOT EXISTS usuario_adopcion (
    adopcion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    mascota_id INTEGER NOT NULL,
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    estado TEXT DEFAULT 'pendiente',
    comentarios TEXT,
    FOREIGN KEY(usuario_id) REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY(mascota_id) REFERENCES mascota(mascota_id) ON DELETE CASCADE
  )`);

  // Voluntarios
  db.run(`CREATE TABLE IF NOT EXISTS voluntario (
    voluntario_id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    fecha_inscripcion DATE DEFAULT CURRENT_DATE,
    estado TEXT DEFAULT 'activo',
    FOREIGN KEY(usuario_id) REFERENCES usuario(usuario_id) ON DELETE CASCADE
  )`);

  // Actividades
  db.run(`CREATE TABLE IF NOT EXISTS actividad (
    actividad_id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    imagen TEXT
  )`);

  // Relación voluntario-actividad
  db.run(`CREATE TABLE IF NOT EXISTS voluntario_actividad (
    voluntario_id INTEGER,
    actividad_id INTEGER,
    PRIMARY KEY(voluntario_id, actividad_id),
    FOREIGN KEY(voluntario_id) REFERENCES voluntario(voluntario_id) ON DELETE CASCADE,
    FOREIGN KEY(actividad_id) REFERENCES actividad(actividad_id) ON DELETE CASCADE
  )`);

  // Donaciones
  db.run(`CREATE TABLE IF NOT EXISTS donacion (
    donacion_id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    tipo_donacion TEXT NOT NULL,
    monto REAL,
    detalle TEXT,
    fecha_donacion DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY(usuario_id) REFERENCES usuario(usuario_id) ON DELETE CASCADE
  )`);

  // Mensajes
  db.run(`CREATE TABLE IF NOT EXISTS mensaje (
    mensaje_id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    nombre TEXT,
    correo TEXT,
    telefono TEXT,
    asunto TEXT,
    mensaje TEXT,
    fecha_envio DATE DEFAULT CURRENT_DATE,
    estado TEXT DEFAULT 'pendiente',
    FOREIGN KEY(usuario_id) REFERENCES usuario(usuario_id)
  )`);
});

module.exports = db;
