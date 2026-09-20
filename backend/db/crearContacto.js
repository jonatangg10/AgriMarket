function crearContacto(db, callback) {

  db.run(`
    CREATE TABLE IF NOT EXISTS contacto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombres TEXT NOT NULL,
      apellidos TEXT NOT NULL,
      correo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      acepta_politicas INTEGER NOT NULL,
      fecha_creacion TEXT DEFAULT (datetime('now', '-5 hours'))
    )
  `, (err) => {

    if (err) {
      return console.error("Error creando tabla contacto:", err);
    }

    console.log("Tabla contacto creada correctamente.");

    if (callback) callback();

  });

}

module.exports = crearContacto;