const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./carrito.db');

const crearUsuarios = require('./db/crearUsuarios');
const crearProductos = require('./db/crearProductos');
const crearEstado = require('./db/crearEstado');
const crearVentas = require('./db/crearVentas');
const crearGeneros = require('./db/crearGenero');
const crearRoles = require('./db/crearRoles');
const crearContacto = require('./db/crearContacto');
const crearDepartamentos = require('./db/crearDepartamentos');
const crearMunicipios = require('./db/crearMunicipios');

// Migración: Inicialización de la base de datos
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");
  crearContacto(db, () => {
    crearEstado(db, () => {
      crearGeneros(db, () => {
        crearRoles(db, () => {
          crearDepartamentos(db, () => {
            crearMunicipios(db, () => {
              crearUsuarios(db, () => {
                crearProductos(db, () => {
                  crearVentas(db);
                });
              });
            });
          });
        });
      });
    });
  });
});

app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    console.log(`➡️ ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duracion}ms`);
    if (['POST', 'PUT'].includes(req.method)) {
      console.log('📦 Body:', req.body);
    }
  });
  next();
});

// =====================================================
// ENDPOINTS DE AUTENTICACIÓN
// =====================================================

  // Importar router de usuarios
  const usuariosRouter = require('./endpoints/usuarios.js')(db, bcrypt);
  app.use('/api', usuariosRouter);

// =====================================================
// ENDPOINTS DE ESTADOS
// =====================================================

  // Importar router de estados
  const estadosRouter = require('./endpoints/estados.js')(db);
  app.use('/api/estados', estadosRouter);

// =====================================================
// ENDPOINTS DE PRODUCTOS
// =====================================================

  // Importar router de productos
  const productosRouter = require('./endpoints/productos.js')(db);
  app.use('/api/productos', productosRouter);



// Obtener productos paginados con filtros
app.get('/api/productos/paginados', (req, res) => {
  const { page = 1, pageSize = 10, search = '', categoria = '' } = req.query;

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
        return res.status(500).json({ error: 'Error al contar productos' });
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
app.put('/api/productos/:id/stock', (req, res) => {
  const { cantidad } = req.body;

  db.run(
    'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?',
    [cantidad, req.params.id, cantidad],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: 'Error al actualizar stock'
        });
      }

      if (this.changes === 0) {
        return res.status(400).json({
          error: 'Stock insuficiente'
        });
      }

      res.json({ success: true });
    }
  );
});

// Actualizar estado de un producto
app.put('/api/productos/:id/estado', (req, res) => {
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

          res.json({ success: true });
        }
      );
    }
  );
});





// =====================================================
// ENDPOINTS DE USUARIOS
// =====================================================

// Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
  db.all(
    `SELECT 
      id,
      nombres,
      apellidos,
      num_documento,
      correo,
      password,
      rol,
      fecha_creacion
    FROM usuarios`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: 'Error al obtener usuarios'
        });
      }

      res.json({
        success: true,
        usuarios: rows
      });
    }
  );
});

// Obtener usuarios paginados y con búsqueda
app.get('/api/usuarios/paginados', (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    search = ''
  } = req.query;

  const pageInt = Math.max(1, parseInt(page));
  const pageSizeInt = Math.min(50, Math.max(1, parseInt(pageSize)));
  const offset = (pageInt - 1) * pageSizeInt;

  let sqlBase = `FROM usuarios WHERE 1=1`;
  const params = [];

  if (search) {
    sqlBase += `
      AND (
        nombres LIKE ?
        OR apellidos LIKE ?
        OR correo LIKE ?
      )
    `;

    params.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    );
  }

  const sqlCount = `
    SELECT COUNT(*) AS total
    ${sqlBase}
  `;

  const sqlData = `
    SELECT 
      id,
      nombres,
      apellidos,
      correo,
      rol,
      fecha_creacion
    ${sqlBase}
    ORDER BY nombres ASC
    LIMIT ? OFFSET ?
  `;

  db.get(sqlCount, params, (err, countRow) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    const total = countRow.total;

    db.all(
      sqlData,
      [...params, pageSizeInt, offset],
      (err, rows) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        res.json({
          usuarios: rows,
          total: total,
          page: pageInt,
          pageSize: pageSizeInt
        });
      }
    );
  });
});

