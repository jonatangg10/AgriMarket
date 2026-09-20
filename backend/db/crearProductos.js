function crearProductos(db, callback) {
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      usuario_id INTEGER NOT NULL,
      estado_id INTEGER NOT NULL,
      precio REAL NOT NULL,
      imagen TEXT,
      stock INTEGER NOT NULL DEFAULT 10,
      etiqueta TEXT NOT NULL,
      categoria TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (estado_id) REFERENCES estado(id)
    )
  `, (err) => {
    if (err) return console.error("Error creando tabla productos:", err);

    db.get('SELECT COUNT(*) as count FROM productos', (err, row) => {
      if (err) return console.error("Error verificando productos:", err);

      if (row.count === 0) {
        const stmt = db.prepare(`
          INSERT INTO productos (nombre, usuario_id, estado_id, precio, imagen, stock, etiqueta, categoria)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const productosEjemplo = [
          ['Tomates Orgánicos', 4, 1, 3500, '/images/Tomate-Chonto.png', 100, 'Fresco', 'Hortalizas'],
          ['Lechuga Hidropónica', 5, 1, 2000, '/images/Lechuga-Hidropónica.png', 80, 'Nuevo', 'Hortalizas'],
          ['Mango Azúcar', 4, 1, 1500, '/images/Mango-Azucar.png', 120, 'Oferta', 'Frutas']
        ];

        productosEjemplo.forEach(p => stmt.run(p, (err) => {
          if (err) console.error('Error insertando producto:', p[0], err);
        }));

        stmt.finalize(() => {
          console.log("Productos iniciales cargados.");
          if (callback) callback();
        });
      } else {
        if (callback) callback();
      }
    });
  });
}

module.exports = crearProductos;
