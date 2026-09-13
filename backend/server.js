const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./carrito.db');

// Migración: Inicialización de la base de datos
db.serialize(() => {

  // Activar claves foráneas
  db.run("PRAGMA foreign_keys = ON");

  // =====================================================
  // 1. CREAR TABLA ESTADO
  // =====================================================
  db.run(`
    CREATE TABLE IF NOT EXISTS estado (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL
    )
  `, (err) => {

    if (err) {
      console.error("Error creando tabla estado:", err);
      return;
    }

    // Verificar estados
    db.get('SELECT COUNT(*) as count FROM estado', (err, row) => {

      if (err) {
        console.error("Error verificando estados:", err);
        return;
      }

      // Insertar estados si no existen
      if (row.count === 0) {

        db.run(`
          INSERT INTO estado (id, nombre)
          VALUES (1, 'Activo'), (2, 'Inactivo')
        `, (err) => {

          if (err) {
            console.error("Error insertando estados:", err);
            return;
          }

          console.log("Estados iniciales cargados.");

          crearUsuarios();
        });

      } else {
        crearUsuarios();
      }
    });
  });


  // =====================================================
  // 2. CREAR TABLA USUARIOS
  // =====================================================
  function crearUsuarios() {

    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        num_documento TEXT UNIQUE NOT NULL,
        correo TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'user',
        fecha_creacion TEXT DEFAULT (datetime('now', '-5 hours'))
      )
    `, (err) => {

      if (err) {
        console.error("Error creando tabla usuarios:", err);
        return;
      }

      // Verificar usuarios
      db.get('SELECT COUNT(*) as count FROM usuarios', (err, row) => {

        if (err) {
          console.error("Error verificando usuarios:", err);
          return;
        }

        if (row.count === 0) {

          const usuariosIniciales = [
            {
              id: 1,
              nombres: 'Jonatan Stiven',
              apellidos: 'Gutierrez Nieto',
              num_documento: '1003510994',
              correo: 'jonatangutierrez@invenfact.com',
              password: 'jonatan123',
              rol: 'admin',
              fecha_creacion: '2023-01-01 00:00:00'
            },
            {
              id: 2,
              nombres: 'Julian Emiro',
              apellidos: 'Gonzalez Perez',
              num_documento: '9876543210',
              correo: 'juliangonzalez@invenfact.com',
              password: 'julian123',
              rol: 'admin',
              fecha_creacion: '2023-01-01 00:00:00'
            },
            {
              id: 3,
              nombres: 'Pepito',
              apellidos: 'usuario',
              num_documento: '1234567890',
              correo: 'pepitousuario@invenfact.com',
              password: 'pepito123',
              rol: 'user',
              fecha_creacion: '2023-01-01 00:00:00'
            },
            {
              id: 4,
              nombres: 'Pepito',
              apellidos: 'vendedor',
              num_documento: '9876543220',
              correo: 'pepitovendedor@invenfact.com',
              password: 'pepito123',
              rol: 'vendedor',
              fecha_creacion: '2023-01-01 00:00:00'
            }
          ];

          const stmt = db.prepare(`
            INSERT INTO usuarios
            (
              id,
              nombres,
              apellidos,
              num_documento,
              correo,
              password,
              rol,
              fecha_creacion
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          usuariosIniciales.forEach(u => {

            stmt.run([
              u.id,
              u.nombres,
              u.apellidos,
              u.num_documento,
              u.correo,
              u.password,
              u.rol,
              u.fecha_creacion
            ], (err) => {

              if (err) {
                console.error(`Error insertando a ${u.correo}:`, err);
              }

            });

          });

          stmt.finalize((err) => {

            if (err) {
              console.error("Error finalizando usuarios:", err);
              return;
            }

            console.log("Usuarios iniciales cargados desde el array.");

            // IMPORTANTE:
            // Solo después de terminar los usuarios
            // se crean los productos.
            crearProductos();

          });

        } else {

          crearProductos();

        }

      });

    });

  }


  // =====================================================
  // 3. CREAR TABLA PRODUCTOS
  // =====================================================
  function crearProductos() {

    db.run(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        usuario_id INTEGER NOT NULL,
        estado_id INTEGER NOT NULL,
        precio REAL NOT NULL,
        imagen TEXT,
        stock INTEGER NOT NULL DEFAULT 10,
        etiqueta TEXT NOT NULL,
        categoria TEXT NOT NULL,

        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (estado_id) REFERENCES estado(id)
      )
    `, (err) => {

      if (err) {
        console.error("Error creando tabla productos:", err);
        return;
      }

      // Verificar productos
      db.get('SELECT COUNT(*) as count FROM productos', (err, row) => {

        if (err) {
          console.error("Error verificando productos:", err);
          return;
        }

        if (row.count === 0) {

          const stmt = db.prepare(`
            INSERT INTO productos
            (
              nombre,
              usuario_id,
              estado_id,
              precio,
              imagen,
              stock,
              etiqueta,
              categoria
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

            const productosEjemplo = [
              ['Tomates Orgánicos', 4, 1, 3500, '/images/Tomate-Chonto.png', 100, 'Fresco', 'Hortalizas'],
              ['Lechuga Hidropónica', 4, 1, 2000, '/images/Lechuga-Hidropónica.png', 80, 'Nuevo', 'Hortalizas'],
              ['Mango Azúcar', 4, 1, 1500, '/images/Mango-Azucar.png', 120, 'Oferta', 'Frutas'],
              ['Plátano Verde', 4, 1, 1200, '/images/Platano-Verde.png', 200, '', 'Frutas'],
              ['Papa Criolla', 4, 1, 2800, '/images/Papa-Criolla.png', 150, 'Fresco', 'Tubérculos'],
              ['Yuca Fresca', 4, 1, 2500, '/images/Yuca-Fresca.png', 90, '', 'Tubérculos'],
              ['Huevos de Campo (docena)', 4, 1, 4000, '/images/Huevos-de-Campo-(docena).png', 60, 'Nuevo', 'Proteína'],
              ['Queso Campesino', 4, 1, 5500, '/images/Queso-Campesino.png', 40, 'Oferta', 'Lácteos'],
              ['Leche Orgánica (litro)', 4, 1, 3000, '/images/Leche-Organica-(litro).png', 70, '', 'Lácteos'],
              ['Miel Artesanal', 4, 1, 6000, '/images/Miel-Artesanal.png', 30, 'Nuevo', 'Procesados Naturales'],
              ['Café Especial', 4, 1, 8500, '/images/Cafe-Especial.png', 50, '-10%', 'Procesados Naturales'],
              ['Aguacate Hass', 4, 1, 2200, '/images/Aguacate-Hass.png', 0, 'Fresco', 'Frutas'],
              ['Naranja Dulce', 4, 1, 1800, '/images/Naranja-Dulce.png', 120, '', 'Frutas'],
              ['Frijol Rojo', 4, 1, 3000, '/images/Frijol-rojo.png', 80, 'Nuevo', 'Granos'],
              ['Maíz Amarillo', 4, 1, 2500, '/images/Maiz-Amarillo.png', 90, '', 'Granos'],
            ];


          productosEjemplo.forEach(p => {

            stmt.run(
              p[0],
              p[1],
              p[2],
              p[3],
              p[4],
              p[5],
              p[6],
              p[7],
              (err) => {

                if (err) {
                  console.error(
                    'Error insertando producto:',
                    p[0],
                    err
                  );
                }

              }
            );

          });

          stmt.finalize((err) => {

            if (err) {
              console.error("Error finalizando productos:", err);
              return;
            }

            console.log("Productos iniciales cargados.");

          });

        }

      });

    });

  }

});

