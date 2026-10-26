// Mensajes directos de Instagram con la API oficial de Meta ("Instagram API con inicio de sesión de Instagram").
// Variables de entorno:
//   IG_ACCESS_TOKEN  token de la cuenta @alfallo.suplementos (se genera en el panel de la app de Meta)
//   IG_USER_ID       id de la cuenta de Instagram (aparece junto al token)
//   META_APP_SECRET  "clave secreta de la app de Instagram", para comprobar que los avisos vienen de Meta
//   GRAPH_VERSION    opcional, versión de la API (por defecto v23.0)

const crypto = require("crypto");
const fs = require("./firestore");

// Token de Instagram: primero el renovado automáticamente (Firestore "config/instagram"),
// si no hay, el de la variable de entorno IG_ACCESS_TOKEN. Se guarda en memoria 10 minutos.
let tokenCache = { valor: "", t: 0 };
async function token() {
  if (tokenCache.valor && Date.now() - tokenCache.t < 10 * 60 * 1000) return tokenCache.valor;
  let valor = "";
  try {
    const doc = await fs.leer("config/instagram");
    valor = (doc && doc.token) || "";
  } catch (e) {
    console.error("No se pudo leer el token guardado:", e.message);
  }
  valor = valor || (process.env.IG_ACCESS_TOKEN || "").trim();
  tokenCache = { valor, t: Date.now() };
  return valor;
}

// Renueva el token por 60 días más y lo guarda en Firestore. Devuelve los días de validez.
async function renovarToken() {
  const actual = await token();
  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(actual)}`
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) throw new Error(`Instagram no renovó el token: ${(json.error && json.error.message) || res.status}`);
  const vence = new Date(Date.now() + (json.expires_in || 0) * 1000);
  await fs.guardar("config/instagram", { token: json.access_token, renovado: new Date(), vence });
  tokenCache = { valor: json.access_token, t: Date.now() };
  return Math.round((json.expires_in || 0) / 86400);
}

const version = () => process.env.GRAPH_VERSION || "v23.0";

// Comprueba la firma X-Hub-Signature-256 que Meta pone en cada aviso
function firmaValida(cuerpoCrudo, firma) {
  const secreto = (process.env.META_APP_SECRET || "").trim();
  if (!secreto || !firma || !firma.startsWith("sha256=")) return false;
  const esperado = crypto.createHmac("sha256", secreto).update(cuerpoCrudo).digest("hex");
  const a = Buffer.from(firma.slice(7), "hex");
  const b = Buffer.from(esperado, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Instagram acepta hasta 1000 caracteres por mensaje: los textos largos se parten por párrafos
function partir(texto, max = 950) {
  const partes = [];
  let actual = "";
  for (const parrafo of texto.split(/\n{2,}/)) {
    const candidato = actual ? `${actual}\n\n${parrafo}` : parrafo;
    if (candidato.length <= max) {
      actual = candidato;
      continue;
    }
    if (actual) partes.push(actual);
    actual = parrafo;
    while (actual.length > max) {
      partes.push(actual.slice(0, max));
      actual = actual.slice(max);
    }
  }
  if (actual) partes.push(actual);
  return partes;
}

// Envía un texto a un usuario. Devuelve los ids de los mensajes enviados.
async function enviarTexto(destinatario, texto) {
  const ids = [];
  const cuenta = (process.env.IG_USER_ID || "").trim() || "me";
  for (const parte of partir(texto)) {
    const res = await fetch(`https://graph.instagram.com/${version()}/${cuenta}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { id: destinatario }, message: { text: parte } }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Instagram ${res.status}: ${(json.error && json.error.message) || ""}`);
    if (json.message_id) ids.push(json.message_id);
  }
  return ids;
}

// Tarjetas de producto deslizables (foto, nombre, precios y botón "Ver producto"). Hasta 10 por mensaje.
// productos: [{ name, price_cash, price_transfer, url, image_link }]
async function enviarTarjetas(destinatario, productos) {
  const cuenta = (process.env.IG_USER_ID || "").trim() || "me";
  const elementos = productos.slice(0, 10).map((p) => {
    const e = {
      title: p.name.slice(0, 80),
      subtitle: `Efectivo ${p.price_cash} · Transferencia ${p.price_transfer}`.slice(0, 80),
      default_action: { type: "web_url", url: p.url },
      buttons: [{ type: "web_url", url: p.url, title: "Ver producto" }],
    };
    if (p.image_link) e.image_url = p.image_link;
    return e;
  });
  const res = await fetch(`https://graph.instagram.com/${version()}/${cuenta}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: destinatario },
      message: { attachment: { type: "template", payload: { template_type: "generic", elements: elementos } } },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Instagram tarjetas ${res.status}: ${(json.error && json.error.message) || ""}`);
  return json.message_id ? [json.message_id] : [];
}

// Nombre de usuario de quien escribe (para los avisos). Si falla, devuelve "".
async function usuarioDe(id) {
  try {
    const res = await fetch(
      `https://graph.instagram.com/${version()}/${id}?fields=username,name&access_token=${encodeURIComponent(await token())}`
    );
    const json = await res.json();
    return json.username ? `@${json.username}` : json.name || "";
  } catch (e) {
    return "";
  }
}

module.exports = { firmaValida, partir, enviarTexto, enviarTarjetas, usuarioDe, renovarToken };
