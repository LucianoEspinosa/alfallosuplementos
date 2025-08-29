

import React from 'react';

const WhatsAppConfirmation = ({ order, onBack }) => {
    // Número de WhatsApp (cambia por tu número real)
    const whatsappNumber = '5491167936064'; // Manteniendo tu número

    const generateWhatsAppMessage = () => {
        // Texto de productos con precios transparentes
        const itemsText = order.items.map(item => {
            let itemText = `• ${item.title}`;

            // Agregar presentación si existe
            if (item.presentacion) {
                itemText += ` (${item.presentacion})`;
            }

            itemText += ` x${item.quantity}`;

            // Mostrar precio con y sin recargo si aplica
            const precioUnitario = item.price || 0;
            const precioOriginal = item.priceOriginal || item.price || 0;

            if (order.payment?.surcharge > 0 && precioOriginal !== precioUnitario) {
                itemText += ` - $${precioUnitario.toLocaleString('es-AR')} c/u`;
                itemText += ` (antes $${precioOriginal.toLocaleString('es-AR')})`;
            } else {
                itemText += ` - $${precioUnitario.toLocaleString('es-AR')} c/u`;
            }

            return itemText;
        }).join('%0A');

        // Construir el mensaje completo (manteniendo tu formato original)
        let message = `¡Hola! Acabo de realizar mi compra:%0A%0A`;
        message += `*N° de Orden:* ${order.id}%0A`;
        message += `*Fecha:* ${order.date}%0A%0A`;

        message += `*Productos:*%0A${itemsText}%0A%0A`;

        // Desglose transparente de precios si hay recargo
        if (order.payment?.surcharge > 0) {
            message += `*Desglose de pago:*%0A`;
            message += `Subtotal: $${order.payment.subtotal.toLocaleString('es-AR')}%0A`;
            message += `Recargo transferencia (${order.payment.surcharge_percentage}%): +$${order.payment.surcharge.toLocaleString('es-AR')}%0A`;
        }

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

    // Calcular si hay recargo para mostrar en la interfaz
    const tieneRecargo = order.payment?.surcharge > 0;

    return (
        <div className="container text-center py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    {/* Alerta de éxito */}
                    <div className="alert alert-success">
                        <h4>✅ ¡Compra registrada exitosamente!</h4>
                        <p className="mb-2">Número de orden: <strong>{order.id}</strong></p>
                        <p>Ahora confirmá por WhatsApp para coordinar el envío</p>
                    </div>

                    {/* Card de resumen */}
                    <div className="card mt-4">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">📦 Resumen de tu compra</h5>
                        </div>
                        <div className="card-body">
                            {/* Lista de productos */}
                            <div className="text-start mb-3">
                                {order.items.map((item, index) => {
                                    const precioUnitario = item.price || 0;
                                    const precioOriginal = item.priceOriginal || item.price || 0;
                                    const subtotalItem = precioUnitario * item.quantity;

                                    return (
                                        <div key={index} className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="flex-grow-1">
                                                <div className="fw-medium">
                                                    {item.title}
                                                    {item.presentacion && ` (${item.presentacion})`}
                                                </div>
                                                <div className="text-muted small">
                                                    {item.quantity} und ×
                                                    {tieneRecargo && precioOriginal !== precioUnitario ? (
                                                        <>
                                                            <span className="text-success"> ${precioUnitario.toLocaleString('es-AR')}</span>
                                                            <small className="text-muted ms-1">
                                                                <s>${precioOriginal.toLocaleString('es-AR')}</s>
                                                            </small>
                                                        </>
                                                    ) : (
                                                        ` $${precioUnitario.toLocaleString('es-AR')}`
                                                    )}
                                                </div>
                                            </div>
                                            <div className="fw-bold">
                                                ${subtotalItem.toLocaleString('es-AR')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desglose de pago */}
                            {tieneRecargo && (
                                <div className="border-top pt-3">
                                    <div className="d-flex justify-content-between text-muted">
                                        <span>Subtotal:</span>
                                        <span>${order.payment.subtotal.toLocaleString('es-AR')}</span>
                                    </div>
                                    <div className="d-flex justify-content-between text-danger">
                                        <span>Recargo por transferencia ({order.payment.surcharge_percentage}%):</span>
                                        <span>+${order.payment.surcharge.toLocaleString('es-AR')}</span>
                                    </div>
                                    <div className="small text-muted text-end">
                                        Este recargo cubre comisiones bancarias
                                    </div>
                                </div>
                            )}

                            {/* Total */}
                            <hr />
                            <div className="d-flex justify-content-between fw-bold fs-5">
                                <span>Total a pagar:</span>
                                <span className="text-success">${order.total.toLocaleString('es-AR')}</span>
                            </div>

                            {/* Información de pago */}
                            <div className="mt-3 p-2 bg-light rounded">
                                <small>
                                    <strong>Método de pago:</strong> {order.payment?.method === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo'}
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-4">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success btn-lg"
                        >
                            📱 Abrir WhatsApp para Confirmar
                        </a>

                        <button
                            onClick={onBack}
                            className="btn btn-outline-secondary m-3 ms-2"
                        >
                            ← Volver
                        </button>
                    </div>

                    {/* Información de respaldo */}
                    <div className="mt-4 p-3  rounded">
                        <h6>¿Problemas con el botón?</h6>
                        <p className="mb-1">1. Guardá este número: <strong>11 6793-6064</strong></p>
                        <p className="mb-1">2. Enviá el mensaje manualmente</p>
                        <p className="mb-0">3. Mencioná tu número de orden: <strong>{order.id}</strong></p>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-3 p-3 bg-info text-dark rounded">
                        <h6>💡 ¿Qué pasa ahora?</h6>
                        <p className="mb-1">1. Te contactaremos por WhatsApp para confirmar stock</p>
                        <p className="mb-1">2. Coordinaremos el método de envío</p>
                        <p className="mb-0">3. Te diremos cómo y cuándo realizar el pago</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppConfirmation;