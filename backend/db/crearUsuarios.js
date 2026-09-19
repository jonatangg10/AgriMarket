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
      rol TEXT NOT NULL DEFAULT 'user',
      fecha_creacion TEXT DEFAULT (datetime('now', '-5 hours'))
    )
  `, (err) => {
    if (err) return console.error("Error creando tabla usuarios:", err);

    db.get('SELECT COUNT(*) as count FROM usuarios', (err, row) => {
      if (err) return console.error("Error verificando usuarios:", err);

      if (row.count === 0) {
        const usuariosIniciales = [
          { nombres: 'Jonatan Stiven', apellidos: 'Gutierrez Nieto', num_documento: '1003510994', correo: 'jonatangutierrez@invenfact.com', password: 'jonatan123', rol: 'admin' },
          { nombres: 'Julian Emiro', apellidos: 'Gonzalez Perez', num_documento: '9876543210', correo: 'juliangonzalez@invenfact.com', password: 'julian123', rol: 'admin' },
          { nombres: 'Pepito', apellidos: 'usuario', num_documento: '1234567890', correo: 'pepitousuario@invenfact.com', password: 'pepito123', rol: 'user' },
          { nombres: 'Pepito', apellidos: 'vendedor', num_documento: '9876543220', correo: 'pepitovendedor@invenfact.com', password: 'pepito123', rol: 'vendedor' }
        ];

        // Usamos Promise.all para esperar todos los hashes
        Promise.all(
          usuariosIniciales.map(u =>
            bcrypt.hash(u.password, saltRounds).then(hash => {
              return new Promise((resolve, reject) => {
                db.run(`
                  INSERT INTO usuarios (nombres, apellidos, num_documento, correo, password, rol)
                  VALUES (?, ?, ?, ?, ?, ?)
                `,
                [u.nombres, u.apellidos, u.num_documento, u.correo, hash, u.rol],
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
