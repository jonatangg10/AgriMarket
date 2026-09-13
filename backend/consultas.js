const sqlite3 = require('sqlite3').verbose();

// Abrir la base de datos existente
const db = new sqlite3.Database('./carrito.db');

// Consultar todos los productos y mostrarlos en consola
db.all('SELECT * FROM productos', (err, rows) => {
  if (err) {
    console.error("Error consultando productos:", err);
    return;
  }
  console.log("📦 Productos cargados en la BD:");
  console.table(rows);
});

// Cerrar la conexión al terminar
db.close();
