import React from 'react';

const WhatsAppConfirmation = ({ order, onBack }) => {
    const formattedItems = order.items.map(item =>
        `• ${item.title}${item.presentacion ? ` (${item.presentacion})` : ''} x${item.quantity} - $${item.price}`
    ).join('%0A');

    const whatsappMessage = `¡Hola! Acabo de realizar mi compra:%0A%0A*N° de Orden:* ${order.id}%0A*Fecha:* ${order.date}%0A%0A*Productos:*%0A${formattedItems}%0A%0A*Total:* $${order.total}%0A%0A*Mis datos:*%0A📧 ${order.buyer.email}%0A📞 ${order.buyer.phone}%0A%0APor favor confirmar stock y envío. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/5491167936064?text=${whatsappMessage}`;

    return (
        <div className="container text-center py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="alert alert-success">
                        <h4>✅ ¡Compra registrada exitosamente!</h4>
                        <p className="mb-2">Número de orden: <strong>{order.id}</strong></p>
                        <p>Ahora confirmá por WhatsApp para coordinar el envío</p>
                    </div>

                    <div className="card mt-4">
                        <div className="card-body">
                            <h5>📦 Resumen de tu compra</h5>
                            <div className="text-start">
                                {order.items.map((item, index) => (
                                    <div key={index} className="d-flex justify-content-between">
                                        <span>{item.title} x{item.quantity}</span>
                                        <span>${item.price * item.quantity}</span>
                                    </div>
                                ))}
                                <hr />
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total:</span>
                                    <span>${order.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>

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
                            className="btn btn-outline-secondary ms-2"
                        >
                            ← Volver
                        </button>
                    </div>

                    <div className="mt-4 p-3 bg-light rounded">
                        <h6>¿Problemas con el botón?</h6>
                        <p className="mb-1">1. Guardá este número: <strong>11 2345-6789</strong></p>
                        <p className="mb-1">2. Enviá el mensaje manualmente</p>
                        <p className="mb-0">3. Mencioná tu número de orden: <strong>{order.id}</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppConfirmation;