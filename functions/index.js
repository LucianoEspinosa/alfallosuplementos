const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

// Function en la región southamerica-east1
exports.sendOrderEmail = functions
    .region("southamerica-east1")
    .runWith({ secrets: ["GMAIL_APP_PASSWORD"] })
    .firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
        // Configuración de Nodemailer (la contraseña viene del secreto de Firebase)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "lucianoespinosa04@gmail.com",
                pass: (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, ""),
            },
        });

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

        const escapeHtml = (s) => String(s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const formatValue = (value) => {
            if (value && typeof value.toDate === "function") {
                return escapeHtml(value.toDate().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }));
            }
            if (value && typeof value === "object") {
                return `<pre style="margin:0">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
            }
            return escapeHtml(value);
        };

        for (const [key, value] of Object.entries(orderData)) {
            orderDetails += `
        <tr>
          <td><b>${escapeHtml(key)}</b></td>
          <td>${formatValue(value)}</td>
        </tr>
      `;
        }

        orderDetails += `
        </tbody>
      </table>
    `;

        const mailOptions = {
            from: "lucianoespinosa04@gmail.com",
            to: "lucianoespinosa04@gmail.com",
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



Object.assign(exports, require("./actualizarPrecios"));
