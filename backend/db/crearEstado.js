function crearEstado(db, callback) {
  db.run(`
    CREATE TABLE IF NOT EXISTS estado (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL
    )
  `, (err) => {
    if (err) return console.error("Error creando tabla estado:", err);

    db.get('SELECT COUNT(*) as count FROM estado', (err, row) => {
      if (err) return console.error("Error verificando estados:", err);

      if (row.count === 0) {
        db.run(`
          INSERT INTO estado (id, nombre)
          VALUES (1, 'Activo'), (2, 'Inactivo')
        `, (err) => {
          if (err) return console.error("Error insertando estados:", err);
          console.log("Estados iniciales cargados.");
          if (callback) callback();
        });
      } else {
        if (callback) callback();
      }
    });
  });
}

module.exports = crearEstado;