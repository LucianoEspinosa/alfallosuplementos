const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

const SPREADSHEET_ID = "14PG8ZzledMuscAeaQwKSv5tkmjfEmXJJqWb9jcqtYL8";
const COLECCION = "fragancias";

async function leerImportar() {
  const { google } = require("googleapis"); // carga diferida: el paquete es pesado
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "IMPORTAR!A2:L",
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return res.data.values || [];
}

async function correr({ dryRun = false } = {}) {
  const filas = await leerImportar();
  const db = admin.firestore();
  const resumen = { actualizados: 0, sinCambio: 0, paraRevisar: [], errores: [] };

  for (const f of filas) {
    const [id, nombre, marca, costoActual, , , , costoNuevo, , , precioNuevo, accion] = f;
    if (!id) continue;
    if (accion === "SIN CAMBIO") { resumen.sinCambio++; continue; }
    if (accion !== "ACTUALIZAR") {
      resumen.paraRevisar.push(`${marca} - ${nombre}: ${accion}`);
      continue;
    }
    if (!Number.isFinite(costoNuevo) || costoNuevo <= 0 || !Number.isFinite(precioNuevo) || precioNuevo <= 0) {
      resumen.errores.push(`${marca} - ${nombre}: valores inválidos`);
      continue;
    }
    try {
      if (!dryRun) {
        await db.collection(COLECCION).doc(String(id)).update({
          precio_costo: costoNuevo,
          precio: precioNuevo,
          ultima_actualizacion: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      resumen.actualizados++;
    } catch (e) {
      resumen.errores.push(`${marca} - ${nombre}: ${e.message}`);
    }
  }

  if (!dryRun) {
    await db.collection("actualizaciones_precios").add({
      fecha: admin.firestore.FieldValue.serverTimestamp(),
      ...resumen,
    });
  }
  console.log(JSON.stringify(resumen));
  return resumen;
}

exports.actualizarPrecios = functions
  .region("southamerica-east1")
  .pubsub.schedule("0 7 * * *")
  .timeZone("America/Argentina/Buenos_Aires")
  .onRun(() => correr());

exports.actualizarPreciosPrueba = functions
  .region("southamerica-east1")
  .https.onRequest(async (req, res) => {
    const r = await correr({ dryRun: true });
    res.json(r);
  });
