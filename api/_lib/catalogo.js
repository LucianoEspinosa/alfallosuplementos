// Catálogo de la tienda leído de Firestore con la clave pública (misma lectura que el sitemap).
// Lo usan /api/catalogo (para el JSON público) y el bot de Instagram.

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

// Lee y arma el catálogo, guardado en memoria 10 minutos mientras la función siga activa
let cache = { t: 0, items: null };
async function leerCatalogo() {
  if (cache.items && Date.now() - cache.t < 10 * 60 * 1000) return cache.items;
  const productos = await leerProductos();
  const items = productos
    .filter((p) => texto(p.nombre) && Number(p.precio) > 0)
    .map(armarItem)
    .sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
  cache = { t: Date.now(), items };
  return items;
}

// Una línea por producto, compacta, para dársela al modelo de lenguaje
const lineaParaBot = (i) =>
  [
    i.name,
    i.category || "otros",
    `efectivo ${i.price_cash}`,
    `transferencia ${i.price_transfer}`,
    i.discount_percent ? `oferta -${i.discount_percent}%` : "",
    i.flavors.length ? `sabores: ${i.flavors.join(", ")}` : "",
    i.availability === "in stock" ? "" : "SIN STOCK",
    i.url,
  ].filter(Boolean).join(" | ");

module.exports = { leerCatalogo, lineaParaBot, pesos };
