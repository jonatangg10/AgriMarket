const express = require('express');

const router = express.Router();

module.exports = (db, bcrypt) => {

  // =====================================================
  // LOGIN
  // =====================================================

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
                rol: user.rol,
                fecha_creacion: user.fecha_creacion
              }
            });
          }
        );
      }
    );
  });


  // =====================================================
  // AQUÍ IRÁN LOS DEMÁS ENDPOINTS DE USUARIOS
  // =====================================================



  return router;
};