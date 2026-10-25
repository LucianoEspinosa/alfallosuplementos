// Catálogo público en JSON para el bot de Instagram (MyChatBot lo lee solo cada pocas horas).
// Lee la colección "fragancias" con la API pública de Firestore (misma lectura que el sitemap)
// y devuelve cada producto con el precio en efectivo y con transferencia, igual que la web.
// URL: https://alfallo.vercel.app/api/catalogo

const SITIO = "https://alfallo.vercel.app";
const PROYECTO = "fragancesnet";
const API_KEY = "AIzaSyDzq1YMmk1KGBAVB6JU7Yl9T2OJUE1XDd4"; // clave web pública de Firebase
const RECARGO_TRANSFERENCIA = 0.075; // mismo valor que TRANSFER_SURCHARGE en src/config.js

// Convierte un valor de la API REST de Firestore a un valor JS común
function valor(v) {
  if (!v || typeof v !== "object") return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(valor);
  if ("mapValue" in v) {
    const out = {};
    for (const [k, x] of Object.entries(v.mapValue.fields || {})) out[k] = valor(x);
    return out;
  }
  return undefined;
}

const texto = (x) => (x == null ? "" : String(x).trim());
const pesos = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");

async function leerProductos() {
  const campos = ["nombre", "marca", "categoria", "presentacion", "precio", "descuento", "stock", "sabores", "img", "descripcion"];
  const mascara = campos.map((c) => `mask.fieldPaths=${c}`).join("&");
  const productos = [];
  let pageToken = "";
  do {
    const url =
      `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents/fragancias` +
      `?pageSize=300&${mascara}&key=${API_KEY}` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Firestore respondió ${res.status}`);
    const json = await res.json();
    for (const doc of json.documents || []) {
      const f = {};
      for (const [k, x] of Object.entries(doc.fields || {})) f[k] = valor(x);
      productos.push({ id: doc.name.split("/").pop(), ...f });
    }
    pageToken = json.nextPageToken || "";
  } while (pageToken);
  return productos;
}

function armarItem(p) {
  const precio = Number(p.precio) || 0;
  const descuento = Number(p.descuento) || 0;
  // Misma cuenta que precioFinalDe y precioTransferencia (src/utils/productos.js)
  const efectivo = descuento > 0 ? Math.round(precio - (precio * descuento) / 100) : Math.round(precio);
  const transferencia = Math.round(efectivo * (1 + RECARGO_TRANSFERENCIA));
  const disponible = Number(p.stock) > 0;
  const sabores = Array.isArray(p.sabores) ? p.sabores.map(texto).filter(Boolean) : [];
  // Algunas marcas están cargadas en minúscula ("pitbull"): se muestran con mayúscula inicial
  const marca = texto(p.marca).replace(/^\p{Ll}/u, (c) => c.toUpperCase());
  const nombre = texto(p.nombre);
  const presentacion = texto(p.presentacion);
  const titulo = [marca, nombre, presentacion].filter(Boolean).join(" ");
  const img = texto(p.img);

  const resumen = [
    `${titulo}.`,
    `Categoría: ${texto(p.categoria) || "otros"}.`,
    `Precio en efectivo: ${pesos(efectivo)}. Precio con transferencia: ${pesos(transferencia)}.`,
    descuento > 0 ? `En oferta: ${descuento}% de descuento (precio de lista ${pesos(precio)}).` : "",
    sabores.length ? `Sabores: ${sabores.join(", ")}.` : "",
    disponible ? "" : "Sin stock por el momento.",
    texto(p.descripcion),
  ].filter(Boolean).join(" ");

  return {
    id: p.id,
    name: titulo,
    title: titulo,
    brand: marca,
    category: texto(p.categoria),
    size: presentacion,
    price: efectivo,
    currency: "ARS",
    price_cash: pesos(efectivo),
    price_transfer: pesos(transferencia),
    discount_percent: descuento > 0 ? descuento : 0,
    flavors: sabores,
    availability: disponible ? "in stock" : "out of stock",
    url: `${SITIO}/item/${p.id}`,
    link: `${SITIO}/item/${p.id}`,
    image_link: /^https?:\/\//.test(img) ? img : "",
    description: resumen,
  };
}

module.exports = async (req, res) => {
  try {
    const productos = await leerProductos();
    const items = productos
      .filter((p) => texto(p.nombre) && Number(p.precio) > 0)
      .map(armarItem)
      .sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    // Vercel guarda la respuesta 30 minutos: los cambios de precio se ven en el catálogo en menos de media hora
    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=600");
    res.status(200).send(JSON.stringify(items));
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "No se pudo leer el catálogo", detalle: e.message });
  }
};
