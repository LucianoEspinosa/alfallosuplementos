const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "lucianoespinosa04@gmail.com",   // <-- tu Gmail
        pass: "gmzo pvtr jeaq wllm",        // <-- contraseña de aplicación
    },
});

// Function en la región southamerica-east1
exports.sendOrderEmail = functions
    .region("southamerica-east1")
    .firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
        const orderData = snap.data();
        const orderId = context.params.orderId;

        // Armar tabla HTML con los campos de la orden
        let orderDetails = `
      <table border="1" cellspacing="0" cellpadding="5">
        <thead>
          <tr>
            <th>Campo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
    `;

        for (const [key, value] of Object.entries(orderData)) {
            orderDetails += `
        <tr>
          <td><b>${key}</b></td>
          <td>${value}</td>
        </tr>
      `;
        }

        orderDetails += `
        </tbody>
      </table>
    `;

        const mailOptions = {
            from: "TUCORREO@gmail.com",
            to: "TUCORREO@gmail.com",
            subject: `Nueva orden recibida - ID ${orderId}`,
            html: `
        <h2>📦 Se ha creado una nueva orden</h2>
        <p><b>ID de orden:</b> ${orderId}</p>
        <h3>Detalles:</h3>
        ${orderDetails}
      `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("✅ Correo enviado con éxito");
        } catch (error) {
            console.error("❌ Error al enviar correo:", error);
        }
    });


