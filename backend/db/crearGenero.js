function crearGeneros(db, callback) {
  db.run(`
    CREATE TABLE IF NOT EXISTS generos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL
    )
  `, (err) => {

    if (err) {
      return console.error("Error creando tabla generos:", err);
    }

    db.get(
      'SELECT COUNT(*) as count FROM generos',
      (err, row) => {

        if (err) {
          return console.error("Error verificando generos:", err);
        }

        if (row.count === 0) {

          db.run(`
            INSERT INTO generos (id, nombre)
            VALUES (1, 'Hombre'), (2, 'Mujer')
          `, (err) => {

            if (err) {
              return console.error("Error insertando generos:", err);
            }

            console.log("Generos iniciales cargados.");

            if (callback) callback();
          });

        } else {

          if (callback) callback();

        }
      }
    );
  });
}

module.exports = crearGeneros;