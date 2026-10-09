const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

const SPREADSHEET_ID = "14PG8ZzledMuscAeaQwKSv5tkmjfEmXJJqWb9jcqtYL8";
const COLECCION = "fragancias";

async function leerRango(range) {
  const { google } = require("googleapis"); // carga diferida: el paquete es pesado
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return res.data.values || [];
}

const leerImportar = () => leerRango("IMPORTAR!A2:L");

// Margen de ganancia: proteínas y ganadores de peso x1,3; todo lo demás x1,4.
function margenPara(categoria) {
  const c = String(categoria || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return /^prote|ganador|^mass|gainer/.test(c) ? 1.3 : 1.4;
}

// Descripciones por defecto para productos nuevos que llegan sin descripción en la planilla.
// Clave: "marca|nombre" sin acentos y en minúsculas. Si la planilla trae descripción, se usa esa.
const normalizar = (v) => String(v || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const DESCRIPCIONES = {
  "gold nutrition|creatina monohydrate 1kg": "Creatina monohidrato en polvo de Gold Nutrition, presentación de 1 kg. Es una de las creatinas más utilizadas dentro de un plan de entrenamiento para acompañar el desarrollo de fuerza, la resistencia y la recuperación. Se consume todos los días, mezclada con agua o tu bebida preferida.",
  "gold nutrition|testo gold 30 servicios": "Testo Gold de Gold Nutrition es un suplemento dietario en presentación de 30 servicios, pensado para acompañar un plan de entrenamiento y una alimentación equilibrada. Consultá a un profesional de la salud antes de comenzar a consumirlo.",
  "gold nutrition|nad 30 caps": "NAD de Gold Nutrition es un suplemento dietario en cápsulas, presentación de 30 cápsulas. Se toma como complemento de una alimentación equilibrada y un estilo de vida activo. Consultá a un profesional de la salud antes de comenzar a consumirlo.",
  "gold nutrition|vitamin gold": "Vitamin Gold de Gold Nutrition es un complemento vitamínico para acompañar una alimentación equilibrada y las exigencias de la actividad física diaria.",
  "gold nutrition|electrolytes": "Electrolytes de Gold Nutrition es una bebida en polvo con electrolitos para ayudar a reponer los minerales que se pierden con la transpiración durante el entrenamiento o en jornadas de calor.",
  "gold nutrition|magnesium glycinate 60 caps": "Magnesio glicinato de Gold Nutrition, presentación de 60 cápsulas. El magnesio es un mineral que participa en el funcionamiento muscular y nervioso, y se utiliza como complemento de la alimentación diaria.",
  "gold nutrition|collagen hidrolized 200grs": "Colágeno hidrolizado de Gold Nutrition en polvo, presentación de 200 g. Se utiliza como complemento para acompañar el cuidado de articulaciones, piel y tejido conectivo dentro de una alimentación equilibrada.",
  "gold nutrition|shaker gold con compartimento": "Shaker de Gold Nutrition con compartimento, ideal para llevar tu suplemento o tus cápsulas a donde vayas. Práctico para preparar tus batidos en el gimnasio o en el trabajo.",
  "ena|enaccion colageno move 30comprimidos": "Enacción Colágeno Move de ENA, presentación de 30 comprimidos. Colágeno pensado como complemento para acompañar el cuidado de las articulaciones y la actividad física diaria.",
  "star nutrition|mtor bcaa 540grs": "MTOR BCAA de Star Nutrition, presentación de 540 g. Aminoácidos ramificados en polvo para acompañar el entrenamiento y la recuperación muscular dentro de un plan de alimentación equilibrado.",
};

// Productos nuevos: filas de NUEVOS_CARGA con "publicado" en TRUE. Se crean con un ID fijo
// (derivado de marca+nombre+presentación) para que nunca se creen dos veces.
async function crearNuevos(db, resumen, dryRun) {
  resumen.nuevos = [];
  const filas = await leerRango("NUEVOS_CARGA!A2:M");
  const crypto = require("crypto");
  const texto = (v) => (v === undefined || v === null ? "" : String(v).trim());
  for (const f of filas) {
    const [, nombre, marca, costo, precioHoja, stock, categoria, presentacion, ganancia, img, descripcion, publicado] = f;
    if (!(publicado === true || String(publicado).toUpperCase() === "TRUE")) continue;
    const etiqueta = `${texto(marca)} - ${texto(nombre)}`;
    const costoNum = Number(costo);
    if (!texto(nombre) || !texto(marca) || !Number.isFinite(costoNum) || costoNum <= 0) {
      resumen.errores.push(`${etiqueta}: falta nombre, marca o costo (no se creó)`);
      continue;
    }
    const gan = margenPara(categoria);
    const precio = Math.round(costoNum * gan);
    const clave = [marca, nombre, presentacion].map((x) => texto(x).toLowerCase()).join("|");
    const id = "nuevo_" + crypto.createHash("sha1").update(clave).digest("hex").slice(0, 20);
    const producto = {
      marca: texto(marca), nombre: texto(nombre), presentacion: texto(presentacion), categoria: texto(categoria),
      descripcion: texto(descripcion) || DESCRIPCIONES[normalizar(marca) + "|" + normalizar(nombre)] || "", img: texto(img), descuento: 0,
      precio_costo: costoNum, ganancia: gan, precio,
      stock: Number.isFinite(Number(stock)) ? Number(stock) : 0,
    };
    try {
      if (!dryRun) {
        await db.collection(COLECCION).doc(id).create({ ...producto, creado_el: admin.firestore.FieldValue.serverTimestamp() });
      } else if ((await db.collection(COLECCION).doc(id).get()).exists) {
        continue;
      }
      const avisos = [!producto.img && "sin imagen", !producto.descripcion && "sin descripción", !producto.categoria && "sin categoría"].filter(Boolean);
      resumen.nuevos.push(`${etiqueta} (${producto.presentacion || "s/presentación"}) precio ${precio}${avisos.length ? " [" + avisos.join(", ") + "]" : ""}`);
    } catch (e) {
      if (e.code === 6 || /already exists/i.test(e.message)) continue; // ya creado antes
      resumen.errores.push(`${etiqueta}: ${e.message}`);
    }
  }
}

async function correr({ dryRun = false } = {}) {
  const filas = await leerImportar();
  const db = admin.firestore();
  const resumen = { actualizados: 0, sinCambio: 0, paraRevisar: [], errores: [], respaldo: [] };

  const aEliminar = [];

  for (const f of filas) {
    const [id, nombre, marca, costoActual, , , , costoNuevo, , , precioNuevo, accion] = f;
    if (!id) continue;
    if (accion === "SIN CAMBIO") { resumen.sinCambio++; continue; }
    if (accion === "SIN DATO") { aEliminar.push({ id: String(id), nombre, marca }); continue; }
    const esCambioGrande = typeof accion === "string" &&
      (accion.startsWith("REVISAR (cambio grande") || accion.startsWith("REVISAR (costo actual 0"));
    if (accion !== "ACTUALIZAR" && !esCambioGrande) {
      resumen.paraRevisar.push(`${marca} - ${nombre}: ${accion}`);
      continue;
    }
    if (!Number.isFinite(costoNuevo) || costoNuevo <= 0 || !Number.isFinite(precioNuevo) || precioNuevo <= 0) {
      resumen.errores.push(`${marca} - ${nombre}: valores inválidos`);
      continue;
    }
    try {
      const ref = db.collection(COLECCION).doc(String(id));
      const antes = await ref.get();
      if (!antes.exists) throw new Error("no existe el documento " + id);
      const margen = margenPara(antes.get("categoria"));
      const precioFinal = Math.round(costoNuevo * margen);
      if (!dryRun) {
        resumen.respaldo.push({ id: String(id), producto: `${marca} - ${nombre}`, precio_costo: antes.get("precio_costo") ?? null, precio: antes.get("precio") ?? null, cambioGrande: esCambioGrande });
        await ref.update({
          precio_costo: costoNuevo,
          precio: precioFinal,
          ganancia: margen,
          ultima_actualizacion: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      resumen.actualizados++;
      if (dryRun) {
        resumen.detalle = resumen.detalle || [];
        resumen.detalle.push({ id, producto: `${marca} - ${nombre}`, costoPlanilla: costoActual, costoNuevo, precioNuevo: precioFinal, margen, categoria: antes.get("categoria") ?? null });
      }
    } catch (e) {
      resumen.errores.push(`${marca} - ${nombre}: ${e.message}`);
    }
  }

  // Productos que no están en la lista del proveedor ("SIN DATO"): se borran de la tienda.
  // Protección: si la planilla está rota (casi todo "SIN DATO" o casi nada actualizado) no se borra nada.
  resumen.eliminados = [];
  const planillaSana = resumen.actualizados + resumen.sinCambio >= 50 && aEliminar.length <= 15;
  if (aEliminar.length && !planillaSana) {
    resumen.errores.push(`No se eliminó nada: ${aEliminar.length} filas SIN DATO y ${resumen.actualizados} actualizadas (planilla sospechosa)`);
  } else {
    for (const p of aEliminar) {
      try {
        const ref = db.collection(COLECCION).doc(p.id);
        const snap = await ref.get();
        if (!snap.exists) continue; // ya eliminado en una corrida anterior
        resumen.eliminados.push(`${p.marca} - ${p.nombre}`);
        if (!dryRun) {
          await db.collection("productos_eliminados").doc(p.id).set({
            ...snap.data(),
            eliminado_el: admin.firestore.FieldValue.serverTimestamp(),
            motivo: "no está en la lista del proveedor",
          });
          await ref.delete();
        }
      } catch (e) {
        resumen.errores.push(`${p.marca} - ${p.nombre}: ${e.message}`);
      }
    }
  }

  try {
    await crearNuevos(db, resumen, dryRun);
  } catch (e) {
    resumen.errores.push(`NUEVOS_CARGA: ${e.message}`);
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
