const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

// Consultas por voz (o texto) del administrador sobre costos, precios y ganancias.
// El navegador transcribe lo que se dice y manda el texto acá. Gemini solo elige de qué
// productos se habla y redacta la respuesta; las cuentas (costo, venta, ganancia) se hacen
// en este archivo, así los números siempre salen de la base y no de la IA.
//
// Clave: secreto de Firebase GEMINI_API_KEY (gratis en https://aistudio.google.com/apikey).
// Modelo: se puede forzar con el secreto/variable GEMINI_MODEL; si no, se prueban los alias
// "latest" de Flash-Lite (más consultas gratis por día) y Flash.

const ADMIN_EMAILS = ["lucianoespinosa04@gmail.com"]; // mismo listado que AdminRoute.jsx y firestore.rules
const TRANSFER_SURCHARGE = 0.075; // igual que src/config.js
const MODELOS = ["gemini-flash-lite-latest", "gemini-flash-latest"];

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function datosDe(id, p) {
  const precioLista = num(p.precio);
  const descuento = num(p.descuento) || 0;
  const precioVenta = precioLista === null ? null
    : descuento > 0 ? Math.round(precioLista - (precioLista * descuento) / 100) : precioLista;
  const costo = num(p.precio_costo);
  const tieneCosto = costo !== null && costo > 0;
  const ganancia = tieneCosto && precioVenta !== null ? precioVenta - costo : null;
  return {
    id,
    marca: p.marca || "",
    nombre: p.nombre || "",
    presentacion: p.presentacion || "",
    categoria: p.categoria || "",
    stock: num(p.stock) ?? 0,
    costo: tieneCosto ? costo : null,
    precioLista,
    descuento,
    precioVenta,
    precioTransferencia: precioVenta === null ? null : Math.round(precioVenta * (1 + TRANSFER_SURCHARGE)),
    ganancia,
    // % sobre el costo (como se definen los márgenes: x1,3 = 30%) y % sobre el precio de venta
    gananciaPctCosto: ganancia !== null ? Math.round((ganancia / costo) * 1000) / 10 : null,
    gananciaPctVenta: ganancia !== null && precioVenta > 0 ? Math.round((ganancia / precioVenta) * 1000) / 10 : null,
  };
}

const lineaCatalogo = (d) => [
  d.id,
  d.marca,
  d.nombre,
  d.presentacion,
  d.categoria,
  `stock ${d.stock}`,
  `costo ${d.costo ?? "sin cargar"}`,
  `venta ${d.precioVenta ?? "sin precio"}${d.descuento > 0 ? ` (con ${d.descuento}% off, lista ${d.precioLista})` : ""}`,
  `transferencia ${d.precioTransferencia ?? "-"}`,
  `ganancia $${d.ganancia ?? "-"}`,
  `ganancia ${d.gananciaPctCosto ?? "-"}% s/costo`,
].join(" | ");

async function preguntarAGemini(apiKey, prompt) {
  const modelos = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : MODELOS;
  let ultimoError = null;
  for (const modelo of modelos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              respuesta: { type: "STRING" },
              ids: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["respuesta", "ids"],
          },
        },
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const texto = json?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      try {
        return JSON.parse(texto);
      } catch (e) {
        return { respuesta: texto, ids: [] };
      }
    }
    const detalle = await res.text();
    ultimoError = { status: res.status, detalle: detalle.slice(0, 300), modelo };
    console.error("Gemini respondió con error", ultimoError);
    // 404 = modelo inexistente, 429 = sin cuota en este modelo: se prueba el siguiente
    if (res.status !== 404 && res.status !== 429) break;
  }
  if (ultimoError && ultimoError.status === 429) {
    throw new functions.https.HttpsError("resource-exhausted", "Se terminaron las consultas gratis de Gemini por ahora. Probá de nuevo en un rato.");
  }
  throw new functions.https.HttpsError("internal", "No se pudo consultar a Gemini.");
}

exports.consultaAdmin = functions
  .region("southamerica-east1")
  .runWith({ secrets: ["GEMINI_API_KEY"], timeoutSeconds: 60, memory: "256MB" })
  .https.onCall(async (data, context) => {
    const token = context.auth && context.auth.token;
    if (!token || !token.email_verified || !ADMIN_EMAILS.includes(String(token.email || "").toLowerCase())) {
      throw new functions.https.HttpsError("permission-denied", "Solo el administrador puede hacer consultas.");
    }

    const pregunta = String((data && data.pregunta) || "").trim();
    if (!pregunta || pregunta.length > 500) {
      throw new functions.https.HttpsError("invalid-argument", "La consulta está vacía o es demasiado larga.");
    }

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      throw new functions.https.HttpsError("failed-precondition", "Falta configurar la clave de Gemini (GEMINI_API_KEY).");
    }

    const db = admin.firestore();
    const [snap, costosSnap] = await Promise.all([db.collection("fragancias").get(), db.collection("costos").get()]);
    // Costo y margen están en la colección privada "costos"
    const costos = new Map(costosSnap.docs.map((d) => [d.id, d.data()]));
    const productos = snap.docs.map((d) => {
      const p = d.data();
      const c = costos.get(d.id) || {};
      return datosDe(d.id, { ...p, precio_costo: c.precio_costo ?? p.precio_costo });
    });
    const porId = new Map(productos.map((p) => [p.id, p]));

    const prompt = `Sos el asistente del dueño de "Al Fallo Suplementos", una tienda online de suplementos deportivos en Argentina.
El dueño te hace una consulta hablada (puede venir con errores de transcripción: interpretá nombres de marcas y productos con criterio).
Respondé SOLO con los datos del catálogo de abajo. No inventes productos ni números y no hagas cuentas nuevas: los valores de costo, venta y ganancia ya están calculados.

Reglas:
- "Cuánto me sale" / "cuánto me cuesta" = costo. "Precio de venta" = venta (ya tiene aplicado el descuento si hay). "Ganancia" = ganancia en pesos y en % sobre el costo.
- Si la consulta coincide con varias presentaciones o sabores del mismo producto, mencionalas todas (máximo 8).
- Si no encontrás el producto, decilo y sugerí el más parecido si existe.
- Si un producto no tiene costo cargado, aclaralo.
- "respuesta": español rioplatense, corta y clara para leer en voz alta (máximo 3 oraciones). Montos en pesos con punto de miles, por ejemplo $45.300.
- "ids": los ids exactos (primera columna) de los productos que mencionás, en el mismo orden.

Catálogo (id | marca | nombre | presentación | categoría | stock | costo | venta | transferencia | ganancia $ | ganancia %):
${productos.map(lineaCatalogo).join("\n")}

Consulta del dueño: "${pregunta.replace(/"/g, "'")}"`;

    const resultado = await preguntarAGemini(apiKey, prompt);
    const ids = Array.isArray(resultado.ids) ? resultado.ids : [];
    const encontrados = ids.map((id) => porId.get(String(id))).filter(Boolean).slice(0, 8);

    return {
      respuesta: String(resultado.respuesta || "").trim() || "No encontré una respuesta para esa consulta.",
      productos: encontrados,
    };
  });
