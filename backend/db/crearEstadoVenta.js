function crearEstadoVentas(db, callback) {
  db.run(`
    CREATE TABLE IF NOT EXISTS estado_venta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      estado TEXT NOT NULL UNIQUE
    )
  `, (err) => {
    if (err) return console.error("Error creando tabla estado_venta:", err);

    db.get('SELECT COUNT(*) as count FROM estado_venta', (err, row) => {
      if (err) return console.error("Error verificando estado_venta:", err);

      if (row.count === 0) {
        const stmt = db.prepare(`
          INSERT INTO estado_venta (id,estado)
          VALUES (?)
        `);

        // Estados predeterminados para las solicitudes de compra
        const estadosEjemplo = [
          [1, 'Pendiente'],       // ID: 1 - Recién solicitada
          [2, 'Confirmada'],      // ID: 2 - Productor acepta el pedido
          [3, 'En preparación'],  // ID: 3 - Alistando el producto/cosecha
          [4, 'Enviada'],         // ID: 4 - En camino al cliente
          [5, 'Entregada'],       // ID: 5 - Cliente recibió el producto
          [6, 'Rechazada'],       // ID: 6 - Productor no puede cumplir (falta stock, etc.)
          [7, 'Cancelada']        // ID: 7 - Cliente canceló
        ];

        estadosEjemplo.forEach(e => stmt.run(e, (err) => {
          if (err) console.error('Error insertando estado_venta:', e[0], err);
        }));

        stmt.finalize(() => {
          console.log("Estados de venta iniciales cargados.");
          if (callback) callback();
        });
      } else {
        if (callback) callback();
      }
    });
  });
}

module.exports = crearEstadoVentas;