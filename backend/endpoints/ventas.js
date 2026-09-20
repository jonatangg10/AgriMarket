const express = require('express');
const router = express.Router();

module.exports = (db) => {

  router.get('/', (req, res) => {

    const sql = `
      SELECT
        id,
        cliente_documento,
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        reference_code,
        numbering_range_id,
        bill_number,
        cufe,
        qr_url,
        total,
        estado,
        fecha_creacion
      FROM ventas
      ORDER BY id DESC
    `;

    db.all(sql, [], (err, rows) => {

      if (err) {
        console.error('Error obteniendo ventas:', err);

        return res.status(500).json({
          error: 'Error al obtener las ventas'
        });
      }

      res.json(rows);
    });
  });
  // OBTENER UNA VENTA POR ID
  // =====================================================

  router.get('/:id', (req, res) => {

    const { id } = req.params;

    const sqlVenta = `
      SELECT
        id,
        cliente_documento,
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        reference_code,
        numbering_range_id,
        bill_number,
        cufe,
        qr_url,
        total,
        estado,
        fecha_creacion
      FROM ventas
      WHERE id = ?
    `;

    db.get(sqlVenta, [id], (err, venta) => {

      if (err) {
        console.error('Error obteniendo venta:', err);

        return res.status(500).json({
          error: 'Error al obtener la venta'
        });
      }

      if (!venta) {
        return res.status(404).json({
          error: 'Venta no encontrada'
        });
      }


      // Obtener detalle de la venta
      const sqlDetalle = `
        SELECT
          dv.id,
          dv.producto_id,
          p.nombre AS producto,
          dv.cantidad,
          dv.precio_unitario,
          dv.subtotal
        FROM detalle_ventas dv
        LEFT JOIN productos p
          ON p.id = dv.producto_id
        WHERE dv.venta_id = ?
      `;

      db.all(sqlDetalle, [id], (err, detalle) => {

        if (err) {
          console.error(
            'Error obteniendo detalle de venta:',
            err
          );

          return res.status(500).json({
            error: 'Error al obtener el detalle de la venta'
          });
        }

        res.json({
          ...venta,
          detalle
        });

      });

    });
  });


  return router;
};