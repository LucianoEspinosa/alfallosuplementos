const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

const SPREADSHEET_ID = "14PG8ZzledMuscAeaQwKSv5tkmjfEmXJJqWb9jcqtYL8";
const COLECCION = "fragancias";
// Costo (precio_costo) y margen (ganancia) van en "costos", que solo lee el administrador.
// La ficha pública de "fragancias" no los lleva.
const COSTOS = "costos";
const BORRAR_COSTO = () => ({ precio_costo: admin.firestore.FieldValue.delete(), ganancia: admin.firestore.FieldValue.delete() });

async function leerCosto(db, id, docProducto) {
  const c = await db.collection(COSTOS).doc(String(id)).get();
  const d = c.exists ? c.data() : {};
  const viejo = docProducto && docProducto.exists ? docProducto.data() : {};
  return { precio_costo: d.precio_costo ?? viejo.precio_costo, ganancia: d.ganancia ?? viejo.ganancia };
}

// Guarda costo/margen en "costos" y precio en "fragancias" (y limpia campos viejos de la ficha pública).
async function guardarPrecio(db, id, { precio_costo, ganancia, precio }) {
  const batch = db.batch();
  batch.set(db.collection(COSTOS).doc(String(id)), { precio_costo, ganancia }, { merge: true });
  batch.update(db.collection(COLECCION).doc(String(id)), {
    precio, ...BORRAR_COSTO(), ultima_actualizacion: admin.firestore.FieldValue.serverTimestamp(),
  });
  await batch.commit();
}

// Productos que todavía tienen costo o margen en la ficha pública: se mueven a "costos".
async function migrarCostos(db) {
  const snap = await db.collection(COLECCION).get();
  const pendientes = snap.docs.filter((d) => d.get("precio_costo") !== undefined || d.get("ganancia") !== undefined);
  for (let i = 0; i < pendientes.length; i += 200) {
    const batch = db.batch();
    for (const d of pendientes.slice(i, i + 200)) {
      const ref = db.collection(COSTOS).doc(d.id);
      const actual = await ref.get();
      const a = actual.exists ? actual.data() : {};
      batch.set(ref, { precio_costo: a.precio_costo ?? d.get("precio_costo") ?? 0, ganancia: a.ganancia ?? d.get("ganancia") ?? null }, { merge: true });
      batch.update(d.ref, BORRAR_COSTO());
    }
    await batch.commit();
  }
  return pendientes.length;
}

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

