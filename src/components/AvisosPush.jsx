import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

// Clave pública VAPID de Firebase Cloud Messaging (Configuración del proyecto > Cloud Messaging > Certificados push web).
// Se carga en Vercel como variable de entorno REACT_APP_FCM_VAPID_KEY.
const VAPID_KEY = process.env.REACT_APP_FCM_VAPID_KEY || "";

// Botón del panel para recibir en este celular los avisos de pedidos del bot de Instagram
const AvisosPush = () => {
    const [estado, setEstado] = useState("");
    const [activo, setActivo] = useState(() => typeof Notification !== "undefined" && Notification.permission === "granted");

    // Con la app abierta Firebase no muestra la notificación sola: se muestra a mano
    useEffect(() => {
        let cancelar = () => {};
        isSupported().then((ok) => {
            if (!ok || !activo) return;
            cancelar = onMessage(getMessaging(), async (payload) => {
                const n = payload.notification || {};
                const reg = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
                if (reg) reg.showNotification(n.title || "Al Fallo", { body: n.body || "", icon: "/icon-admin-192.png" });
            });
        });
        return () => cancelar();
    }, [activo]);

    const activar = async () => {
        try {
            if (!VAPID_KEY) return setEstado("Falta configurar la clave REACT_APP_FCM_VAPID_KEY en Vercel.");
            if (!(await isSupported()) || !("serviceWorker" in navigator)) {
                return setEstado("Este navegador no admite avisos. En iPhone, primero agregá la app a la pantalla de inicio y abrila desde ahí.");
            }
            setEstado("Pidiendo permiso…");
            const permiso = await Notification.requestPermission();
            if (permiso !== "granted") return setEstado("No diste permiso para notificaciones. Activalo en los ajustes del navegador.");

            const registro = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            const token = await getToken(getMessaging(), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registro });
            const usuario = getAuth().currentUser;
            if (!usuario) return setEstado("Iniciá sesión de nuevo.");

            const res = await fetch("/api/push-token", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario.getIdToken()}` },
                body: JSON.stringify({ token, dispositivo: navigator.userAgent, probar: true }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) return setEstado(json.error || "No se pudo registrar este dispositivo.");
            setActivo(true);
            setEstado("¡Listo! Te mandé una notificación de prueba.");
        } catch (e) {
            console.error(e);
            setEstado("No se pudieron activar los avisos: " + e.message);
        }
    };

    return (
        <section className="adm-card" style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                <div>
                    <h2 className="adm-h2" style={{ margin: 0 }}>Avisos de pedidos</h2>
                    <p style={{ margin: "4px 0 0", opacity: 0.75, fontSize: 14 }}>
                        {activo ? "Este dispositivo recibe los avisos del bot de Instagram." : "Recibí en este celular los pedidos del bot de Instagram."}
                    </p>
                </div>
                <button type="button" className="btn btn-dark" onClick={activar}>
                    {activo ? "Probar / reactivar" : "Activar avisos"}
                </button>
            </div>
            {estado && <p style={{ margin: "10px 0 0", fontSize: 14 }}>{estado}</p>}
        </section>
    );
};

export default AvisosPush;
