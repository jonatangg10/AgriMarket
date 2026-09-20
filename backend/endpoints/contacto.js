const express = require('express');

const router = express.Router();

module.exports = (db) => {

  // ==========================================
  // GUARDAR CONTACTO
  // ==========================================

  router.post('/contacto', (req, res) => {

    const {
      nombres,
      apellidos,
      correo,
      mensaje,
      acepta_politicas
    } = req.body;

    if (!nombres || !apellidos || !correo || !mensaje) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    if (!acepta_politicas) {
      return res.status(400).json({
        mensaje: 'Debe aceptar las políticas de privacidad'
      });
    }

    const sql = `
      INSERT INTO contacto (
        nombres,
        apellidos,
        correo,
        mensaje,
        acepta_politicas
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        nombres,
        apellidos,
        correo,
        mensaje,
        1
      ],
      function (err) {

        if (err) {
          console.error('Error guardando contacto:', err);

          return res.status(500).json({
            mensaje: 'Error al guardar el contacto'
          });
        }

        res.status(201).json({
          mensaje: 'Mensaje enviado correctamente',
          id: this.lastID
        });

      }
    );

  });


  // ==========================================
  // CONSULTAR CONTACTOS
  // ==========================================

  router.get('/contacto', (req, res) => {

    const sql = `
      SELECT
        id,
        nombres,
        apellidos,
        correo,
        mensaje,
        acepta_politicas,
        fecha_creacion
      FROM contacto
      ORDER BY id DESC
    `;

    db.all(sql, [], (err, rows) => {

      if (err) {
        console.error('Error consultando contactos:', err);

        return res.status(500).json({
          mensaje: 'Error al consultar los contactos'
        });
      }

      res.json(rows);

    });

  });

  return router;
};