// Lógica del vendedor automático de Instagram: arma la respuesta con Gemini usando el catálogo en vivo,
// guarda la conversación en Firestore ("igConversaciones"), registra pedidos ("igPedidos")
// y le avisa a Luciano con una notificación push.

const fs = require("./firestore");
const { leerCatalogo, lineaParaBot } = require("./catalogo");
const { generar } = require("./gemini");
const ig = require("./instagram");
const { enviarPush } = require("./push");

const MAX_HISTORIAL = 20; // mensajes que se le pasan al modelo
const PAUSA_MS = 12 * 60 * 60 * 1000; // si Luciano responde a mano, el bot se calla 12 horas en ese chat
const ZONA = "America/Argentina/Buenos_Aires";

const ahoraTexto = () =>
  new Date().toLocaleString("es-AR", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

function instrucciones(catalogo) {
  return `Sos el vendedor de Al Fallo Suplementos, una tienda de suplementos deportivos 100% originales en Buenos Aires (tienda online: https://alfallo.vercel.app). Respondés los mensajes directos de Instagram de @alfallo.suplementos. Ahora es ${ahoraTexto()}.

CÓMO ESCRIBIR
- Español rioplatense con voseo, cercano y con buena onda.
- Mensajes MUY cortos, como una persona en un chat de Instagram: 1 a 3 oraciones, máximo unas 300 letras. Una idea por mensaje.
- Texto plano: Instagram no muestra negritas ni markdown. No uses asteriscos, numerales ni guiones de lista.
- NUNCA escribas links ni direcciones web en el texto. Para mostrar productos usá la herramienta mostrar_productos: le llegan al cliente como tarjetas con foto, precios y un botón "Ver producto".
- Si necesitás nombrar varios productos en el texto, uno por renglón y sin repetir los precios que ya van en las tarjetas.
- Nunca inventes productos, precios, sabores ni datos. Usá solo el catálogo de abajo y esta información. Si algo no está, decilo y ofrecé que el vendedor lo confirme.

PRODUCTOS Y PRECIOS
- Cuando recomiendes productos (máximo 3), llamá a mostrar_productos con sus id del catálogo y en el texto escribí solo una frase corta (por ejemplo: "¡Hola! Te paso estas opciones de creatina 👇 ¿Qué tamaño buscás?"). Las tarjetas ya muestran nombre, precio en efectivo y con transferencia.
- Si el cliente pregunta el precio de un producto puntual, podés decirlo en el texto (efectivo y transferencia) y además mostrar su tarjeta.
- El precio con transferencia incluye 7,5% de recargo bancario. Explicalo así si preguntan por qué hay dos precios.
- Si piden algo genérico ("barritas", "creatina", "proteína"), ofrecé 2 o 3 opciones y preguntá tamaño, sabor o presupuesto. Si no tienen preferencia de marca, priorizá Pitbull, Xtrenght y Star Nutrition.
- Los productos marcados SIN STOCK no se pueden pedir por ahora: ofrecé una alternativa parecida.
- No des consejos médicos. Si preguntan por dosis, embarazo, medicación o problemas de salud, sugerí consultar con un profesional.

DISPONIBILIDAD
- Nunca afirmes que un producto está en stock ni prometas fecha de entrega.
- Nunca menciones proveedores ni de dónde salen los productos.
- Si preguntan por stock o sabores, decí que el vendedor le confirma la disponibilidad y los sabores a la brevedad.

PAGOS Y ENVÍOS
- Solo efectivo y transferencia. No hay tarjeta ni cuotas.
- Envío gratis en Paternal y Villa Crespo. Otras zonas: el envío se coordina con el vendedor (costo a convenir).
- No hay promociones vigentes, salvo los productos que figuran en oferta en el catálogo.
- No pidas pagos ni des datos bancarios: el pago se coordina con el vendedor cuando confirma el pedido.

PEDIDOS
- Cuando el cliente quiera comprar, pedile lo que falte: productos, cantidad, sabor (si el producto tiene sabores), nombre, teléfono, barrio o dirección de entrega y si paga en efectivo o transferencia.
- Con todos esos datos, usá la herramienta registrar_pedido. Después pasale un resumen con el total estimado según el medio de pago y decile que el vendedor le escribe a la brevedad para confirmar el pedido y coordinar pago y entrega.
- Si tiene un reclamo, una consulta que no podés resolver o pide hablar con una persona, usá avisar_al_vendedor y decile que en breve le responde.
- Nunca pidas datos de tarjetas ni contraseñas.

CATÁLOGO ACTUAL (marca nombre presentación | categoría | precios | sabores | id para mostrar_productos)
${catalogo.map(lineaParaBot).join("\n")}`;
}

const HERRAMIENTAS = [
  {
    name: "mostrar_productos",
    description: "Le muestra al cliente tarjetas de producto con foto, precios y botón para ver el producto en la web. Usala siempre que recomiendes o nombres productos concretos (máximo 3).",
    parameters: {
      type: "object",
      properties: {
        ids: { type: "array", items: { type: "string" }, description: "Los id del catálogo (lo que va después de 'id:')" },
      },
      required: ["ids"],
    },
  },
  {
    name: "registrar_pedido",
    description: "Registra un pedido del cliente cuando ya tenés todos los datos. Le avisa al vendedor para que confirme.",
    parameters: {
      type: "object",
      properties: {
        productos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              producto: { type: "string", description: "Marca, nombre y presentación tal como figura en el catálogo" },
              cantidad: { type: "integer" },
              sabor: { type: "string" },
            },
            required: ["producto", "cantidad"],
          },
        },
        nombre: { type: "string" },
        telefono: { type: "string" },
        zona_o_direccion: { type: "string" },
        medio_pago: { type: "string", enum: ["efectivo", "transferencia"] },
        total_estimado: { type: "number", description: "Total en pesos según el medio de pago elegido" },
        notas: { type: "string" },
      },
      required: ["productos", "nombre", "telefono", "zona_o_direccion", "medio_pago", "total_estimado"],
    },
  },
  {
    name: "avisar_al_vendedor",
    description: "Le avisa al vendedor que este cliente necesita que le responda una persona (reclamo, consulta que no podés resolver o pedido de hablar con alguien).",
    parameters: {
      type: "object",
      properties: { motivo: { type: "string" } },
      required: ["motivo"],
    },
  },
];

