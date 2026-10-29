// Vista previa del link con código de descuento (?cupon=CODIGO).
// WhatsApp, Instagram, etc. no ejecutan JavaScript: leen las etiquetas og:* del HTML.
// Cuando el link trae un código, devolvemos el mismo index.html pero con imagen y textos del descuento.
// Sin código, la página sigue exactamente igual que siempre.

export const config = {
  // Solo páginas (no archivos estáticos ni /api)
  matcher: ["/((?!api/|static/|.*\\.).*)"],
};

// Imagen y textos propios por código. Si un código no está acá, se usa la imagen general.
const CUPONES = {
  TOMITEAM: {
    imagen: "/og/cupon-TOMITEAM-2.jpg",
    titulo: "10% OFF en tu primera compra (5% en proteínas) | Al Fallo Suplementos",
    descripcion:
      "Beneficio Tomi Team: entrá con el código TOMITEAM ya cargado. 10% en toda la tienda y 5% en proteínas, en tu primera compra.",
  },
};

const PARAMETROS = ["cupon", "codigo", "code", "descuento"];

const escapar = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const reemplazarMeta = (html, atributo, nombre, valor) => {
  const re = new RegExp(`(<meta\\s+${atributo}="${nombre}"\\s+content=")[^"]*(")`, "i");
  return html.replace(re, `$1${escapar(valor)}$2`);
};

export default async function middleware(request) {
  try {
    const url = new URL(request.url);
    const LINKS_CORTOS = { "/tomiteam": "TOMITEAM" };
    let codigo = LINKS_CORTOS[url.pathname.toLowerCase().replace(/\/+$/, "")] || "";
    for (const p of PARAMETROS) {
      const v = (url.searchParams.get(p) || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      if (v && !codigo) {
        codigo = v;
        break;
      }
    }
    if (!codigo) return; // sigue normal

    const respuesta = await fetch(new URL("/index.html", url.origin));
    if (!respuesta.ok) return;
    let html = await respuesta.text();

    const datos = CUPONES[codigo] || {
      imagen: "/og-image.png",
      titulo: `Código ${codigo} | Al Fallo Suplementos`,
      descripcion: `Entrá con el código de descuento ${codigo} ya cargado. Proteínas, creatinas y más.`,
    };
    const imagen = new URL(datos.imagen, url.origin).toString();

    html = reemplazarMeta(html, "property", "og:title", datos.titulo);
    html = reemplazarMeta(html, "property", "og:description", datos.descripcion);
    html = reemplazarMeta(html, "property", "og:image", imagen);
    html = reemplazarMeta(html, "name", "twitter:image", imagen);
    html = reemplazarMeta(html, "property", "og:image:alt", datos.titulo);
    html = reemplazarMeta(html, "property", "og:url", url.toString());
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapar(datos.titulo)}</title>`);

    return new Response(html, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=300" },
    });
  } catch (e) {
    return; // ante cualquier problema, la página se sirve normal
  }
}
