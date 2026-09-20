const express = require('express');
const router = express.Router();

module.exports = (db) => {

  const FACTUS_API_URL = process.env.FACTUS_API_URL;

  // =====================================================
  // OBTENER TOKEN DE FACTUS
  // =====================================================

  async function obtenerTokenFactus() {

    const bodyData = new URLSearchParams({
      grant_type: 'password',
      client_id: process.env.FACTUS_CLIENT_ID,
      client_secret: process.env.FACTUS_CLIENT_SECRET,
      username: process.env.FACTUS_USERNAME,
      password: process.env.FACTUS_PASSWORD
    });

    const response = await fetch(`${FACTUS_API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyData.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error_description ||
        data.message ||
        'Error autenticando en Factus'
      );
    }

    return data.access_token;
  }


  // =====================================================
  // GUARDAR VENTA EN BD
  // =====================================================

  function guardarVentaLocal(payloadFactus) {

    return new Promise((resolve, reject) => {

      const customer = payloadFactus.customer;

      const totalFactura =
        Number(payloadFactus.payment_details[0].amount);

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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
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

        if (err) {
          return reject(err);
        }

        const ventaId = this.lastID;

        const stmtDetalle = db.prepare(`
          INSERT INTO detalle_ventas (
            venta_id,
            producto_id,
            cantidad,
            precio_unitario,
            subtotal
          )
          VALUES (?, ?, ?, ?, ?)
        `);

        payloadFactus.items.forEach(item => {

          const productoId =
            Number(item.code_reference.replace('PROD-', ''));

          const cantidadNum = Number(item.quantity);
          const precioNum = Number(item.price);
          const subtotal = cantidadNum * precioNum;

          stmtDetalle.run(
            [
              ventaId,
              productoId,
              cantidadNum,
              precioNum,
              subtotal
            ],
            (err) => {

              if (err) {
                console.error(
                  `Error guardando detalle del producto ${productoId}:`,
                  err
                );
              }

            }
          );

        });

        stmtDetalle.finalize((err) => {

          if (err) {
            return reject(err);
          }

          resolve(ventaId);

        });

      });

    });
  }


  // =====================================================
  // FINALIZAR COMPRA
  // =====================================================

  router.post('/finalizar-compra', async (req, res) => {

    const {
      customer,
      items,
      payment_details
    } = req.body;

    if (
      !customer ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: 'Cliente y productos son obligatorios'
      });
    }


    // =====================================================
    // DATOS DEL CARRITO
    // =====================================================

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
        unit_measure_code: "94",
        standard_code: "999",
        taxes: [
          {
            is_excluded: true
          }
        ]
      };

    });


    // =====================================================
    // PAYLOAD FACTUS
    // =====================================================

    const payloadFactus = {

      reference_code:
        `FACT-${Date.now().toString().slice(-8)}`,

      document: "01",

      numbering_range_id: 389,

      operation_type: "10",

      observation:
        payment_details.observation || "",

      establishment: {
        name: "AgriMarket",
        address: "Calle 9 # 5-20",
        phone_number: "3000000000",
        email: "contacto@agrimarket.com",
        municipality_code: "25875"
      },

      payment_details: [
        {
          ...payment_details,

          reference_code:
            `PAGO-${Date.now().toString().slice(-6)}`,

          amount: totalFactura.toFixed(2)
        }
      ],

      cash_rounding_amount: "0.00",

      customer: customer,

      items: itemsFactus
    };


    try {

      // =====================================================
      // DESCONTAR STOCK
      // =====================================================

      for (const item of items) {

        const result = await new Promise((resolve, reject) => {

          db.run(
            `
            UPDATE productos
            SET stock = stock - ?
            WHERE id = ?
              AND stock >= ?
            `,
            [
              item.cantidad,
              item.id,
              item.cantidad
            ],
            function (err) {

              if (err) {
                return reject(err);
              }

              resolve(this.changes);

            }
          );

        });


        if (result === 0) {

          return res.status(400).json({
            error:
              `Stock insuficiente para el producto con ID ${item.id}`
          });

        }

      }


      // =====================================================
      // GUARDAR VENTA LOCAL
      // =====================================================

      const ventaIdLocal =
        await guardarVentaLocal(payloadFactus);


      // =====================================================
      // AUTENTICAR EN FACTUS
      // =====================================================

      const token =
        await obtenerTokenFactus();


      // =====================================================
      // ENVIAR FACTURA A FACTUS
      // =====================================================

      const responseFactus = await fetch(
        `${FACTUS_API_URL}/v2/bills/validate`,
        {
          method: 'POST',

          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(payloadFactus)
        }
      );


      const dataFactus =
        await responseFactus.json();


      // =====================================================
      // ACTUALIZAR FACTURA LOCAL
      // =====================================================

      db.run(
        `
        UPDATE ventas
        SET bill_number = ?,
            cufe = ?
        WHERE id = ?
        `,
        [
          dataFactus.data?.number,
          dataFactus.data?.cufe,
          ventaIdLocal
        ]
      );


      // =====================================================
      // VALIDAR RESPUESTA FACTUS
      // =====================================================

      if (!responseFactus.ok) {

        return res.status(400).json({
          error: 'Factus rechazó la validación',
          detalles: dataFactus
        });

      }


      // =====================================================
      // RESPUESTA
      // =====================================================

      res.json({
        success: true,
        factura: dataFactus.data
      });

    } catch (error) {

      console.error(
        'Error procesando compra:',
        error.message
      );

      res.status(500).json({
        error:
          'Error interno del servidor al emitir la factura',

        detalles:
          error.message
      });

    }

  });


  return router;
};