const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Obtener todos los estados
  router.get('/', (req, res) => {
    db.all(
      'SELECT id, nombre FROM estado',
      (err, rows) => {
        if (err) {
          console.error('Error al obtener estados:', err);

          return res.status(500).json({
            error: 'Error al obtener estados'
          });
        }

        res.json(rows);
      }
    );
  });

  // Obtener estado por ID
  router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.get(
      'SELECT id, nombre FROM estado WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          console.error('Error al obtener estado:', err);

          return res.status(500).json({
            error: 'Error al obtener estado'
          });
        }

        if (!row) {
          return res.status(404).json({
            error: 'Estado no encontrado'
          });
        }

        res.json(row);
      }
    );
  });

  return router;
};