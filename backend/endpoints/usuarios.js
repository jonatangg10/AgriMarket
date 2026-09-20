const express = require('express');

const router = express.Router();

module.exports = (db, bcrypt) => {

  // Login de usuario
  router.post('/login', (req, res) => {

    const { correo, password } = req.body;
    console.log('Intentando login con:', correo, password);
    // Buscar usuario por correo
    db.get(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo],
      (err, user) => {
        if (err) {
          console.error('Error en la consulta:', err);
          return res.status(500).json({
            error: 'Error en el servidor'
          });
        }
        if (!user) {
          return res.status(401).json({
            error: 'Credenciales incorrectas'
          });
        }
        // Comparar contraseña ingresada con el hash almacenado
        bcrypt.compare(
          password,
          user.password,
          (err, isMatch) => {

            if (err) {
              console.error('Error comparando password:', err);
              return res.status(500).json({
                error: 'Error en el servidor'
              });
            }
            if (!isMatch) {
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
                num_documento: user.num_documento,
                correo: user.correo,
                genero: user.genero_id,
                rol: user.rol_id,
                fecha_creacion: user.fecha_creacion
              }
            });
          }
        );
      }
    );
  });

  // Obtener todos los usuarios
  router.get('/usuarios', (req, res) => {
    db.all(
      `SELECT
        id,
        nombres,
        apellidos,
        num_documento,
        correo,
        password,
        genero_id,
        rol_id,
        fecha_creacion
      FROM usuarios`,
      (err, rows) => {
        if (err) {
          console.error('Error al obtener usuarios:', err);

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
  router.get('/usuarios/paginados', (req, res) => {
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
        rol_id,
        genero_id,
        fecha_creacion
      ${sqlBase}
      ORDER BY nombres ASC
      LIMIT ? OFFSET ?
    `;

    db.get(sqlCount, params, (err, countRow) => {
      if (err) {
        console.error('Error al contar usuarios:', err);

        return res.status(500).json({
          error: 'Error al contar usuarios'
        });
      }

      const total = countRow.total;

      db.all(
        sqlData,
        [...params, pageSizeInt, offset],
        (err, rows) => {
          if (err) {
            console.error('Error al obtener usuarios:', err);

            return res.status(500).json({
              error: 'Error al obtener usuarios'
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
  router.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    // rol_id = 1 corresponde a Administrador
    db.run(
      'DELETE FROM usuarios WHERE id = ? AND rol_id != 1',
      [id],
      function (err) {
        if (err) {
          console.error('Error al eliminar usuario:', err);

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
  router.put('/usuarios/:id/rol', (req, res) => {
    const { id } = req.params;
    const { rol_id } = req.body;

    if (!rol_id) {
      return res.status(400).json({
        error: 'Se requiere rol_id'
      });
    }

    // Verificar que el rol exista
    db.get(
      'SELECT id FROM roles WHERE id = ?',
      [rol_id],
      (err, row) => {
        if (err) {
          console.error('Error al consultar rol:', err);

          return res.status(500).json({
            error: 'Error al verificar rol'
          });
        }

        if (!row) {
          return res.status(400).json({
            error: 'El rol_id no existe'
          });
        }

        // Actualizar rol
        db.run(
          'UPDATE usuarios SET rol_id = ? WHERE id = ?',
          [rol_id, id],
          function (err) {
            if (err) {
              console.error('Error al actualizar rol:', err);

              return res.status(500).json({
                error: 'Error al actualizar rol'
              });
            }

            if (this.changes === 0) {
              return res.status(404).json({
                error: 'Usuario no encontrado'
              });
            }

            res.json({
              success: true,
              message: 'Rol actualizado correctamente'
            });
          }
        );
      }
    );
  });

  return router;
};