// Saca links de la tienda del texto y los renglones que quedan vacíos
const limpiarLinks = (t) =>
  (t || "")
    .replace(/\(?\s*https?:\/\/alfallo\.vercel\.app\/item\/\S+\s*\)?/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const pesos = (n) => "$" + Math.round(Number(n) || 0).toLocaleString("es-AR");
const recortar = (lista, n) => lista.slice(Math.max(0, lista.length - n));

function nuevaConversacion() {
  return { historial: [], procesados: [], idsBot: [], pausadoHasta: "", enviandoHasta: "", usuario: "", ultimoAviso: "" };
}

async function leerConversacion(clienteId) {
  return { ...nuevaConversacion(), ...((await fs.leer(`igConversaciones/${clienteId}`)) || {}) };
}

const guardarConversacion = (clienteId, conv) => {
  const { id, ...datos } = conv;
  return fs.guardar(`igConversaciones/${clienteId}`, datos);
};

// Ejecuta una herramienta que pidió el modelo y devuelve la respuesta para él
async function ejecutar(llamada, clienteId, conv, turno) {
  const quien = conv.usuario || `cliente ${clienteId}`;
  if (llamada.name === "mostrar_productos") {
    const pedidos = (llamada.args.ids || []).map((x) => String(x).replace(/^id:/, "").trim());
    const elegidos = pedidos.map((id) => turno.catalogo.find((p) => p.id === id)).filter(Boolean);
    for (const p of elegidos) if (!turno.tarjetas.some((t) => t.id === p.id)) turno.tarjetas.push(p);
    turno.tarjetas = turno.tarjetas.slice(0, 5);
    return elegidos.length
      ? { ok: true, mostrados: elegidos.map((p) => p.name), nota: "No repitas los links ni los precios de las tarjetas en el texto." }
      : { ok: false, error: "Ningún id coincide con el catálogo" };
  }
  if (llamada.name === "registrar_pedido") {
    const a = llamada.args;
    const productos = (a.productos || []).map((p) => `${p.cantidad || 1}x ${p.producto}${p.sabor ? ` (${p.sabor})` : ""}`);
    const id = await fs.agregar("igPedidos", {
      clienteId,
      usuario: conv.usuario || "",
      productos: a.productos || [],
      nombre: a.nombre || "",
      telefono: a.telefono || "",
      zona: a.zona_o_direccion || "",
      medioPago: a.medio_pago || "",
      totalEstimado: Number(a.total_estimado) || 0,
      notas: a.notas || "",
      estado: "pendiente",
      creado: new Date(),
    });
    await enviarPush(
      `🛒 Pedido nuevo de ${a.nombre || quien}`,
      `${productos.join(", ")}\n${a.zona_o_direccion || ""} · ${a.medio_pago || ""} · ${pesos(a.total_estimado)}\nTel: ${a.telefono || "-"} · ${quien}`,
      "https://www.instagram.com/direct/inbox/"
    );
    return { ok: true, pedido: id };
  }
  if (llamada.name === "avisar_al_vendedor") {
    await enviarPush(`🙋 ${quien} necesita que le respondas`, llamada.args.motivo || "Consulta en Instagram", "https://www.instagram.com/direct/inbox/");
    conv.pausadoHasta = new Date(Date.now() + PAUSA_MS).toISOString();
    return { ok: true };
  }
  return { ok: false, error: "herramienta desconocida" };
}

// Mensaje de un cliente: arma la respuesta y la manda
// canal: cómo se mandan los mensajes (Instagram de verdad, o uno de mentira para /api/bot-prueba)
async function responderCliente(clienteId, mid, texto, canal = ig) {
  const conv = await leerConversacion(clienteId);
  if (mid && conv.procesados.includes(mid)) return "repetido"; // Meta a veces reenvía el mismo aviso
  conv.procesados = recortar([...conv.procesados, mid].filter(Boolean), 50);
  if (!conv.usuario && canal === ig) conv.usuario = await ig.usuarioDe(clienteId);
  conv.historial = recortar([...conv.historial, { rol: "cliente", texto, t: new Date().toISOString() }], 40);

  // Luciano está atendiendo este chat a mano: el bot no responde, solo guarda el mensaje
  if (conv.pausadoHasta && Date.now() < Date.parse(conv.pausadoHasta)) {
    await guardarConversacion(clienteId, conv);
    return "pausado";
  }

  let respuesta = "";
  const turno = { catalogo: [], tarjetas: [] };
  try {
    const catalogo = await leerCatalogo();
    turno.catalogo = catalogo;
    // Mensajes seguidos del mismo lado (por ejemplo, varios del cliente) van juntos en un solo turno
    const contents = [];
    for (const m of recortar(conv.historial, MAX_HISTORIAL)) {
      const role = m.rol === "cliente" ? "user" : "model";
      const ultimo = contents[contents.length - 1];
      if (ultimo && ultimo.role === role) ultimo.parts.push({ text: m.texto });
      else contents.push({ role, parts: [{ text: m.texto }] });
    }
    // Gemini exige que la conversación empiece con un mensaje del cliente
    while (contents.length && contents[0].role !== "user") contents.shift();

    for (let vuelta = 0; vuelta < 4; vuelta++) {
      const r = await generar({ instrucciones: instrucciones(catalogo), contents, herramientas: HERRAMIENTAS });
      if (!r.llamadas.length) {
        respuesta = r.texto;
        break;
      }
      contents.push(r.contenido);
      const resultados = [];
      for (const ll of r.llamadas) {
        resultados.push({ functionResponse: { name: ll.name, response: await ejecutar(ll, clienteId, conv, turno) } });
      }
      contents.push({ role: "user", parts: resultados });
    }
  } catch (e) {
    console.error("El bot no pudo generar respuesta:", e.message);
    // Si se acabó el cupo gratis o falló Gemini: respuesta de cortesía y aviso (como mucho uno por hora por chat)
    if (!conv.ultimoAviso || Date.now() - Date.parse(conv.ultimoAviso) > 60 * 60 * 1000) {
      respuesta = "¡Hola! 👋 Gracias por escribirnos. En un ratito te respondemos. Mientras tanto podés ver todos los productos y precios en https://alfallo.vercel.app";
      conv.ultimoAviso = new Date().toISOString();
      await enviarPush(`⚠️ El bot no pudo responder a ${conv.usuario || "un cliente"}`, `Mensaje: "${texto.slice(0, 200)}"\nError: ${e.message.slice(0, 200)}`, "https://www.instagram.com/direct/inbox/");
    }
  }

  // Por las dudas: si el modelo igual escribió links de productos, se sacan del texto (van en las tarjetas)
  if (turno.tarjetas.length) respuesta = limpiarLinks(respuesta);

  if (respuesta || turno.tarjetas.length) {
    // Mientras se envía, los ecos de Instagram son del bot (no de Luciano escribiendo a mano)
    conv.enviandoHasta = new Date(Date.now() + 60 * 1000).toISOString();
    await guardarConversacion(clienteId, conv);
    let ids = [];
    if (respuesta) ids = ids.concat(await canal.enviarTexto(clienteId, respuesta));
    if (turno.tarjetas.length) {
      try {
        ids = ids.concat(await canal.enviarTarjetas(clienteId, turno.tarjetas));
      } catch (e) {
        // Si Instagram no acepta las tarjetas, se mandan como texto: un producto por renglón y el link aparte
        console.error(e.message);
        const lista = turno.tarjetas.map((p) => `${p.name}\nEfectivo ${p.price_cash} · Transferencia ${p.price_transfer}\n${p.url}`).join("\n\n");
        ids = ids.concat(await canal.enviarTexto(clienteId, lista));
      }
    }
    conv.idsBot = recortar([...conv.idsBot, ...ids], 50);
    const registro = [respuesta, turno.tarjetas.length ? `[Tarjetas mostradas: ${turno.tarjetas.map((p) => p.name).join(", ")}]` : ""].filter(Boolean).join("\n");
    conv.historial = recortar([...conv.historial, { rol: "bot", texto: registro, t: new Date().toISOString() }], 40);
  }
  conv.enviandoHasta = "";
  await guardarConversacion(clienteId, conv);
  return respuesta || turno.tarjetas.length
    ? { estado: "respondido", respuesta, tarjetas: turno.tarjetas.map((p) => ({ nombre: p.name, efectivo: p.price_cash, transferencia: p.price_transfer, url: p.url, foto: p.image_link })) }
    : { estado: "sin respuesta" };
}

// Eco: un mensaje que salió de la cuenta de la tienda. Si no lo mandó el bot, lo escribió Luciano a mano.
async function registrarEco(clienteId, mid, texto) {
  const conv = await leerConversacion(clienteId);
  if (conv.idsBot.includes(mid)) return "eco del bot";
  if (conv.enviandoHasta && Date.now() < Date.parse(conv.enviandoHasta)) return "eco del bot";
  if (/#bot\b/i.test(texto || "")) {
    conv.pausadoHasta = ""; // Luciano escribe "#bot" en el chat para devolverle la conversación al bot
  } else {
    conv.pausadoHasta = new Date(Date.now() + PAUSA_MS).toISOString();
    conv.historial = recortar([...conv.historial, { rol: "bot", texto: texto || "", t: new Date().toISOString() }], 40);
  }
  await guardarConversacion(clienteId, conv);
  return conv.pausadoHasta ? "pausado por respuesta manual" : "bot reactivado";
}

// Procesa el cuerpo completo de un aviso de Meta
async function procesarAviso(aviso) {
  const resultados = [];
  if (!aviso || aviso.object !== "instagram") return resultados;
  const cuentaTienda = process.env.IG_USER_ID || "";
  for (const entrada of aviso.entry || []) {
    for (const ev of entrada.messaging || []) {
      const m = ev.message;
      if (!m || m.is_deleted || m.is_unsupported) continue;
      const deTienda = m.is_echo || (cuentaTienda && ev.sender && ev.sender.id === cuentaTienda);
      if (deTienda) {
        resultados.push(await registrarEco(ev.recipient.id, m.mid, m.text));
        continue;
      }
      let texto = (m.text || "").trim();
      if (!texto && m.attachments && m.attachments.length) {
        texto = `[El cliente mandó un archivo (${m.attachments.map((x) => x.type).join(", ")}) que no podés ver. Pedile que te lo escriba.]`;
      }
      if (!texto) continue;
      resultados.push(await responderCliente(ev.sender.id, m.mid, texto));
    }
  }
  return resultados;
}

module.exports = { procesarAviso, responderCliente, registrarEco, instrucciones, HERRAMIENTAS };
