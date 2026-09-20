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

  // Obtener productos paginados
  router.get('/paginados', (req, res) => {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      categoria = ''
    } = req.query;

    const pageInt = Math.max(1, parseInt(page));
    const pageSizeInt = Math.min(50, Math.max(1, parseInt(pageSize)));
    const offset = (pageInt - 1) * pageSizeInt;

    let sql = `
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.imagen,
        p.stock,
        p.etiqueta,
        p.categoria,
        e.nombre AS estado,
        u.nombres AS vendedor_nombres,
        u.apellidos AS vendedor_apellidos,
        u.genero_id AS vendedor_genero_id
      FROM productos p
      JOIN estado e ON p.estado_id = e.id
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.estado_id = 1
    `;

    const params = [];

    if (search) {
      sql += ' AND p.nombre LIKE ?';
      params.push(`%${search}%`);
    }

    if (categoria) {
      sql += ' AND p.categoria = ?';
      params.push(categoria);
    }

    const sqlPaginada = `${sql} ORDER BY p.nombre LIMIT ? OFFSET ?`;
    const sqlCount = `SELECT COUNT(*) AS total FROM (${sql})`;

    db.serialize(() => {
      db.get(sqlCount, params, (err, countRow) => {
        if (err) {
          console.error('Error en conteo:', err);

          return res.status(500).json({
            error: 'Error al contar productos'
          });
        }

        const total = countRow.total;

        db.all(
          sqlPaginada,
          [...params, pageSizeInt, offset],
          (err, rows) => {
            if (err) {
              console.error('Error en consulta paginada:', err);

              return res.status(500).json({
                error: 'Error al obtener productos'
              });
            }

            res.json({
              productos: rows,
              total: total,
              page: pageInt,
              pageSize: pageSizeInt,
              totalPages: Math.ceil(total / pageSizeInt)
            });
          }
        );
      });
    });
  });

  // Actualizar stock al comprar
  router.put('/:id/stock', (req, res) => {
    const { cantidad } = req.body;
    const { id } = req.params;

    db.run(
      'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [cantidad, id, cantidad],
      function (err) {
        if (err) {
          console.error('Error al actualizar stock:', err);

          return res.status(500).json({
            error: 'Error al actualizar stock'
          });
        }

        if (this.changes === 0) {
          return res.status(400).json({
            error: 'Stock insuficiente'
          });
        }

        res.json({
          success: true
        });
      }
    );
  });

  // Actualizar estado de un producto
  router.put('/:id/estado', (req, res) => {
    const { estado_id } = req.body;
    const productoId = req.params.id;
  
    if (!estado_id) {
      return res.status(400).json({
        error: 'Se requiere estado_id'
      });
    }
  
    // Verificar que el estado exista
    db.get(
      'SELECT id FROM estado WHERE id = ?',
      [estado_id],
      (err, row) => {
        if (err) {
          console.error('Error al consultar estado:', err);
        
          return res.status(500).json({
            error: 'Error al verificar estado'
          });
        }
      
        if (!row) {
          return res.status(400).json({
            error: 'El estado_id no existe'
          });
        }
      
        // Actualizar estado
        db.run(
          'UPDATE productos SET estado_id = ? WHERE id = ?',
          [estado_id, productoId],
          function (err) {
            if (err) {
              console.error('Error al actualizar estado:', err);
            
              return res.status(500).json({
                error: 'Error al actualizar estado'
              });
            }
          
            if (this.changes === 0) {
              return res.status(404).json({
                error: 'Producto no encontrado'
              });
            }
          
            res.json({
              success: true
            });
          }
        );
      }
    );
  });

  return router;
};