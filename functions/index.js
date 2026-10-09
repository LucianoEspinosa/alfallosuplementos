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

        // Descontar el stock en el servidor (antes lo hacía el navegador del cliente)
        const db = admin.firestore();
        for (const item of Array.isArray(orderData.items) ? orderData.items : []) {
            const cantidad = Number(item && item.quantity);
            if (!item || !item.id || !Number.isFinite(cantidad) || cantidad <= 0) continue;
            try {
                const ref = db.collection("fragancias").doc(String(item.id));
                await db.runTransaction(async (t) => {
                    const doc = await t.get(ref);
                    if (!doc.exists) return;
                    const stockActual = Number(doc.get("stock")) || 0;
                    t.update(ref, { stock: Math.max(0, stockActual - cantidad) });
                });
            } catch (error) {
                console.error("Error descontando stock de", item.id, error);
            }
        }

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

// Verifica en el servidor si un email ya compró (descuento de primera compra).
// Reemplaza la consulta directa a "orders" desde el navegador, para poder cerrar esa colección.
exports.esPrimeraCompra = functions
    .region("southamerica-east1")
    .https.onCall(async (data) => {
        const email = String((data && data.email) || "").toLowerCase().trim();
        if (!email || email.length > 200) {
            throw new functions.https.HttpsError("invalid-argument", "Email inválido");
        }
        const snap = await admin.firestore().collection("orders").where("buyer.email", "==", email).get();
        const validas = snap.docs.filter((d) => {
            const status = d.data().status;
            return status !== "cancelada" && status !== "pendiente";
        });
        return { esPrimeraCompra: validas.length === 0 };
    });
