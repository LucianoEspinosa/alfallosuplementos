// Renueva el token de Instagram (dura 60 días). Lo llama Vercel Cron los días 1 y 15 de cada mes (ver vercel.json).
// Si falla, avisa con una notificación push.
const { renovarToken } = require("./_lib/instagram");
const { enviarPush } = require("./_lib/push");

module.exports = async (req, res) => {
  // Si está configurada CRON_SECRET en Vercel, solo acepta llamadas de Vercel Cron
  const secreto = (process.env.CRON_SECRET || "").trim();
  if (secreto && req.headers.authorization !== `Bearer ${secreto}`) return res.status(401).json({ error: "No autorizado" });
  try {
    const dias = await renovarToken();
    console.log(`Token de Instagram renovado: vale ${dias} días`);
    return res.status(200).json({ ok: true, dias });
  } catch (e) {
    console.error(e.message);
    await enviarPush("⚠️ No se pudo renovar el token de Instagram", `${e.message.slice(0, 300)}\nSi no se arregla, el bot deja de responder cuando venza.`).catch(() => {});
    return res.status(500).json({ error: e.message });
  }
};