// Eliminar usuario
app.delete('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM usuarios WHERE id = ? AND rol != "admin"',
    [id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: 'Error al eliminar usuario'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'Usuario no encontrado o es un Administrador protegido'
        });
      }

      res.json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
    }
  );
});

// Actualizar rol de usuario
app.put('/api/usuarios/:id/rol', (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!['admin', 'user'].includes(rol)) {
    return res.status(400).json({
      error: 'Rol no válido'
    });
  }

  db.run(
    'UPDATE usuarios SET rol = ? WHERE id = ?',
    [rol, id],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: 'Error al actualizar rol'
        });
      }

      res.json({ success: true });
    }
  );
});


// ====================================================
// ENDPOINT TEMPORAL , BORRAR EN PRODUCCION
// =====================================================


app.post('/api/sql', (req, res) => {
  const { sql, params = [] } = req.body;

  const esSelect = sql.trim().toUpperCase().startsWith('SELECT');

  if (esSelect) {
    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.run(sql, params, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changes: this.changes });
    });
  }
});

// fin del endpoint TEMPORAL


// =================================================
// ENDPOINTS MUNICIPIOS Y DEPARTAMENTOS
// ==================================================
app.get('/api/departamentos', (req, res) => {
  db.all('SELECT code, nombre FROM departamentos ORDER BY nombre ASC', (err, rows) => {
    if (err) {
      console.error('Error al obtener departamentos:', err);
      return res.status(500).json({ error: 'Error al obtener departamentos' });
    }
    res.json(rows);
  });
});

app.get('/api/municipios', (req, res) => {
  const { departamento } = req.query;

  if (departamento) {
    db.all(
      'SELECT code, nombre, departamento_code FROM municipios WHERE departamento_code = ? ORDER BY nombre ASC',
      [departamento],
      (err, rows) => {
        if (err) {
          console.error('Error al obtener municipios filtrados:', err);
          return res.status(500).json({ error: 'Error al obtener municipios' });
        }
        res.json(rows);
      }
    );
  } else {
    db.all(
      'SELECT code, nombre, departamento_code FROM municipios ORDER BY nombre ASC',
      (err, rows) => {
        if (err) {
          console.error('Error al obtener todos los municipios:', err);
          return res.status(500).json({ error: 'Error al obtener municipios' });
        }
        res.json(rows);
      }
    );
  }
});
// fin endpoint municipios y departamentos


// =================================================
// ENDPOINTS FACTURAS
// ==================================================
// estructura preliminar a llamado a factus

const FACTUS_API_URL = process.env.FACTUS_API_URL;



// FUNCIONES facturas

// la documentacion dice que necesita primero del access token
async function obtenerTokenFactus() {
  const bodyData = new URLSearchParams({
    grant_type: 'password',
    client_id: process.env.FACTUS_CLIENT_ID,       // todo este poco de variables deberia ir en .env del server
    client_secret: process.env.FACTUS_CLIENT_SECRET,
    username: process.env.FACTUS_USERNAME,
    password: process.env.FACTUS_PASSWORD
  });

  const response = await fetch(`${FACTUS_API_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyData.toString()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || data.message || 'Error autenticando en Factus');
  }
  return data.access_token;
}


// funcion guardan venta en bd 
function guardarVentaLocal(payloadFactus) {
  return new Promise((resolve, reject) => {
    const customer = payloadFactus.customer;

    // Extraer total desde el primer elemento de payment_details
    const totalFactura = Number(payloadFactus.payment_details[0].amount);

    const clienteDocumento = customer.identification;
    const clienteNombre = customer.names;
    const clienteEmail = customer.email;
    const clienteTelefono = customer.phone;

    const sqlVenta = `
      INSERT INTO ventas (
        cliente_documento,
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        reference_code,
        numbering_range_id,
        total
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const paramsVenta = [
      clienteDocumento,
      clienteNombre,
      clienteEmail,
      clienteTelefono,
      payloadFactus.reference_code,
      payloadFactus.numbering_range_id,
      totalFactura
    ];

    db.run(sqlVenta, paramsVenta, function (err) {
      if (err) return reject(err);

      const ventaId = this.lastID; //ultimo id de la bd


      const stmtDetalle = db.prepare(`
        INSERT INTO detalle_ventas (
          venta_id,
          producto_id,
          cantidad,
          precio_unitario,
          subtotal
        ) VALUES (?, ?, ?, ?, ?)
      `);

      payloadFactus.items.forEach(item => {
        // Extraer ID limpiando "PROD-X"
        const productoId = Number(item.code_reference.replace('PROD-', ''));
        const cantidadNum = Number(item.quantity);
        const precioNum = Number(item.price);
        const subtotal = cantidadNum * precioNum;

        stmtDetalle.run([ventaId, productoId, cantidadNum, precioNum, subtotal], (err) => {
          if (err) console.error(`Error guardando detalle del producto ${productoId}:`, err);
        });
      });

      stmtDetalle.finalize((err) => {
        if (err) return reject(err);
        resolve(ventaId);
      });
    });
  });
}





