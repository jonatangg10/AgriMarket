const express = require('express');

const router = express.Router();

module.exports = (db) => {

  // Consultar municipios
  router.get('/', (req, res) => {

    const { departamento } = req.query;

    if (departamento) {

      db.all(
        `
        SELECT
          code,
          nombre,
          departamento_code
        FROM municipios
        WHERE departamento_code = ?
        ORDER BY nombre ASC
        `,
        [departamento],
        (err, rows) => {

          if (err) {
            console.error(
              'Error al obtener municipios filtrados:',
              err
            );

            return res.status(500).json({
              error: 'Error al obtener municipios'
            });
          }

          res.json(rows);
        }
      );

    } else {

      db.all(
        `
        SELECT
          code,
          nombre,
          departamento_code
        FROM municipios
        ORDER BY nombre ASC
        `,
        (err, rows) => {

          if (err) {
            console.error(
              'Error al obtener todos los municipios:',
              err
            );

            return res.status(500).json({
              error: 'Error al obtener municipios'
            });
          }

          res.json(rows);
        }
      );

    }

  });

  return router;
};