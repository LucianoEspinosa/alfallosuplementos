// Notificaciones push al celular del administrador (app "Al Fallo Admin"), con Firebase Cloud Messaging.
// Los dispositivos se registran desde el panel /admin (botón "Activar avisos") y quedan en la colección "adminPush".

const fs = require("./firestore");

async function enviarPush(titulo, cuerpo, link = "https://alfallo.vercel.app/admin") {
  let dispositivos = [];
  try {
    dispositivos = await fs.listar("adminPush");
  } catch (e) {
    console.error("No se pudieron leer los dispositivos para avisos:", e.message);
    return 0;
  }
  const token = await fs.tokenDeAcceso();
  let enviados = 0;
  for (const d of dispositivos) {
    if (!d.token) continue;
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${fs.PROYECTO}/messages:send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          token: d.token,
          notification: { title: titulo, body: cuerpo.slice(0, 900) },
          webpush: {
            notification: { icon: "/icon-admin-192.png", badge: "/icon-admin-192.png", requireInteraction: true },
            fcm_options: { link },
          },
        },
      }),
    });
    if (res.ok) {
      enviados++;
    } else {
      const json = await res.json().catch(() => ({}));
      const codigo = (json.error && json.error.status) || res.status;
      console.error("Push no enviada:", codigo, json.error && json.error.message);
      // Dispositivo dado de baja (desinstaló la app o borró los permisos): se olvida
      if (codigo === "NOT_FOUND" || codigo === "UNREGISTERED" || res.status === 404) {
        await fs.borrar(`adminPush/${d.id}`).catch(() => {});
      }
    }
  }
  return enviados;
}

module.exports = { enviarPush };
