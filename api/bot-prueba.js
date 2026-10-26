// Para probar el bot sin Instagram (sirve antes de que Meta apruebe la app).
// POST https://alfallo.vercel.app/api/bot-prueba  con JSON { "clave": "...", "texto": "Hola, quiero creatina" }
// La clave es la variable de entorno BOT_TEST_KEY. Opcional: "chat" para separar conversaciones de prueba
// y "reiniciar": true para empezar de cero. Los pedidos de prueba se guardan y mandan el aviso push igual.

const fs = require("./_lib/firestore");
const { responderCliente } = require("./_lib/bot");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Usá POST" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  if (!process.env.BOT_TEST_KEY || body.clave !== process.env.BOT_TEST_KEY) {
    return res.status(401).json({ error: "Clave incorrecta" });
  }
  const chat = `prueba-${String(body.chat || "1").replace(/[^\w-]/g, "").slice(0, 30)}`;
  try {
    if (body.reiniciar) await fs.borrar(`igConversaciones/${chat}`);
    if (!body.texto) return res.status(200).json({ ok: true, chat, mensaje: "Conversación reiniciada" });
    const r = await responderCliente(chat, `${chat}-${Date.now()}`, String(body.texto), { enviarTexto: async () => [], enviarTarjetas: async () => [] });
    return res.status(200).json({ chat, ...(typeof r === "string" ? { estado: r } : r) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
