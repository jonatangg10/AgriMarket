function crearVentas(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_documento TEXT NOT NULL,
      cliente_nombre TEXT NOT NULL,
      cliente_email TEXT,            
      cliente_telefono TEXT,          
      reference_code TEXT UNIQUE NOT NULL,
      numbering_range_id INTEGER,
      bill_number TEXT,
      cufe TEXT,
      qr_url TEXT,
      total REAL NOT NULL,
      estado TEXT DEFAULT 'completado',
      fecha_creacion TEXT DEFAULT (datetime('now', '-5 hours'))
    )
  `, (err) => {
    if (err) return console.error("Error creando tabla ventas:", err);

    db.run(`
      CREATE TABLE IF NOT EXISTS detalle_ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `, (err) => {
      if (err) return console.error("Error creando tabla detalle_ventas:", err);
      console.log("Tablas de ventas y detalle_ventas listas.");
    });
  });
}

module.exports = crearVentas;
