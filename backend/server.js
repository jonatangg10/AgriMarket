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
// ENDPOINTS DE AUTENTICACIÓN / USUARIOS
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

// =====================================================
// ENDPOINTS DE CONTACTO
// =====================================================

  // Importar router de contacto
  const contactoRouter = require('./endpoints/contacto.js')(db);
  app.use('/api', contactoRouter);

// =====================================================
// ENDPOINTS DE DEPARTAMENTOS
// =====================================================

  // Importar router de departamentos
  const departamentosRouter = require('./endpoints/departamentos.js')(db);
  app.use('/api/departamentos', departamentosRouter);


// =====================================================
// ENDPOINTS DE MUNICIPIOS
// =====================================================

  // Importar router de municipios
  const municipiosRouter = require('./endpoints/municipios.js')(db);
  app.use('/api/municipios', municipiosRouter);

// =================================================
// ENDPOINTS FACTURAS
// ==================================================

  // Estructura preliminar a llamado a factus
  const facturasRouter = require('./endpoints/factus.js')(db);
  app.use('/api/facturas', facturasRouter);

// =================================================
// ENDPOINTS VENTAS
// ==================================================

  // Importar router de ventas
  const ventasRouter = require('./endpoints/ventas.js')(db);
  app.use('/api/ventas', ventasRouter);

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

// =====================================================
// INICIAR SERVIDOR
// =====================================================

  app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
  });