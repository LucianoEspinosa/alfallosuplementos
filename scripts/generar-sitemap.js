// Genera public/sitemap.xml con las páginas de la tienda (inicio, categorías, marcas y productos).
// Se ejecuta solo antes de cada build (script "prebuild"). Lee los productos con la API pública de Firestore.
// Si no hay conexión, NO falla el build: se conserva el sitemap anterior.
const fs = require("fs");
const path = require("path");

const SITIO = "https://alfallo.vercel.app";
const PROYECTO = "fragancesnet";
const API_KEY = "AIzaSyDzq1YMmk1KGBAVB6JU7Yl9T2OJUE1XDd4"; // clave web pública de Firebase
const SALIDA = path.join(__dirname, "..", "public", "sitemap.xml");

const escapar = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const texto = (campo) => (campo && campo.stringValue ? campo.stringValue.trim() : "");

async function leerProductos() {
  const productos = [];
  let pageToken = "";
  do {
    const url =
      `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents/fragancias` +
      `?pageSize=300&mask.fieldPaths=categoria&mask.fieldPaths=marca&key=${API_KEY}` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Firestore respondió ${res.status}`);
    const json = await res.json();
    for (const doc of json.documents || []) {
      productos.push({
        id: doc.name.split("/").pop(),
        categoria: texto(doc.fields && doc.fields.categoria),
        marca: texto(doc.fields && doc.fields.marca),
      });
    }
    pageToken = json.nextPageToken || "";
  } while (pageToken);
  return productos;
}

async function main() {
  const productos = await leerProductos();
  if (productos.length === 0) throw new Error("No se encontraron productos");

  const hoy = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: "/", prioridad: "1.0", freq: "daily" },
    { loc: "/masvendidos", prioridad: "0.7", freq: "weekly" },
    { loc: "/ofertas", prioridad: "0.7", freq: "daily" },
    { loc: "/calculadora", prioridad: "0.4", freq: "monthly" },
    { loc: "/plan", prioridad: "0.4", freq: "monthly" },
  ];
  for (const c of [...new Set(productos.map((p) => p.categoria).filter(Boolean))].sort()) {
    urls.push({ loc: `/category/${encodeURIComponent(c)}`, prioridad: "0.8", freq: "weekly" });
  }
  for (const m of [...new Set(productos.map((p) => p.marca).filter(Boolean))].sort()) {
    urls.push({ loc: `/brand/${encodeURIComponent(m)}`, prioridad: "0.6", freq: "weekly" });
  }
  for (const p of productos) {
    urls.push({ loc: `/item/${p.id}`, prioridad: "0.9", freq: "weekly" });
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url><loc>${escapar(SITIO + u.loc)}</loc><lastmod>${hoy}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.prioridad}</priority></url>`)
      .join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(SALIDA, xml);
  console.log(`sitemap.xml generado: ${urls.length} URLs (${productos.length} productos)`);
}

main().catch((e) => {
  console.warn("No se pudo generar el sitemap (se conserva el anterior):", e.message);
  process.exit(0);
});
