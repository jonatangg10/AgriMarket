const express = require('express');

const router = express.Router();

module.exports = (db) => {

  // Consultar departamentos
  router.get('/', (req, res) => {

    db.all(
      'SELECT code, nombre FROM departamentos ORDER BY nombre ASC',
      (err, rows) => {

        if (err) {
          console.error('Error al obtener departamentos:', err);

          return res.status(500).json({
            error: 'Error al obtener departamentos'
          });
        }

        res.json(rows);
      }
    );

  });

  return router;
};