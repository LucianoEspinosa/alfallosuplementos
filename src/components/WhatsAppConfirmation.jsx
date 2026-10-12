import React, { useEffect } from 'react';
import { PiCheck } from 'react-icons/pi';
import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_NUMBER } from '../config';
import CompraHeader from './af/CompraHeader';

const WhatsAppConfirmation = ({ order, onBack }) => {
    const whatsappNumber = WHATSAPP_NUMBER;

    // Cuando se monta el componente, hace scroll al top
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Verificar si hay descuento aplicado
    const hasDiscount = order.discount?.applied && order.discount.amount > 0;

    const generateWhatsAppMessage = () => {
        // Texto de productos
        const itemsText = order.items.map(item => {
            let itemText = `• ${item.title}`;

            // Agregar presentación y sabor si existen
            if (item.presentacion) {
                itemText += ` (${item.presentacion}`;
                if (item.saborSeleccionado) {
                    itemText += ` - ${item.saborSeleccionado}`;
                }
                itemText += `)`;
            }

            itemText += ` x${item.quantity} - $${item.price.toLocaleString('es-AR')} c/u`;

            return itemText;
        }).join('%0A');

        // Construir el mensaje completo con el formato solicitado
        let message = `¡Hola! Acabo de realizar mi compra:%0A%0A`;

        message += `*N° de Orden:* ${order.id}%0A`;
        message += `*Fecha:* ${order.date}%0A%0A`;

        message += `*Productos:*%0A${itemsText}%0A%0A`;

        // Agregar subtotal
        message += `*Subtotal:* $${order.payment.subtotal.toLocaleString('es-AR')}%0A`;

        // Agregar descuento si existe
        if (hasDiscount) {
            message += `*Descuento por código (${order.discount.code}):* -$${order.discount.amount.toLocaleString('es-AR')}%0A`;
        }

        // Agregar recargo por transferencia si existe
        if (order.payment?.surcharge > 0) {
            message += `*Recargo por transferencia (${order.payment.surcharge_percentage}%):* +$${order.payment.surcharge.toLocaleString('es-AR')}%0A`;
        }

        // Agregar total
        message += `*Total:* $${order.total.toLocaleString('es-AR')}%0A%0A`;

        message += `*Mis datos:*%0A`;
        message += `👤 ${order.buyer.name}%0A`;
        message += `📧 ${order.buyer.email}%0A`;
        message += `📞 ${order.buyer.phone}%0A%0A`;

        message += `*Método de pago:* ${order.payment?.method === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo'}%0A%0A`;

        message += `Por favor confirmar stock y envío. ¡Gracias!`;

        return message;
    };

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`;

    const monto = (n) => '$' + Number(n || 0).toLocaleString('es-AR');
    const recargoPct = String(order.payment?.surcharge_percentage ?? 7.5).replace('.', ',');
    const metodoNombre = order.payment?.method === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo';

    return (
        <div className="af-compra">
            <CompraHeader paso={2} onBack={onBack} />
            <section className="af-done">
                {/* Panel con brillo verde */}
                <div className="af-done-hero">
                    <span className="af-done-check"><PiCheck size={22} /></span>
                    <h1 className="af-compra-title af-done-title">¡Compra registrada!</h1>
                    <span className="af-done-text">Falta un paso: mandanos el pedido por WhatsApp para confirmarlo.</span>
                    <div className="af-done-order">
                        <span className="af-overline af-overline--soft">N° de orden</span>
                        <span className="af-done-orderid">{order.id}</span>
                    </div>
                </div>

                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="af-btn af-btn-primary af-done-wa"
                >
                    <FaWhatsapp size={24} />
                    Confirmar pedido por WhatsApp
                </a>

                {/* Resumen de la compra */}
                <div className="af-summary af-done-summary">
                    <span className="af-form-step">Resumen de tu compra</span>
                    {order.items.map((item, index) => (
                        <div key={index} className="af-done-item">
                            <div className="af-done-iteminfo">
                                <span className="af-done-itemname">{item.title}</span>
                                <span className="af-done-itemmeta">
                                    {[item.presentacion, item.saborSeleccionado].filter(Boolean).join(' · ')}
                                    {(item.presentacion || item.saborSeleccionado) ? ' · ' : ''}
                                    {item.quantity} u. × {monto(item.price)}
                                </span>
                            </div>
                            <span className="af-done-itemsub">{monto(item.price * item.quantity)}</span>
                        </div>
                    ))}
                    <hr className="af-hr af-summary-hr" />
                    <div className="af-summary-row af-summary-row--sm"><span>Subtotal</span><span>{monto(order.payment.subtotal)}</span></div>
                    {order.payment?.surcharge > 0 && (
                        <div className="af-summary-row af-summary-row--sm">
                            <span>Recargo por transferencia ({recargoPct}%)</span><span>+{monto(order.payment.surcharge)}</span>
                        </div>
                    )}
                    {hasDiscount && (
                        <div className="af-summary-row af-summary-row--sm af-summary-row--discount">
                            <span>Descuento ({order.discount.code})</span><span>−{monto(order.discount.amount)}</span>
                        </div>
                    )}
                    <div className="af-summary-total af-summary-total--sm">
                        <span>Total</span><span className="af-summary-totalvalue">{monto(order.total)}</span>
                    </div>
                    <span className="af-done-paymethod">Método de pago: {metodoNombre}</span>
                </div>

                {/* ¿Qué pasa ahora? */}
                <div className="af-done-next">
                    <span className="af-form-step">¿Qué pasa ahora?</span>
                    <div className="af-done-step"><span>1</span><span>Te contactamos por WhatsApp para confirmar stock.</span></div>
                    <div className="af-done-step"><span>2</span><span>Coordinamos el método de envío.</span></div>
                    <div className="af-done-step"><span>3</span><span>Te decimos cómo y cuándo realizar el pago.</span></div>
                </div>

                <div className="af-done-help">
                    <span className="af-done-helptitle">¿No se abre WhatsApp?</span>
                    <span>Escribinos al 11 6793-6064 y mencioná tu número de orden.</span>
                </div>

                <button type="button" onClick={onBack} className="af-btn af-btn-ghost af-done-back">
                    Volver
                </button>
            </section>
        </div>
    );
};

export default WhatsAppConfirmation;
