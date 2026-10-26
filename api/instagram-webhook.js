// Dirección que Meta llama cada vez que llega un mensaje directo a @alfallo.suplementos.
// URL para cargar en la app de Meta: https://alfallo.vercel.app/api/instagram-webhook
// Variables de entorno: IG_VERIFY_TOKEN (cualquier palabra secreta, la misma que se carga en Meta),
// META_APP_SECRET, IG_ACCESS_TOKEN, IG_USER_ID, GEMINI_API_KEY, FIREBASE_SERVICE_ACCOUNT.

const { firmaValida } = require("./_lib/instagram");
const { procesarAviso } = require("./_lib/bot");

async function cuerpoCrudo(req) {
  const partes = [];
  for await (const parte of req) partes.push(typeof parte === "string" ? Buffer.from(parte) : parte);
  return Buffer.concat(partes);
}

module.exports = async (req, res) => {
  // 1) Verificación: Meta comprueba la dirección una sola vez al configurarla
  if (req.method === "GET") {
    const q = req.query || {};
    // Se ignoran espacios o saltos de línea que se cuelan al copiar y pegar
    const esperado = (process.env.IG_VERIFY_TOKEN || "").trim();
    const recibido = String(q["hub.verify_token"] || "").trim();
    if (q["hub.mode"] === "subscribe" && esperado && recibido === esperado) {
      return res.status(200).send(q["hub.challenge"]);
    }
    return res.status(403).send("Token de verificación incorrecto");
  }
  if (req.method !== "POST") return res.status(405).send("Método no permitido");

  // 2) Aviso de mensaje: se comprueba que venga de Meta antes de hacer nada
  const crudo = await cuerpoCrudo(req);
  if (!firmaValida(crudo, req.headers["x-hub-signature-256"])) {
    console.warn("Aviso rechazado: firma inválida");
    return res.status(401).send("Firma inválida");
  }

  let aviso;
  try {
    aviso = JSON.parse(crudo.toString("utf8"));
  } catch (e) {
    return res.status(400).send("JSON inválido");
  }

  try {
    const resultado = await procesarAviso(aviso);
    console.log("Aviso procesado:", JSON.stringify(resultado).slice(0, 500));
  } catch (e) {
    // Se responde 200 igual: si no, Meta reenvía el aviso y el cliente podría recibir respuestas repetidas
    console.error("Error procesando el aviso:", e);
  }
  return res.status(200).send("ok");
};
