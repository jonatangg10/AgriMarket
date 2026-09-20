const { municipalities } = require('../municipios');

function crearMunicipios(db, callback) {
  db.run(`
    CREATE TABLE IF NOT EXISTS municipios (
      code TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      departamento_code TEXT NOT NULL,
      FOREIGN KEY (departamento_code) REFERENCES departamentos(code)
    )
  `, (err) => {
    if (err) return console.error("Error creando tabla municipios:", err);

    db.get('SELECT COUNT(*) as count FROM municipios', (err, row) => {
      if (err) return console.error("Error verificando municipios:", err);

      if (row.count === 0) {
        const stmt = db.prepare(`
          INSERT INTO municipios (code, nombre, departamento_code) VALUES (?, ?, ?)
        `);

        municipalities.forEach((m) => {
          stmt.run([m.code, m.name, m.department.code], (err) => {
            if (err) console.error('Error insertando municipio:', m.name, err);
          });
        });

        stmt.finalize(() => {
          console.log("Municipios iniciales cargados.");
          if (callback) callback();
        });
      } else {
        if (callback) callback();
      }
    });
  });
}

module.exports = crearMunicipios;