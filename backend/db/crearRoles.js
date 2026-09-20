function crearRoles(db, callback) {

  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    )
  `, (err) => {

    if (err) {
      return console.error("Error creando tabla roles:", err);
    }

    db.get(
      'SELECT COUNT(*) as count FROM roles',
      (err, row) => {

        if (err) {
          return console.error("Error verificando roles:", err);
        }

        if (row.count === 0) {

          db.run(`
            INSERT INTO roles (id, nombre)
            VALUES
              (1, 'admin'),
              (2, 'user'),
              (3, 'vendedor')
          `, (err) => {

            if (err) {
              return console.error("Error insertando roles:", err);
            }

            console.log("Roles iniciales cargados.");

            if (callback) callback();

          });

        } else {

          if (callback) callback();

        }

      }
    );

  });
}

module.exports = crearRoles;