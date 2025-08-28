import React, { useState } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const OrderCard = ({ order, onStatusChange }) => {
    const [updating, setUpdating] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const getStatusBadge = (status) => {
        const statusConfig = {
            confirmando: { class: 'bg-warning', text: '⏳ Confirmando' },
            confirmada: { class: 'bg-success', text: '✅ Confirmada' },
            pendiente: { class: 'bg-info', text: '🔄 Pendiente' },
            enviada: { class: 'bg-primary', text: '🚀 Enviada' },
            completada: { class: 'bg-secondary', text: '🎯 Completada' },
            cancelada: { class: 'bg-danger', text: '❌ Cancelada' }
        };

        const config = statusConfig[status] || { class: 'bg-dark', text: status };
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    };

    const getPaymentBadge = (paymentMethod) => {
        return paymentMethod === 'transferencia'
            ? <span className="badge bg-info">📲 Transferencia</span>
            : <span className="badge bg-success">💵 Efectivo</span>;
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setUpdating(true);
            const db = getFirestore();
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, { status: newStatus });
            onStatusChange(order.id, newStatus);
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error al actualizar el estado');
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        return dateString || 'Fecha no disponible';
    };

    const calculateItemsTotal = (items) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <div className="card h-100 shadow-sm">
            <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Orden #{order.id.slice(-8)}</h6>
                    {getStatusBadge(order.status)}
                </div>
            </div>

            <div className="card-body">
                {/* Información básica */}
                <div className="mb-3">
                    <h6 className="card-title">{order.buyer?.name || 'Cliente no especificado'}</h6>
                    <p className="mb-1 small">
                        📧 {order.buyer?.email || 'Sin email'}
                    </p>
                    <p className="mb-1 small">
                        📞 {order.buyer?.phone || 'Sin teléfono'}
                    </p>
                    <p className="mb-2 small">
                        📅 {formatDate(order.date)}
                    </p>
                    {order.payment?.method && (
                        <p className="mb-2">
                            {getPaymentBadge(order.payment.method)}
                            {order.payment?.surcharge > 0 && (
                                <span className="badge bg-warning ms-1">
                                    +{order.payment.surcharge_percentage}%
                                </span>
                            )}
                        </p>
                    )}
                </div>

                {/* Resumen de productos */}
                <div className="mb-3">
                    <h6 className="fw-bold">🛍️ Productos ({order.items?.length || 0})</h6>
                    {order.items?.slice(0, 2).map((item, index) => (
                        <div key={index} className="d-flex justify-content-between small">
                            <span>{item.title}</span>
                            <span>x{item.quantity}</span>
                        </div>
                    ))}
                    {order.items?.length > 2 && (
                        <small className="text-muted">+{order.items.length - 2} más...</small>
                    )}
                </div>

                {/* Total */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <strong>Total:</strong>
                    <span className="h6 mb-0 text-success">
                        ${order.total?.toLocaleString('es-AR') || calculateItemsTotal(order.items || []).toLocaleString('es-AR')}
                    </span>
                </div>

                {/* Botón para ver detalles */}
                <button
                    className="btn btn-outline-primary btn-sm w-100 mb-3"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? '▲ Ocultar' : '▼ Ver'} detalles
                </button>

                {/* Detalles expandidos */}
                {showDetails && (
                    <div className="border-top pt-3">
                        <h6 className="fw-bold">📋 Detalles completos</h6>
                        {order.items?.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between small mb-2">
                                <div>
                                    <div>{item.title}</div>
                                    {item.presentacion && (
                                        <small className="text-muted">{item.presentacion}</small>
                                    )}
                                </div>
                                <div className="text-end">
                                    <div>{item.quantity} x ${item.price}</div>
                                    <small className="text-muted">${(item.price * item.quantity).toLocaleString('es-AR')}</small>
                                </div>
                            </div>
                        ))}

                        {order.payment && (
                            <div className="border-top pt-2 mt-2">
                                <h6 className="fw-bold">💳 Pago</h6>
                                <div className="d-flex justify-content-between small">
                                    <span>Método:</span>
                                    <span>{order.payment.method === 'transferencia' ? 'Transferencia' : 'Efectivo'}</span>
                                </div>
                                {order.payment.subtotal && (
                                    <div className="d-flex justify-content-between small">
                                        <span>Subtotal:</span>
                                        <span>${order.payment.subtotal.toLocaleString('es-AR')}</span>
                                    </div>
                                )}
                                {order.payment.surcharge > 0 && (
                                    <div className="d-flex justify-content-between small text-danger">
                                        <span>Recargo ({order.payment.surcharge_percentage}%):</span>
                                        <span>+${order.payment.surcharge.toLocaleString('es-AR')}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Selector de estado */}
                {!updating ? (
                    <select
                        className="form-select form-select-sm"
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updating}
                    >
                        <option value="confirmando">⏳ Confirmando</option>
                        <option value="confirmada">✅ Confirmada</option>
                        <option value="pendiente">🔄 Pendiente</option>
                        <option value="enviada">🚀 Enviada</option>
                        <option value="completada">🎯 Completada</option>
                        <option value="cancelada">❌ Cancelada</option>
                    </select>
                ) : (
                    <div className="text-center">
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Actualizando...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderCard;