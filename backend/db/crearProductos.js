// Productos semilla.
// Se insertan solo si NO existe ya un producto con el mismo nombre, así que
// también se agregan a bases de datos que ya tenían productos.
// Etiqueta: "-15%" = oferta con descuento (el precio guardado es el precio final),
// "Oferta" = oferta sin porcentaje, cualquier otro texto = etiqueta normal.
//
// [nombre, usuario_id, estado_id, precio, imagen, stock, etiqueta, categoria, municipio_code]
const productosSemilla = [
  ['Tomates Orgánicos', 4, 1, 3500, '/images/Tomate-Chonto.png', 100, 'Fresco', 'Hortalizas', '25875'],
  ['Lechuga Hidropónica', 5, 1, 2000, '/images/Lechuga-Hidropónica.png', 80, 'Nuevo', 'Hortalizas', '25718'],
  ['Mango Azúcar', 4, 1, 1500, '/images/Mango-Azucar.png', 120, 'Oferta', 'Frutas', '25320'],

  ['Aguacate Hass', 4, 1, 6500, '/images/Aguacate-Hass.png', 60, '-15%', 'Frutas', '25040'],
  ['Café Especial', 5, 1, 28000, '/images/Cafe-Especial.png', 40, 'Premium', 'Despensa', '25535'],
  ['Fríjol Rojo', 4, 1, 7800, '/images/Frijol-rojo.png', 90, 'Nuevo', 'Granos', '25743'],
  ['Huevos de Campo (docena)', 5, 1, 14000, '/images/Huevos-de-Campo-(docena).png', 50, '-10%', 'Lácteos y huevos', '25769'],
  ['Leche Orgánica (litro)', 5, 1, 4200, '/images/Leche-Organica-(litro).png', 70, 'Fresco', 'Lácteos y huevos', '25799'],
  ['Maíz Amarillo', 4, 1, 3200, '/images/Maiz-Amarillo.png', 150, 'Nuevo', 'Granos', '25386'],
  ['Miel Artesanal', 5, 1, 22000, '/images/Miel-Artesanal.png', 25, '-20%', 'Despensa', '25535'],
  ['Naranja Dulce', 4, 1, 2800, '/images/Naranja-Dulce.png', 200, '-25%', 'Frutas', '25386'],
  ['Papa Criolla', 5, 1, 3800, '/images/Papa-Criolla.png', 130, 'Fresco', 'Tubérculos', '25769'],
  ['Plátano Verde', 4, 1, 2500, '/images/Platano-Verde.png', 110, '-10%', 'Frutas', '25320'],
  ['Queso Campesino', 5, 1, 16500, '/images/Queso-Campesino.png', 4, 'Nuevo', 'Lácteos y huevos', '25799'],
  ['Yuca Fresca', 4, 1, 2200, '/images/Yuca-Fresca.png', 95, 'Fresco', 'Tubérculos', '25875'],
];

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
      municipio_code TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (estado_id) REFERENCES estado(id),
      FOREIGN KEY (municipio_code) REFERENCES municipios(code)
    )
  `, (err) => {
    if (err) return console.error("Error creando tabla productos:", err);

    const stmt = db.prepare(`
      INSERT INTO productos (nombre, usuario_id, estado_id, precio, imagen, stock, etiqueta, categoria, municipio_code)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = ?)
    `);

    let insertados = 0;
    productosSemilla.forEach((p) => {
      stmt.run([...p, p[0]], function (err) {
        if (err) console.error('Error insertando producto:', p[0], err);
        else if (this.changes > 0) insertados++;
      });
    });

    stmt.finalize(() => {
      if (insertados > 0) console.log(`Productos semilla agregados: ${insertados}`);
      if (callback) callback();
    });
  });
}

module.exports = crearProductos;
