const { municipalities } = require('../municipios'); 

function crearDepartamentos(db, callback) {
  db.run(`
    CREATE TABLE IF NOT EXISTS departamentos (
      code TEXT PRIMARY KEY,
      nombre TEXT NOT NULL
    )
  `, (err) => {
    if (err) return console.error("Error creando tabla departamentos:", err);

    db.get('SELECT COUNT(*) as count FROM departamentos', (err, row) => {
      if (err) return console.error("Error verificando departamentos:", err);

      if (row.count === 0) {
        const departamentosUnicos = Array.from(
          new Map(municipalities.map(m => [m.department.code, m.department])).values()
        );

        const stmt = db.prepare(`
          INSERT INTO departamentos (code, nombre) VALUES (?, ?)
        `);

        departamentosUnicos.forEach((d) => {
          stmt.run([d.code, d.name], (err) => {
            if (err) console.error('Error insertando departamento:', d.name, err);
          });
        });

        stmt.finalize(() => {
          console.log("Departamentos iniciales cargados.");
          if (callback) callback();
        });
      } else {
        if (callback) callback();
      }
    });
  });
}

module.exports = crearDepartamentos;