// =====================================================
// ENDPOINTS DE PRODUCTOS
// =====================================================

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

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
  db.all(
    'SELECT id, nombre, usuario_id, estado_id, precio, imagen, stock, etiqueta, categoria FROM productos',
    (err, rows) => {
      if (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Error al obtener productos' });
      }

      res.json(rows);
    }
  );
});

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
      u.apellidos AS vendedor_apellidos
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
// ENDPOINTS DE ESTADOS
// =====================================================

// Obtener todos los estados
app.get('/api/estados', (req, res) => {
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


// =====================================================
// ENDPOINTS DE AUTENTICACIÓN
// =====================================================

// Login
app.post('/api/login', (req, res) => {
  const { correo, password } = req.body;

  console.log('Intentando login con:', correo, password);

  db.get(
    'SELECT * FROM usuarios WHERE correo = ? AND password = ?',
    [correo, password],
    (err, user) => {
      if (err) {
        console.log('Error en la consulta:', err);
        return res.status(500).json({
          error: 'Error en el servidor'
        });
      }

      console.log('Usuario encontrado en callback:', user);

      if (!user) {
        return res.status(401).json({
          error: 'Credenciales incorrectas'
        });
      }

      console.log(
        `Login exitoso: ${user.nombres} ${user.apellidos}`
      );

      res.json({
        success: true,
        usuario: {
          id: user.id,
          nombres: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          rol: user.rol,
          fecha_creacion: user.fecha_creacion
        }
      });
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




// endpoint TEMPORAL para pruebas para poder ejecutar consultas al archivo sql3
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


// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});