const sinAcentos = (v) => String(v || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Tabla de márgenes editable en la planilla: hoja "MARGENES" con columnas  marca | categoria | margen
// ("*" = cualquiera). Gana la regla más específica: marca+categoría > marca > categoría > todo.
// Si la hoja no existe o está vacía, se usan las reglas por defecto de margenPara.
let tablaMargenes = [];
async function cargarTablaMargenes() {
  tablaMargenes = [];
  try {
    const filas = await leerRango("MARGENES!A2:C");
    for (const [marca, categoria, margen] of filas) {
      const valor = Number(String(margen).replace(",", "."));
      if (!Number.isFinite(valor) || valor < 1) continue; // un margen menor a 1 vendería bajo costo
      tablaMargenes.push({ marca: sinAcentos(marca) || "*", categoria: sinAcentos(categoria) || "*", margen: valor });
    }
  } catch (e) {
    console.log("Hoja MARGENES no disponible, se usan los márgenes por defecto:", e.message);
  }
  return tablaMargenes.length;
}
function margenDeTabla(categoria, marca) {
  const c = sinAcentos(categoria);
  const m = sinAcentos(marca);
  let mejor = null;
  let puntaje = -1;
  for (const r of tablaMargenes) {
    if ((r.marca !== "*" && r.marca !== m) || (r.categoria !== "*" && r.categoria !== c)) continue;
    const p = (r.marca !== "*" ? 2 : 0) + (r.categoria !== "*" ? 1 : 0);
    if (p > puntaje) { mejor = r; puntaje = p; }
  }
  return mejor ? mejor.margen : null;
}

// Margen de ganancia por defecto: proteínas y ganadores de peso x1,3; Pitbull (salvo proteínas) x1,45; todo lo demás x1,4.
function margenPara(categoria, marca) {
  const delaTabla = margenDeTabla(categoria, marca);
  if (delaTabla !== null) return delaTabla;
  const c = sinAcentos(categoria);
  const esProteina = /^prote/.test(c);
  if (sinAcentos(marca) === "pitbull" && !esProteina) return 1.45;
  return esProteina || /ganador|^mass|gainer/.test(c) ? 1.3 : 1.4;
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
async function crearNuevos(db, resumen, dryRun, idsEnImportar = new Set()) {
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
    const gan = margenPara(categoria, marca);
    const precio = Math.round(costoNum * gan);
    const clave = [marca, nombre, presentacion].map((x) => texto(x).toLowerCase()).join("|");
    const id = "nuevo_" + crypto.createHash("sha1").update(clave).digest("hex").slice(0, 20);
    const producto = {
      marca: texto(marca), nombre: texto(nombre), presentacion: texto(presentacion), categoria: texto(categoria),
      descripcion: texto(descripcion) || DESCRIPCIONES[normalizar(marca) + "|" + normalizar(nombre)] || "", img: texto(img), descuento: 0,
      precio,
      stock: Number.isFinite(Number(stock)) ? Number(stock) : 0,
    };
    try {
      const ref = db.collection(COLECCION).doc(id);
      const existente = await ref.get();
      if (existente.exists) {
        const costoGuardado = await leerCosto(db, id, existente);
        // Si ya está en IMPORTAR, su costo lo maneja la lista del proveedor: no se pisa con el costo
        // (fijo) que se cargó en NUEVOS_CARGA el día que se creó.
        if (idsEnImportar.has(id)) continue;
        // Ya fue creado antes: se mantienen costo, margen y precio al día con la planilla y las reglas de margen.
        if (costoGuardado.precio_costo !== costoNum || costoGuardado.ganancia !== gan || existente.get("precio") !== precio) {
          resumen.nuevosActualizados = (resumen.nuevosActualizados || 0) + 1;
          if (!dryRun) {
            resumen.respaldo.push({ id, producto: etiqueta, precio_costo: costoGuardado.precio_costo ?? null, precio: existente.get("precio") ?? null, motivo: "producto nuevo: costo o margen" });
            await guardarPrecio(db, id, { precio_costo: costoNum, ganancia: gan, precio });
          }
        }
        continue;
      }
      if (!dryRun) {
        await ref.create({ ...producto, creado_el: admin.firestore.FieldValue.serverTimestamp() });
        await db.collection(COSTOS).doc(id).set({ precio_costo: costoNum, ganancia: gan });
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
  const reglasMargen = await cargarTablaMargenes();
  const db = admin.firestore();
  const resumen = { actualizados: 0, sinCambio: 0, paraRevisar: [], errores: [], respaldo: [], reglasMargen };
  if (!dryRun) {
    try {
      resumen.costosMigrados = await migrarCostos(db);
    } catch (e) {
      resumen.errores.push(`Migración de costos: ${e.message}`);
    }
  }

  const aEliminar = [];

  for (const f of filas) {
    const [id, nombre, marca, costoActual, , , , costoNuevo, , , precioNuevo, accion] = f;
    if (!id) continue;
    if (accion === "SIN CAMBIO") {
      // El costo no cambió, pero el precio puede estar desactualizado respecto al margen vigente: se corrige.
      try {
        const ref = db.collection(COLECCION).doc(String(id));
        const doc = await ref.get();
        const guardado = doc.exists ? await leerCosto(db, id, doc) : {};
        const costo = Number(doc.exists ? guardado.precio_costo : 0);
        if (doc.exists && Number.isFinite(costo) && costo > 0) {
          const margen = margenPara(doc.get("categoria"), doc.get("marca") || marca);
          const precioEsperado = Math.round(costo * margen);
          if (doc.get("precio") !== precioEsperado || guardado.ganancia !== margen) {
            resumen.repreciados = (resumen.repreciados || 0) + 1;
            if (!dryRun) {
              resumen.respaldo.push({ id: String(id), producto: `${marca} - ${nombre}`, precio_costo: costo, precio: doc.get("precio") ?? null, motivo: "cambio de margen" });
              await guardarPrecio(db, id, { precio_costo: costo, ganancia: margen, precio: precioEsperado });
            }
          }
        }
      } catch (e) {
        resumen.errores.push(`${marca} - ${nombre}: ${e.message}`);
      }
      resumen.sinCambio++;
      continue;
    }
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
      const margen = margenPara(antes.get("categoria"), antes.get("marca") || marca);
      const precioFinal = Math.round(costoNuevo * margen);
      if (!dryRun) {
        const costoAntes = await leerCosto(db, id, antes);
        resumen.respaldo.push({ id: String(id), producto: `${marca} - ${nombre}`, precio_costo: costoAntes.precio_costo ?? null, precio: antes.get("precio") ?? null, cambioGrande: esCambioGrande });
        await guardarPrecio(db, id, { precio_costo: costoNuevo, ganancia: margen, precio: precioFinal });
      }
      resumen.actualizados++;
      if (dryRun) {
        resumen.detalle = resumen.detalle || [];
        // Sin costos ni margen: este resumen lo devuelve un link público (actualizarPreciosPrueba)
        resumen.detalle.push({ id, producto: `${marca} - ${nombre}`, precioNuevo: precioFinal, categoria: antes.get("categoria") ?? null });
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
            ...(await leerCosto(db, p.id, snap)),
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
    await crearNuevos(db, resumen, dryRun, new Set(filas.map((f) => String(f[0] || "")).filter(Boolean)));
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
