const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Obtener todos los productos
  router.get('/', (req, res) => {
    db.all(
      `SELECT 
        id,
        nombre,
        usuario_id,
        estado_id,
        precio,
        imagen,
        stock,
        etiqueta,
        categoria
      FROM productos`,
      (err, rows) => {
        if (err) {
          console.error('Error al obtener productos:', err);

          return res.status(500).json({
            error: 'Error al obtener productos'
          });
        }

        res.json(rows);
      }
    );
  });

  return router;
};