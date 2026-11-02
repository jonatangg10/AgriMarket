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

// =====================================================
  // OBTENER LAS VENTAS ESPECÍFICAS DE UN PRODUCTOR
  // =====================================================

  router.get('/productor/:usuario_id', (req, res) => {
    const { usuario_id } = req.params;

    // Esta consulta trae los datos principales de la venta, pero SOLO si en esa 
    // venta se vendió al menos un producto que le pertenece al usuario_id indicado.
    const sqlVentasProductor = `
      SELECT DISTINCT
        v.id,
        v.cliente_documento,
        v.cliente_nombre,
        v.cliente_email,
        v.cliente_telefono,
        v.reference_code,
        v.cufe,
        v.total,
        v.estado,
        v.fecha_creacion
      FROM ventas v
      JOIN detalle_ventas dv ON v.id = dv.venta_id
      JOIN productos p ON dv.producto_id = p.id
      WHERE p.usuario_id = ?
      ORDER BY v.id DESC
    `;

    db.all(sqlVentasProductor, [usuario_id], (err, ventas) => {
      if (err) {
        console.error('Error obteniendo ventas del productor:', err);
        return res.status(500).json({ error: 'Error al obtener las ventas del productor' });
      }

      if (ventas.length === 0) {
        return res.json([]); // Si no tiene ventas, devolvemos un array vacío
      }

      // Si el productor sí tiene ventas, necesitamos buscar los detalles 
      // de cada venta para mostrar qué productos específicos de ÉL se vendieron.
      const ventasIds = ventas.map(v => v.id);
      
      // armamos la consulta para traer los detalles, filtrando también por el productor
      // porque en una misma venta el cliente pudo comprar un huevo de él y una yuca de otro.
      const placeholders = ventasIds.map(() => '?').join(',');
      const sqlDetalles = `
        SELECT
          dv.id AS detalle_id,
          dv.venta_id,
          dv.producto_id,
          p.nombre AS producto,
          dv.cantidad,
          dv.precio_unitario,
          dv.subtotal,
          dv.estado_venta_id, /* Por si ya tienes la columna estado_venta_id aquí */
          ev.estado AS estado_pedido
        FROM detalle_ventas dv
        JOIN productos p ON p.id = dv.producto_id
        LEFT JOIN estado_venta ev ON dv.estado_venta_id = ev.id
        WHERE dv.venta_id IN (${placeholders}) AND p.usuario_id = ?
      `;

      // Los parámetros son todos los IDs de las ventas + el ID del productor al final
      const params = [...ventasIds, usuario_id];

      db.all(sqlDetalles, params, (err, detalles) => {
        if (err) {
          console.error('Error obteniendo detalles del productor:', err);
          return res.status(500).json({ error: 'Error al obtener los detalles' });
        }

        // Finalmente, unimos las ventas con sus respectivos detalles
        const ventasCompletas = ventas.map(venta => {
          return {
            ...venta,
            detalles_productor: detalles.filter(d => d.venta_id === venta.id)
          };
        });

        res.json(ventasCompletas);
      });
    });
  });




  // =====================================================
  // ACTUALIZAR ESTADO DE UN DETALLE (Y DE LA VENTA GENERAL SI APLICA)
  // =====================================================

  router.put('/detalle/:detalle_id/estado', (req, res) => {
    const { detalle_id } = req.params;
    const { estado_venta_id } = req.body; 

    if (!estado_venta_id) {
      return res.status(400).json({ error: 'Se requiere estado_venta_id' });
    }

    // primero Saber a que venta general pertenece este detalle
    db.get('SELECT venta_id FROM detalle_ventas WHERE id = ?', [detalle_id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Error al consultar el detalle' });
      if (!row) return res.status(404).json({ error: 'Detalle de venta no encontrado' });

      const ventaId = row.venta_id;

      // actualizar el estado en el detalle específico
      db.run('UPDATE detalle_ventas SET estado_venta_id = ? WHERE id = ?', [estado_venta_id, detalle_id], function(err) {
        if (err) return res.status(500).json({ error: 'Error al actualizar el detalle' });

        // revisar todos los estados de esta venta
        // usamos DISTINCT. Si el resultado es 1 sola fila, significa que TODOS los detalles tienen el mismo estado
        db.all('SELECT DISTINCT estado_venta_id FROM detalle_ventas WHERE venta_id = ?', [ventaId], (err, estadosDistintos) => {
          if (err) return res.status(500).json({ error: 'Error al verificar estados generales' });

          // si hay exactamente 1 estado diferente y no es nulo, todos los vendedores coinciden
          if (estadosDistintos.length === 1 && estadosDistintos[0].estado_venta_id !== null) {
            
            // actualizamos el estado de la tabla principal 'ventas' usando el ID directamente
            db.run('UPDATE ventas SET estado_id = ? WHERE id = ?', [estado_venta_id, ventaId], (err) => {
              if (err) console.error('Error al actualizar venta general');
              return res.json({ 
                success: true, 
                message: `Detalle actualizado. Venta general sincronizada con el estado ID: ${estado_venta_id}` 
              });
            });
            
          } else {
            // Si los vendedores tienen estados diferentes (ej: uno Pendiente y otro Enviado),
            // solo respondemos éxito por el detalle, sin tocar la venta general.
            return res.json({ 
              success: true, 
              message: 'Estado del producto actualizado correctamente. Venta general sin cambios.' 
            });
          }
        });
      });
    });
  });



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