//endpoint
app.post('/api/facturas/finalizar-compra', async (req, res) => {
  const {
    customer,
    items,
    payment_details
  } = req.body;

  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cliente y productos son obligatorios' });
  }

  // datos carrito
  let totalFactura = 0;
  const itemsFactus = items.map((item) => {
    const precioNum = Number(item.precio);
    const cantidadNum = Number(item.cantidad);
    totalFactura += precioNum * cantidadNum;

    return {
      code_reference: `PROD-${item.id}`,
      name: item.nombre,
      quantity: cantidadNum.toFixed(2),
      discount_rate: "0.00",
      price: precioNum.toFixed(2),
      unit_measure_code: "94", // 94 = Unidad
      standard_code: "999",
      taxes: [{ is_excluded: true }]
    };
  });

  // mas datos que pide la api
  const payloadFactus = {
    reference_code: `FACT-${Date.now().toString().slice(-8)}`,
    document: "01",
    numbering_range_id: 389,
    operation_type: "10",
    observation: payment_details.observation || "",
    establishment: {
      name: "AgriMarket",
      address: "Calle 9 # 5-20",
      phone_number: "3000000000",
      email: "contacto@agrimarket.com",
      municipality_code: "25875",
    },
    payment_details: [
      {
        ...payment_details,
        reference_code: `PAGO-${Date.now().toString().slice(-6)}`,
        amount: totalFactura.toFixed(2)
      }
    ],
    cash_rounding_amount: "0.00",
    customer: customer,
    items: itemsFactus
  };

  try {
    // descontar stock
    for (const item of items) {
      const result = await new Promise((resolve, reject) => {
        db.run(
          'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.cantidad, item.id, item.cantidad],
          function (err) {
            if (err) return reject(err);
            resolve(this.changes);
          }
        );
      });

      if (result === 0) {
        return res.status(400).json({
          error: `Stock insuficiente para el producto con ID ${item.id}`
        });
      }
    }
    // guardar venta
    const ventaIdLocal = await guardarVentaLocal(payloadFactus);

    const token = await obtenerTokenFactus();
    const responseFactus = await fetch(`${FACTUS_API_URL}/v2/bills/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payloadFactus)
    });

    const dataFactus = await responseFactus.json();

    // actualizar el cufe y bill_number devueltos por Factus en la DB
    db.run('UPDATE ventas SET bill_number = ?, cufe = ? WHERE id = ?', [dataFactus.data.number, dataFactus.data.cufe, ventaIdLocal]);


    if (!responseFactus.ok) {
      return res.status(400).json({
        error: 'Factus rechazó la validación',
        detalles: dataFactus
      });
    }

    res.json({
      success: true,
      factura: dataFactus.data,
      // payload: payloadFactus,
    });

  } catch (error) {
    console.error('Error procesando compra:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor al emitir la factura',
      detalles: error.message
    });
  }
});
// fin de llamado factus














// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});