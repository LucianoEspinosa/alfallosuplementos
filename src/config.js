// Datos de contacto y reglas de precio compartidos por toda la tienda.
export const WHATSAPP_NUMBER = '5491167936064';
export const TRANSFER_SURCHARGE = 0.075;

export const whatsappUrl = (texto) =>
    `https://wa.me/${WHATSAPP_NUMBER}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
