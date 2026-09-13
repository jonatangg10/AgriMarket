const express = require('express');
const cors = require('cors');
// const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'agrimarket-bd-agrimarket.f.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_2ny60Pyuu3nDSaHOpW5',
  database: 'defaultdb',
  port: 19274,
  ssl: {
    rejectUnauthorized: false
  }
});

// Migración: Actualizar tabla productos
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// 1. Crear tabla estado primero
db.query(`
    CREATE TABLE IF NOT EXISTS estado (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nombre TEXT NOT NULL
    )
  `);
// Crear tabla usuarios
db.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nombres TEXT NOT NULL,
      apellidos TEXT NOT NULL,
      correo VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rol VARCHAR(20) NOT NULL DEFAULT 'user',
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

// 2. Insertar estados si no existen
db.query('SELECT COUNT(*) as count FROM estado', (err, row) => {
  if (err) console.error(err);
  if (row[0].count === 0) {
    db.query(`INSERT INTO estado (nombre) VALUES ('Activo'), ('Inactivo')`, (err) => {
      if (err) console.error(err);
    });
  }

  db.query('SELECT COUNT(*) as count FROM usuarios', (err, row) => {
    if (err) {
      console.error("Error al verificar usuarios:", err);
      return;
    }

    if (row[0].count === 0) {
      const usuariosIniciales = [
        {
          nombres: 'Jonatan Stiven',
          apellidos: 'Gutierrez Nieto',
          correo: 'jonatan@invenfact.com',
          password: 'jonatan123',
          rol: 'admin'
        },
        {
          nombres: 'Diana Toquica',
          apellidos: 'Invitado',
          correo: 'diana@invenfact.com',
          password: 'diana123',
          rol: 'user'
        }
      ];

      const stmt = `INSERT INTO usuarios (nombres, apellidos, correo, password, rol) VALUES (?, ?, ?, ?, ?)`;

      usuariosIniciales.forEach(u => {
        db.query(stmt, [u.nombres, u.apellidos, u.correo, u.password, u.rol], (err) => {
          if (err) console.error(`Error insertando a ${u.correo}:`, err);
        });
      });

     
    }
  });

  // 3. Crear tabla productos después que estado existe
  db.query(`CREATE TABLE IF NOT EXISTS productos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nombre TEXT NOT NULL,
      estado_id INT NOT NULL,
      precio REAL NOT NULL,
      imagen TEXT,
      stock INT NOT NULL DEFAULT 10,
      etiqueta TEXT NOT NULL,
      categoria TEXT NOT NULL,
      FOREIGN KEY (estado_id) REFERENCES estado(id)
    )`, (err) => {
    if (err) console.error(err);

    // 4. Verificar si necesitamos insertar datos de ejemplo
    db.query('SELECT COUNT(*) as count FROM productos', (err, row) => {
      if (err) console.error(err);
      if (row[0].count === 0) {
        const stmt = `INSERT INTO productos (nombre, estado_id, precio, imagen, stock, etiqueta, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const productosEjemplo = [
          ['Camiseta Android Studio', 1, 29.99, '/images/camisaandroidstudio.jpg', 15, 'Nuevo', 'Android Dev'],
          ['Taza Kotlin', 1, 12.50, '/images/tazakotlin.jpg', 8, '-10%', 'Android Dev'],
          ['Gorra MongoDB', 1, 19.00, '/images/gorramongodb.jpg', 20, '', 'Bases de Datos'],
          ['Sticker PostgreSQL', 1, 3.99, '/images/CSS.jpeg', 50, 'Nuevo', 'Bases de Datos'],
          ['Camiseta AWS', 1, 34.99, '/images/camisaaws.jpg', 18, '-15%', 'Cloud Computing'],
          ['Gorra Azure', 1, 22.00, '/images/Gorra Node.jpg', 15, '', 'Cloud Computing'],
          ['Taza Docker', 1, 16.50, '/images/tazadocker.png', 25, 'Nuevo', 'Contenedores'],
          ['Gorra Kubernetes', 1, 23.99, '/images/gorrakubernetes.jpg', 12, '-20%', 'Orquestación'],
          ['Gorra Python', 1, 21.99, '/images/gorrapython.jpg', 15, '', 'Data Science'],
          ['Taza Pandas', 1, 15.75, '/images/Taza JavaScript.jpeg', 22, 'Nuevo', 'Data Science'],
          ['Camiseta React', 1, 28.99, '/images/react.jpeg', 25, '-10%', 'Desarrollo Web'],
          ['Sticker JavaScript', 1, 3.25, '/images/CSS.jpeg', 60, '', 'Desarrollo Web'],
          ['Tableta Gráfica', 1, 89.99, '/images/php.jpg', 8, 'Oferta', 'Diseño Gráfico'],
          ['Poster Tipografía', 1, 12.99, '/images/sql.jpg', 30, 'Nuevo', 'Diseño Gráfico'],
          ['Mousepad Figma', 1, 19.99, '/images/react.jpeg', 15, '', 'Diseño UI/UX'],
          ['Taza Adobe XD', 1, 14.50, '/images/Taza JavaScript.jpeg', 20, 'Nuevo', 'Diseño UI/UX'],
          ['Camiseta CSS', 1, 24.99, '/images/camisacss.jpg', 18, 'Nuevo', 'Frontend'],
          ['Camiseta TensorFlow', 1, 32.99, '/images/php.jpg', 12, '-20%', 'Inteligencia Artificial'],
          ['Gorra ChatGPT', 1, 25.99, '/images/gorrachatgpt.jpg', 15, '', 'Inteligencia Artificial'],
          ['Taza GPT-4', 1, 18.99, '/images/Taza JavaScript.jpeg', 18, '', 'LLMs'],
          ['Camiseta Bard', 1, 29.99, '/images/Gorra Node.jpg', 10, 'Nuevo', 'LLMs'],
          ['Libro ML', 1, 22.99, '/images/php.jpg', 12, '-15%', 'Machine Learning'],
          ['Sticker Scikit', 1, 3.75, '/images/sql.jpg', 35, '', 'Machine Learning'],
          ['Camiseta Kubernetes', 1, 31.99, '/images/camisakubernetes.png', 10, '-20%', 'Orquestación'],
          ['Gorra Docker Swarm', 1, 23.99, '/images/gorradocker.jpg', 12, '', 'Contenedores'],
          ['Taza "Hello World"', 1, 11.99, '/images/Gorra Node.jpg', 30, 'Oferta', 'Programación'],
          ['Camiseta Código', 1, 26.99, '/images/php.jpg', 18, 'Nuevo', 'Programación'],
          ['Camiseta TCP/IP', 1, 28.99, '/images/CSS.jpeg', 12, '-15%', 'Redes'],
          ['Taza Firewall', 1, 16.99, '/images/tazafirewall.jpg', 20, '', 'Redes'],
          ['Taza Cloud', 1, 15.99, '/images/tazacloud.jpg', 25, '', 'Servicios Cloud'],
          ['Gorra Serverless', 1, 22.99, '/images/gorraserverless.jpg', 15, 'Nuevo', 'Servicios Cloud'],
          ['Camiseta NGINX', 1, 27.99, '/images/camisanginex.jpg', 12, '-10%', 'Servidores'],
          ['Sticker Apache', 1, 3.50, '/images/stikerapache.png', 40, '', 'Servidores']
        ];

        productosEjemplo.forEach(p => {
          db.query(stmt, p, (err) => {
            if (err) console.error('Error insertando:', p[0], err);
          });
        });

      }
    });
  });
});


// Endpoint para obtener productos con stock
app.get('/api/productos', (req, res) => {
  db.query('SELECT id, nombre, estado_id, precio, imagen, stock, etiqueta, categoria FROM productos', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Error al obtener productos' });
    }
    res.json(rows);
  });
});

// Endpoint para actualizar stock al comprar
app.put('/api/productos/:id/stock', (req, res) => {
  const { cantidad } = req.body;
  db.query(
    'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?',
    [cantidad, req.params.id, cantidad],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar stock' });
      }
      if (this.changes === 0) {
        return res.status(400).json({ error: 'Stock insuficiente' });
      }
      res.json({ success: true });
    }
  );
});

// Endpoint para obtener todos los estados
app.get('/api/estados', (req, res) => {
  db.query('SELECT id, nombre FROM estado', (err, rows) => {
    if (err) {
      console.error('Error al obtener estados:', err);
      return res.status(500).json({ error: 'Error al obtener estados' });
    }
    res.json(rows);
  });
});


// Endpoint para actualizar el estado de un producto
app.put('/api/productos/:id/estado', (req, res) => {
  const { estado_id } = req.body;
  const productoId = req.params.id;
  console.log("edit estado")

  if (!estado_id) {
    return res.status(400).json({ error: 'Se requiere estado_id' });
  }

  // Verificar si el estado existe
  db.query('SELECT id FROM estado WHERE id = ?', [estado_id], (err, row) => {
    if (err) {
      console.error('Error al consultar estado:', err);
      return res.status(500).json({ error: 'Error al verificar estado' });
    }

    if (!row) {
      return res.status(400).json({ error: 'El estado_id no existe' });
    }

    // Actualizar estado del producto
    db.query(
      'UPDATE productos SET estado_id = ? WHERE id = ?',
      [estado_id, productoId],
      function (err) {
        if (err) {
          console.error('Error al actualizar estado:', err);
          return res.status(500).json({ error: 'Error al actualizar estado' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ success: true });
      }
    );
  });
});

// Endpoint para obtener productos paginados con filtros
app.get('/api/productos/paginados', (req, res) => {
  const { page = 1, pageSize = 10, search = '', categoria = '' } = req.query;
  const offset = (page - 1) * pageSize;

  // Validar parámetros
  const pageInt = Math.max(1, parseInt(page));
  const pageSizeInt = Math.min(50, Math.max(1, parseInt(pageSize)));

  // Construir consulta base
  let sql = `
    SELECT p.id, p.nombre, p.precio, p.imagen, p.stock, 
           p.etiqueta, p.categoria, e.nombre as estado
    FROM productos p
    JOIN estado e ON p.estado_id = e.id
    WHERE p.estado_id = 1  -- Solo productos activos (comentario SQL válido)
  `;

  const params = [];

  // Aplicar filtros
  if (search) {
    sql += ' AND p.nombre LIKE ?';
    params.push(`%${search}%`);
  }

  if (categoria) {
    sql += ' AND p.categoria = ?';
    params.push(categoria);
  }

  // Consulta para los datos paginados
  const sqlPaginada = `${sql} ORDER BY p.nombre LIMIT ? OFFSET ?`;

  // Consulta para el conteo total (CON filtros para precisión)
  const sqlCount = `SELECT COUNT(*) as total FROM (${sql}) AS sub`;

  db.query(sqlCount, params, (err, countRow) => {
    if (err) {
      console.error('Error en conteo:', err);
      return res.status(500).json({ error: 'Error al contar productos' });
    }

    const total = countRow[0].total;

    // Luego obtener los datos paginados
    db.query(sqlPaginada, [...params, pageSizeInt, offset], (err, rows) => {
      if (err) {
        console.error('Error en consulta paginada:', {
          error: err,
          query: sqlPaginada,
          params: [...params, pageSizeInt, offset]
        });
        return res.status(500).json({ error: 'Error al obtener productos' });
      }

      res.json({
        productos: rows,
        total: total,
        page: pageInt,
        pageSize: pageSizeInt,
        totalPages: Math.ceil(total / pageSizeInt)
      });
    });
  });

});

app.post('/api/login', (req, res) => {
  const { correo, password } = req.body;
  console.log('Intentando login con:', correo, password);
  db.query(
    'SELECT * FROM usuarios WHERE correo = ? AND password = ?',
    [correo, password],
    (err, user) => {
      if (err) {
        console.log('Error en la consulta:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      console.log('Usuario encontrado en callback:', user[0]);

      if (!user[0]) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      console.log(`Login exitoso: ${user[0].nombres} ${user[0].apellidos}`);

      res.json({
        success: true,
        usuario: {
          id: user[0].id,
          nombres: user[0].nombres,
          apellidos: user[0].apellidos,
          correo: user[0].correo,
          rol: user[0].rol,
          fecha_creacion: user[0].fecha_creacion
        }
      });
    }
  );
});

app.get('/api/usuarios', (req, res) => {
  db.query(
    'SELECT id, nombres, apellidos, correo, rol, fecha_creacion FROM usuarios',
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener usuarios' });
      }
      res.json({ success: true, usuarios: rows });
    }
  );
});

// Endpoint para obtener usuarios paginados y con búsqueda
app.get('/api/usuarios/paginados', (req, res) => {
  const { page = 1, pageSize = 10, search = '' } = req.query;
  const offset = (page - 1) * pageSize;

  const pageInt = Math.max(1, parseInt(page));
  const pageSizeInt = Math.min(50, Math.max(1, parseInt(pageSize)));

  let sqlBase = `FROM usuarios WHERE 1=1`;
  const params = [];

  if (search) {
    sqlBase += ` AND (nombres LIKE ? OR apellidos LIKE ? OR correo LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const sqlCount = `SELECT COUNT(*) as total ${sqlBase}`;
  const sqlData = `SELECT id, nombres, apellidos, correo, rol, fecha_creacion ${sqlBase} ORDER BY nombres ASC LIMIT ? OFFSET ?`;

  db.query(sqlCount, params, (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = countRow[0].total;
    db.query(sqlData, [...params, pageSizeInt, offset], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        usuarios: rows,
        total: total,
        page: pageInt,
        pageSize: pageSizeInt
      });
    });
  });
});

// --- NUEVOS ENDPOINTS PARA GESTIÓN DE USUARIOS ---

// Eliminar un usuario
app.delete('/api/usuarios/:id', (req, res) => {
  const { id } = req.params;

  // Evitar que el admin principal se elimine a sí mismo (opcional pero recomendado)
  db.query('DELETE FROM usuarios WHERE id = ? AND rol != "admin"', [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o es un Administrador protegido' });
    }
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  });
});

// Actualizar rol de usuario
app.put('/api/usuarios/:id/rol', (req, res) => {
  const { id } = req.params;
  const { rol } = req.body; // 'admin' o 'user'

  if (!['admin', 'user'].includes(rol)) {
    return res.status(400).json({ error: 'Rol no válido' });
  }

  db.query('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id], function (err) {
    if (err) return res.status(500).json({ error: 'Error al actualizar rol' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});