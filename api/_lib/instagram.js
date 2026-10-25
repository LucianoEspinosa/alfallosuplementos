// Mensajes directos de Instagram con la API oficial de Meta ("Instagram API con inicio de sesión de Instagram").
// Variables de entorno:
//   IG_ACCESS_TOKEN  token de la cuenta @alfallo.suplementos (se genera en el panel de la app de Meta)
//   IG_USER_ID       id de la cuenta de Instagram (aparece junto al token)
//   META_APP_SECRET  "clave secreta de la app de Instagram", para comprobar que los avisos vienen de Meta
//   GRAPH_VERSION    opcional, versión de la API (por defecto v23.0)

const crypto = require("crypto");

const version = () => process.env.GRAPH_VERSION || "v23.0";

// Comprueba la firma X-Hub-Signature-256 que Meta pone en cada aviso
function firmaValida(cuerpoCrudo, firma) {
  const secreto = process.env.META_APP_SECRET;
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
  const cuenta = process.env.IG_USER_ID || "me";
  for (const parte of partir(texto)) {
    const res = await fetch(`https://graph.instagram.com/${version()}/${cuenta}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.IG_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { id: destinatario }, message: { text: parte } }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Instagram ${res.status}: ${(json.error && json.error.message) || ""}`);
    if (json.message_id) ids.push(json.message_id);
  }
  return ids;
}

// Nombre de usuario de quien escribe (para los avisos). Si falla, devuelve "".
async function usuarioDe(id) {
  try {
    const res = await fetch(
      `https://graph.instagram.com/${version()}/${id}?fields=username,name&access_token=${encodeURIComponent(process.env.IG_ACCESS_TOKEN || "")}`
    );
    const json = await res.json();
    return json.username ? `@${json.username}` : json.name || "";
  } catch (e) {
    return "";
  }
}

module.exports = { firmaValida, partir, enviarTexto, usuarioDe };
