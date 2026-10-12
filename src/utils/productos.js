import { TRANSFER_SURCHARGE } from "../config";

export const normalizarTexto = (texto) =>
    (texto || "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Misma regla de búsqueda que usa la grilla: todas las palabras tienen que aparecer
// en nombre, marca, categoría o descripción.
export const coincideBusqueda = (producto, consulta) => {
    const palabras = normalizarTexto(consulta).split(/\s+/).filter(Boolean);
    if (palabras.length === 0) return true;
    const texto = [producto.nombre, producto.marca, producto.categoria, producto.descripcion]
        .map(normalizarTexto)
        .join(" ");
    return palabras.every((p) => texto.includes(p));
};

// Precio final de la card y el detalle (con descuento si lo tiene): misma cuenta que CartContext.
export const precioFinalDe = (item) =>
    item.descuento > 0 ? Math.round(item.precio - (item.precio * item.descuento) / 100) : item.precio;

export const precioTransferencia = (precio) => Math.round(precio * (1 + TRANSFER_SURCHARGE));

export const formatoPrecio = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");

export const etiquetaCantidad = (n) => n + (n === 1 ? " producto" : " productos");

// Fecha de alta: fechaCreacion (AddProduct) o creado_el (Cloud Function). Puede venir como
// Timestamp de Firestore o como {seconds} si pasó por la caché de sessionStorage.
export const fechaAlta = (item) => {
    const f = item.fechaCreacion || item.creado_el;
    if (!f) return null;
    if (typeof f.toDate === "function") return f.toDate();
    if (typeof f.seconds === "number") return new Date(f.seconds * 1000);
    const d = new Date(f);
    return isNaN(d) ? null : d;
};

// Un solo badge por producto, con prioridad Oferta > Más vendido > Nuevo.
export const badgeDe = (item) => {
    if (item.descuento > 0) return { tipo: "oferta", texto: `Oferta -${item.descuento}%` };
    if (item.masVendido === true) return { tipo: "top", texto: "Más vendido" };
    const alta = fechaAlta(item);
    if (alta && Date.now() - alta.getTime() < 30 * 24 * 60 * 60 * 1000) return { tipo: "nuevo", texto: "Nuevo" };
    return null;
};
