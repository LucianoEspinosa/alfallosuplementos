// Arma el correo de aviso de un pedido nuevo: asunto y HTML legible (estilos en línea para Gmail).

const ZONA = "America/Argentina/Buenos_Aires";

const escapeHtml = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const plata = (n) => "$" + Math.round(Number(n) || 0).toLocaleString("es-AR");

const fecha = (valor) => {
    if (valor && typeof valor.toDate === "function") valor = valor.toDate();
    const d = valor instanceof Date ? valor : null;
    return d ? d.toLocaleString("es-AR", { timeZone: ZONA, dateStyle: "short", timeStyle: "short" }) : String(valor || "");
};

// Teléfono argentino -> link de WhatsApp (549 + número sin 0 ni 15)
const linkWhatsapp = (telefono) => {
    let n = String(telefono || "").replace(/\D/g, "");
    if (!n) return "";
    if (n.startsWith("549")) return `https://wa.me/${n}`;
    if (n.startsWith("54")) n = n.slice(2);
    n = n.replace(/^0/, "");
    if (n.length === 12 && n.slice(2, 4) === "15") n = n.slice(0, 2) + n.slice(4); // 11 15 xxxx xxxx
    return `https://wa.me/549${n}`;
};

const METODOS = { efectivo: "Efectivo", transferencia: "Transferencia", mercadopago: "Mercado Pago" };

const fila = (etiqueta, valor, destacado) => `
    <tr>
      <td style="padding:6px 0;color:#555;font-size:14px">${etiqueta}</td>
      <td style="padding:6px 0;text-align:right;font-size:${destacado ? "20px" : "14px"};font-weight:${destacado ? "700" : "400"};color:${destacado ? "#15803d" : "#111"}">${valor}</td>
    </tr>`;

const construirEmailPedido = (orderId, orden) => {
    const buyer = orden.buyer || {};
    const payment = orden.payment || {};
    const discount = orden.discount || {};
    const items = Array.isArray(orden.items) ? orden.items : [];

    const cantidadTotal = items.reduce((s, it) => s + (Number(it && it.quantity) || 0), 0);
    const total = payment.total != null ? payment.total : orden.total;
    const metodo = METODOS[payment.method] || payment.method || "Sin indicar";
    const wa = linkWhatsapp(buyer.phone);

    const filasItems = items.map((it) => {
        const cantidad = Number(it.quantity) || 0;
        const detalle = [it.presentacion, it.saborSeleccionado && `Sabor: ${it.saborSeleccionado}`]
            .filter(Boolean).map(escapeHtml).join(" · ");
        const conDescuento = it.priceOriginal && Number(it.priceOriginal) > Number(it.price);
        return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#111">
            <b>${escapeHtml(it.title || it.nombre || it.id)}</b>
            ${detalle ? `<br><span style="color:#666;font-size:13px">${detalle}</span>` : ""}
            <br><span style="color:#666;font-size:13px">${cantidad} × ${plata(it.price)}${conDescuento ? ` <s style="color:#999">${plata(it.priceOriginal)}</s>` : ""}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px;font-weight:700;color:#111;white-space:nowrap;vertical-align:top">
            ${plata((Number(it.price) || 0) * cantidad)}
          </td>
        </tr>`;
    }).join("");

    const descuentoAplicado = discount.applied || Number(payment.discount) > 0;
    const recargo = payment.surcharge_applied || Number(payment.surcharge) > 0;

    const asunto = `🛒 Nuevo pedido ${plata(total)} · ${buyer.name || "Cliente"} · ${metodo}`;

    const html = `
<div style="background:#f4f4f5;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7">

    <div style="background:#101214;padding:20px 24px">
      <div style="color:#4ADE80;font-size:12px;letter-spacing:2px;text-transform:uppercase">Nuevo pedido</div>
      <div style="color:#fff;font-size:28px;font-weight:700;margin-top:4px">${plata(total)}</div>
      <div style="color:#9A9FA5;font-size:13px;margin-top:4px">
        ${escapeHtml(fecha(orden.date || orden.timestamp))} · ${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"} · ${escapeHtml(metodo)}
      </div>
    </div>

    <div style="padding:20px 24px">
      <div style="font-size:12px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Cliente</div>
      <div style="font-size:16px;font-weight:700;color:#111">${escapeHtml(buyer.name || "Sin nombre")}</div>
      ${buyer.phone ? `<div style="font-size:14px;color:#333;margin-top:4px">📞 ${escapeHtml(buyer.phone)}</div>` : ""}
      ${buyer.email ? `<div style="font-size:14px;color:#333;margin-top:2px">✉️ <a href="mailto:${escapeHtml(buyer.email)}" style="color:#333">${escapeHtml(buyer.email)}</a></div>` : ""}
      ${wa ? `<a href="${wa}" style="display:inline-block;margin-top:12px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 16px;border-radius:8px">Escribirle por WhatsApp</a>` : ""}
    </div>

    <div style="padding:0 24px 8px">
      <div style="font-size:12px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">Productos</div>
      <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${filasItems}</table>
    </div>

    <div style="padding:8px 24px 20px">
      <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
        ${fila("Subtotal", plata(payment.subtotal))}
        ${descuentoAplicado ? fila(`Descuento${discount.code ? ` (${escapeHtml(discount.code)})` : ""}`, "−" + plata(payment.discount || discount.amount)) : ""}
        ${recargo ? fila(`Recargo transferencia${payment.surcharge_percentage ? ` (${String(payment.surcharge_percentage).replace(".", ",")}%)` : ""}`, "+" + plata(payment.surcharge)) : ""}
        ${fila("Total", plata(total), true)}
        ${fila("Método de pago", escapeHtml(metodo))}
      </table>
    </div>

    <div style="padding:14px 24px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#888">
      N° de orden: <b style="color:#555">${escapeHtml(orderId)}</b>${orden.status ? ` · Estado: ${escapeHtml(orden.status)}` : ""}
    </div>
  </div>
</div>`;

    return { asunto, html };
};

module.exports = { construirEmailPedido, linkWhatsapp };
