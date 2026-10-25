// Registra el celular del administrador para recibir avisos push.
// Lo llama el botón "Activar avisos" del panel /admin, con la sesión de Google del administrador.

const crypto = require("crypto");
const fs = require("./_lib/firestore");

const ADMIN_EMAILS = ["lucianoespinosa04@gmail.com"]; // misma lista que src/components/AdminRoute.jsx
const API_KEY = "AIzaSyDzq1YMmk1KGBAVB6JU7Yl9T2OJUE1XDd4"; // clave web pública de Firebase

// Comprueba la sesión de Firebase y devuelve el email si es un administrador verificado
async function emailAdmin(idToken) {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const u = json.users && json.users[0];
  return u && u.emailVerified && ADMIN_EMAILS.includes(u.email) ? u.email : null;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Usá POST" });
  const idToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const email = idToken ? await emailAdmin(idToken) : null;
  if (!email) return res.status(401).json({ error: "Solo el administrador puede activar avisos" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const token = String(body.token || "");
  if (!token || token.length > 4096) return res.status(400).json({ error: "Falta el token del dispositivo" });

  try {
    const id = crypto.createHash("sha256").update(token).digest("hex").slice(0, 40);
    await fs.guardar(`adminPush/${id}`, {
      token,
      email,
      dispositivo: String(body.dispositivo || "").slice(0, 200),
      creado: new Date(),
    });
    if (body.probar) {
      const { enviarPush } = require("./_lib/push");
      await enviarPush("✅ Avisos activados", "Desde ahora te aviso acá cuando entre un pedido por Instagram.");
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
