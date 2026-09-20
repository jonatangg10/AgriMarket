const bcrypt = require('bcryptjs');
const saltRounds = 10;

function crearUsuarios(db, callback) {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombres TEXT NOT NULL,
      apellidos TEXT NOT NULL,
      num_documento TEXT UNIQUE NOT NULL,
      correo TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      genero_id INTEGER NOT NULL,
      rol_id INTEGER NOT NULL DEFAULT 2,
      fecha_creacion TEXT DEFAULT (datetime('now', '-5 hours')),

      FOREIGN KEY (genero_id) REFERENCES generos(id),
      FOREIGN KEY (rol_id) REFERENCES roles(id)
    )
  `, (err) => {
    if (err) return console.error("Error creando tabla usuarios:", err);

    db.get('SELECT COUNT(*) as count FROM usuarios', (err, row) => {
      if (err) return console.error("Error verificando usuarios:", err);

      if (row.count === 0) {
        const usuariosIniciales = [
          { id: 1, nombres: 'Jonatan Stiven', apellidos: 'Gutierrez Nieto', num_documento: '1003510994', correo: 'jonatangutierrez@agrilmarket.com', password: 'jonatan123', genero_id: 1, rol_id: 1 },
          { id: 2, nombres: 'Julian Emiro', apellidos: 'Gonzalez Perez', num_documento: '9876543210', correo: 'juliangonzalez@agrilmarket.com', password: 'julian123', genero_id: 1, rol_id: 1 },
          { id: 3, nombres: 'Maria Jose', apellidos: 'Ramirez Ocampo', num_documento: '1234567890', correo: 'mariaramirez@agrilmarket.com', password: 'pepito123', genero_id: 2, rol_id: 2 },
          { id: 4, nombres: 'Carlos Eduardo', apellidos: 'Gomez Martinez', num_documento: '9876543220', correo: 'carlosgomez@agrilmarket.com', password: 'pepito123', genero_id: 1, rol_id: 3 },
          { id: 5, nombres: 'Maria Liliana', apellidos: 'Lopez Ramirez', num_documento: '9876543221', correo: 'marialopez@agrilmarket.com', password: 'pepito123', genero_id: 2, rol_id: 3 },
        ];

        // Usamos Promise.all para esperar todos los hashes
        Promise.all(
          usuariosIniciales.map(u =>
            bcrypt.hash(u.password, saltRounds).then(hash => {
              return new Promise((resolve, reject) => {
                db.run(`
                  INSERT INTO usuarios (id, nombres, apellidos, num_documento, correo, password, genero_id, rol_id)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [u.id, u.nombres, u.apellidos, u.num_documento, u.correo, hash, u.genero_id, u.rol_id],
                (err) => {
                  if (err) {
                    console.error(`Error insertando a ${u.correo}:`, err);
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              });
            })
          )
        ).then(() => {
          console.log("Usuarios iniciales creados con contraseñas seguras (bcryptjs).");
          if (callback) callback();
        }).catch(err => {
          console.error("Error creando usuarios iniciales:", err);
        });

      } else {
        if (callback) callback();
      }
    });
  });
}

module.exports = crearUsuarios;
