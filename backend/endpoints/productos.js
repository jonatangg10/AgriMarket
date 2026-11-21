const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para guardar imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './public/uploads';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true }); // Crea la carpeta si no existe
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });



// Mantener sincronizado con frontend/src/utils/unidades.js
const UNIDADES_VALIDAS = ['kg', 'lb', 'unidad', 'docena', 'litro', 'frasco', 'paquete', 'atado', 'canastilla', 'bulto'];
const normalizarUnidad = (u) => (UNIDADES_VALIDAS.includes(String(u || '').trim()) ? String(u).trim() : 'kg');

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
        categoria,
        municipio_code,
        unidad
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
      categoria = '',
      usuario_id = '',
      estado_id = '',
      stock = '',
      precio_min = '',
      precio_max = '',
      sort_by = 'nombre',
      sort_dir = 'asc'
    } = req.query;

    // Lista blanca de columnas ordenables (evita inyección SQL en ORDER BY)
    const columnasOrden = {
      id: 'p.id',
      nombre: 'p.nombre',
      precio: 'p.precio',
      stock: 'p.stock',
      categoria: 'p.categoria',
      estado_id: 'p.estado_id'
    };
    const columnaOrden = columnasOrden[sort_by] || 'p.nombre';
    const direccionOrden = String(sort_dir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

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
        p.unidad,
        p.usuario_id,
        p.estado_id,
        e.nombre AS estado,
        u.nombres AS vendedor_nombres,
        u.apellidos AS vendedor_apellidos,
        u.genero_id AS vendedor_genero_id,
        m.nombre AS municipio_nombre,
        m.code AS municipio_code,
        m.departamento_code AS municipio_departamento_code,
        p.estado_id AS estado_id
      FROM productos p
      JOIN estado e ON p.estado_id = e.id
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN municipios m ON p.municipio_code = m.code
      WHERE (p.estado_id = 1 OR p.estado_id = 2)
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
    
    if (usuario_id) {
      sql += ' AND p.usuario_id = ?';
      params.push(usuario_id);
    }

    if (estado_id) {
      sql += ' AND p.estado_id = ?';
      params.push(estado_id);
    }

    // stock: agotado (0), bajo (1-4), disponible (5+)
    if (stock === 'agotado') {
      sql += ' AND p.stock <= 0';
    } else if (stock === 'bajo') {
      sql += ' AND p.stock > 0 AND p.stock < 5';
    } else if (stock === 'disponible') {
      sql += ' AND p.stock >= 5';
    }

    if (precio_min !== '' && !isNaN(Number(precio_min))) {
      sql += ' AND p.precio >= ?';
      params.push(Number(precio_min));
    }

    if (precio_max !== '' && !isNaN(Number(precio_max))) {
      sql += ' AND p.precio <= ?';
      params.push(Number(precio_max));
    }

    const sqlPaginada = `${sql} ORDER BY ${columnaOrden} ${direccionOrden}, p.id ASC LIMIT ? OFFSET ?`;
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


  // ==========================================
  // ENDPOINTS ADMIN (CRUD CON IMÁGENES)
  // ==========================================

  // CREAR PRODUCTO
  router.post('/', upload.single('imagen'), (req, res) => {
    const { nombre, usuario_id, estado_id, precio, stock, etiqueta, categoria, municipio_code, unidad } = req.body;
    
    // Si multer subió un archivo, guardamos la ruta. Si no, vacío.
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // Convertimos los valores de texto a números reales, porque form data al parecer pasa todos a string
    const precioNum = parseFloat(precio);
    const estadoIdNum = parseInt(estado_id, 10);
    const usuarioIdNum = parseInt(usuario_id, 10);
    // El código de municipio es texto ("05313"): parseInt le quitaba el 0 inicial
    const municipioCode = String(municipio_code || '').trim();
    const unidadFinal = normalizarUnidad(unidad);

    // Si el stock viene vacío o indefinido, usamos 10 por defecto
    const stockNum = stock ? parseInt(stock, 10) : 10;

    //  Validamos asegurándonos de que los números sean válidos 
    if (!nombre || isNaN(usuarioIdNum) || isNaN(estadoIdNum) || isNaN(precioNum) || !etiqueta || !categoria) {
      return res.status(400).json({ error: 'Faltan campos obligatorios o tienen formato inválido' });
    }

    const sql = `
      INSERT INTO productos (nombre, usuario_id, estado_id, precio, imagen, stock, etiqueta, categoria, municipio_code, unidad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Pasamos las variables numéricas ya parseadas a los parámetros de SQLite
    const params = [
      nombre, usuarioIdNum, estadoIdNum, precioNum, imagenUrl, 
      stockNum, etiqueta, categoria, municipioCode, unidadFinal
    ];

    db.run(sql, params, function (err) {
      if (err) return res.status(500).json({ error: 'Error al crear producto' });
      res.status(201).json({ success: true, id: this.lastID, imagen: imagenUrl });
    });
  });

  // EDITAR PRODUCTO
  router.put('/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    const { nombre, usuario_id, estado_id, precio, stock, etiqueta, categoria, imagenExistente, municipio_code, unidad } = req.body;

    // Convertimos los valores
    const precioNum = parseFloat(precio);
    const estadoIdNum = parseInt(estado_id, 10);
    const usuarioIdNum = parseInt(usuario_id, 10);
    const stockNum = stock ? parseInt(stock, 10) : 10;
    const municipioCode = String(municipio_code || '').trim();
    const unidadFinal = normalizarUnidad(unidad);

    if (!nombre || isNaN(usuarioIdNum) || isNaN(estadoIdNum) || isNaN(precioNum) || !etiqueta || !categoria) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para actualizar' });
    }

    const imagenFinal = req.file ? `/uploads/${req.file.filename}` : (imagenExistente || '');

    const sql = `
      UPDATE productos 
      SET nombre = ?, usuario_id = ?, estado_id = ?, precio = ?, imagen = ?, stock = ?, etiqueta = ?, categoria = ?, municipio_code = ?, unidad = ?
      WHERE id = ?
    `;

    // Pasamos las variables numéricas 
    const params = [
      nombre, usuarioIdNum, estadoIdNum, precioNum, imagenFinal, 
      stockNum, etiqueta, categoria, municipioCode, unidadFinal, parseInt(id, 10)
    ];

    db.run(sql, params, function (err) {
      if (err) return res.status(500).json({ error: 'Error al actualizar producto' });
      res.json({ success: true, imagen: imagenFinal });
    });
  });

  // ELIMINAR PRODUCTO
  router.delete('/:id', (req, res) => {
    db.run('DELETE FROM productos WHERE id = ?', [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: 'Error al eliminar producto' });
      res.json({ success: true });
    });
  });

  return router;
};