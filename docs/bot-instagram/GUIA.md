# Bot de Instagram con Gemini — guía para activarlo

Bot propio de Al Fallo Suplementos que responde los mensajes directos de **@alfallo.suplementos**, sin MyChatBot.

- **Precios en vivo:** salen de Firestore en el momento, igual que en la web.
- **Toma pedidos** y te avisa con una **notificación push** en la app Al Fallo Admin.
- **Si respondés vos a mano** en un chat, el bot se calla 12 horas en esa conversación. Para devolvérsela antes, escribí `#bot` en ese chat.
- **Costo:** $0. Usa el plan gratuito de Gemini; Vercel y Firebase siguen igual que hoy.

El código ya está listo en la rama `bot-instagram` del repo. Falta conseguir las claves y cargarlas.

---

## Paso 1 — Clave de Gemini (5 min)

1. Entrá a https://aistudio.google.com/apikey con tu cuenta de Google.
2. Tocá **Create API key**, elegí el proyecto `fragancesnet` (o uno nuevo) y copiá la clave.
3. Guardala para el paso 5 como `GEMINI_API_KEY`.

> El plan gratis tiene un tope de mensajes por minuto y por día. Si se pasa, el bot contesta "En un ratito te respondemos" con el link a la web y te avisa por push. En el plan gratis, Google puede usar las conversaciones para mejorar sus modelos.

## Paso 2 — Clave de Firebase para el servidor (5 min)

1. Abrí https://console.firebase.google.com → proyecto **fragancesnet** → ⚙️ **Configuración del proyecto** → pestaña **Cuentas de servicio**.
2. Tocá **Generar nueva clave privada**. Se descarga un archivo `.json`.
3. Ese archivo es la variable `FIREBASE_SERVICE_ACCOUNT`: se pega el contenido completo. **No lo compartas con nadie ni lo subas al repo.**

## Paso 3 — Clave para las notificaciones push (2 min)

1. En la misma **Configuración del proyecto** → pestaña **Cloud Messaging**.
2. Bajá hasta **Certificados push web** → **Generar par de claves**.
3. Copiá la clave que aparece: es `REACT_APP_FCM_VAPID_KEY`.

## Paso 4 — App de Meta para Instagram (30–60 min)

1. **En Instagram (celular):** Configuración → **Mensajes y respuestas a historias** → **Herramientas conectadas** → activá **Permitir acceso a los mensajes**.
2. Entrá a https://developers.facebook.com → **Mis apps** → **Crear app**. Elegí el caso de uso para **administrar mensajes de Instagram** (API de Instagram).
3. En el producto **Instagram** → **Configuración de la API con inicio de sesión de Instagram**:
   - **Generar tokens de acceso:** agregá la cuenta @alfallo.suplementos y copiá el **token** (`IG_ACCESS_TOKEN`) y el **id de la cuenta** (`IG_USER_ID`).
   - **Configurar webhooks:**
     - URL de devolución de llamada: `https://alfallo.vercel.app/api/instagram-webhook`
     - Token de verificación: inventá una palabra secreta (por ejemplo `alfallo-bot-2026`). Es `IG_VERIFY_TOKEN`.
     - Suscribite al campo **messages**.
     - ⚠️ La verificación del webhook va a funcionar recién después del paso 6, cuando el código esté publicado.
4. En **Configuración de la app** → **Básica** (o en la sección de Instagram), copiá la **clave secreta de la app de Instagram**: es `META_APP_SECRET`.
5. **Revisión de la app:** pedí **acceso avanzado** al permiso `instagram_business_manage_messages`. Meta pide una explicación y un video corto del bot funcionando. Hasta que lo aprueben, el bot **solo responde a cuentas agregadas como evaluadoras** de la app, y sirve para probar.

## Paso 5 — Cargar las variables en Vercel (5 min)

En https://vercel.com → proyecto de la tienda → **Settings** → **Environment Variables**, cargá todas para **Production** (y **Preview** si querés probar antes):

| Variable | De dónde sale |
|---|---|
| `GEMINI_API_KEY` | Paso 1 |
| `FIREBASE_SERVICE_ACCOUNT` | Paso 2 (contenido completo del .json) |
| `REACT_APP_FCM_VAPID_KEY` | Paso 3 |
| `IG_ACCESS_TOKEN` | Paso 4 |
| `IG_USER_ID` | Paso 4 |
| `IG_VERIFY_TOKEN` | Paso 4 (la palabra que inventaste) |
| `META_APP_SECRET` | Paso 4 |
| `BOT_TEST_KEY` | Inventá otra palabra secreta, para probar el bot sin Instagram |

Opcional: `GEMINI_MODEL` (por defecto `gemini-3.8-flash`).

## Paso 6 — Publicar y probar

1. Se une la rama `bot-instagram` a `main`. Vercel publica solo.
2. **Probar el bot sin Instagram:** Claude llama a `POST /api/bot-prueba` con `{ "clave": BOT_TEST_KEY, "texto": "Hola, quiero creatina" }` y ve qué responde.
3. **Activar avisos en el celular:**
   - **Android:** abrí `alfallo.vercel.app/admin` en Chrome → instalá la app → **Activar avisos**.
   - **iPhone:** abrí la web en Safari → Compartir → **Agregar a inicio** → abrí la app desde el ícono → **Activar avisos**.
   - Te tiene que llegar una notificación de prueba.
4. Volver a Meta y **verificar el webhook** (paso 4.3).
5. Mandar un mensaje a @alfallo.suplementos desde una cuenta evaluadora y ver que responda.

## Paso 7 — Pasar de MyChatBot al bot propio

Cuando Meta apruebe el permiso:

1. **Desconectar Instagram de MyChatBot**, en Canales. Si no, los dos bots responden a la vez.
2. Listo. MyChatBot se puede dejar vencer el 7/11 sin pagar.

---

## Qué hay en el código

| Archivo | Qué hace |
|---|---|
| `api/instagram-webhook.js` | Recibe los mensajes de Meta, comprueba la firma y responde. |
| `api/_lib/bot.js` | Instrucciones del vendedor, uso de Gemini, pedidos, pausa cuando respondés a mano. |
| `api/_lib/catalogo.js` | Catálogo en vivo desde Firestore (lo usan el bot y `/api/catalogo`). |
| `api/_lib/gemini.js` | Llamada a Gemini. |
| `api/_lib/instagram.js` | Envío de mensajes y verificación de firma. |
| `api/_lib/firestore.js` | Firestore y token de Google, sin dependencias. |
| `api/_lib/push.js` | Notificaciones push. |
| `api/push-token.js` | Registra tu celular para los avisos (solo con tu cuenta de administrador). |
| `api/bot-prueba.js` | Probar el bot sin Instagram. |
| `public/firebase-messaging-sw.js` | Recibe los avisos con la app cerrada. |
| `src/components/AvisosPush.jsx` | Botón "Activar avisos" en el panel /admin. |

**Datos que guarda en Firestore** (solo los lee el servidor; las reglas actuales ya los cierran al público):

- `igConversaciones`: historial de cada chat, últimos 40 mensajes.
- `igPedidos`: pedidos tomados por el bot.
- `adminPush`: tus dispositivos para avisos.

## Pendiente para después

- El token de Instagram dura unos 60 días. Hay que renovarlo, o armar la renovación automática.
- Ver los pedidos de Instagram (`igPedidos`) en la pantalla de Órdenes del panel.
- Avisos push también para los pedidos que entran por la web: requiere publicar la Cloud Function.
