// Datos de contacto y reglas de precio compartidos por toda la tienda.
export const WHATSAPP_NUMBER = '5491167936064';
export const TRANSFER_SURCHARGE = 0.075;

export const whatsappUrl = (texto) =>
    `https://wa.me/${WHATSAPP_NUMBER}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;

// Códigos de descuento con porcentaje distinto según la categoría del producto.
// Si un código está acá, este porcentaje reemplaza al "valor" cargado en el panel de descuentos
// (las demás condiciones del panel — activo, vigencia, primera compra, etc. — se siguen respetando).
export const DESCUENTOS_POR_CATEGORIA = {
    TOMITEAM: { proteinas: 5, resto: 10 },
};
