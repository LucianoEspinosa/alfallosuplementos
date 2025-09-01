import React, { useState } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const OrderCard = ({ order, onStatusChange, onDelete }) => {
    const [updating, setUpdating] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

    // Verificar si hay descuento aplicado
    const hasDiscount = order.discount?.applied && order.discount.amount > 0;

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

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta orden?')) return;
        try {
            setDeleting(true);
            await onDelete(order.id);
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Error al eliminar la orden');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Fecha no disponible';
        
        try {
            // Si es un timestamp de Firebase
            if (date && typeof date === 'object' && 'toDate' in date) {
                const jsDate = date.toDate();
                return `${jsDate.getDate()}/${jsDate.getMonth() + 1}/${jsDate.getFullYear()} ${jsDate.getHours()}:${jsDate.getMinutes().toString().padStart(2, '0')}`;
            }
            
            // Si ya está en el formato correcto, devolverlo tal cual
            if (typeof date === 'string') {
                return date;
            }
            
            // Para otros formatos, intentar convertirlos
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                return `${parsedDate.getDate()}/${parsedDate.getMonth() + 1}/${parsedDate.getFullYear()} ${parsedDate.getHours()}:${parsedDate.getMinutes().toString().padStart(2, '0')}`;
            }
            
            // Si no se puede parsear, devolver el valor original
            return date;
        } catch (error) {
            console.error('Error formateando fecha:', error, date);
            return date || 'Fecha inválida';
        }
    };

    return (
        <div className="card h-100 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Orden #{order.id?.slice(-8) || 'N/A'}</h6>
                <div>
                    {getStatusBadge(order.status)}
                    {hasDiscount && (
                        <span className="badge bg-success ms-1" title={`Código: ${order.discount.code}`}>
                            🎉 Desc
                        </span>
                    )}
                </div>
            </div>

            <div className="card-body">
                <h6 className="card-title">{order.buyer?.name || 'Cliente no especificado'}</h6>
                <p className="mb-1 small">📧 {order.buyer?.email || 'Sin email'}</p>
                <p className="mb-1 small">📞 {order.buyer?.phone || 'Sin teléfono'}</p>
                <p className="mb-2 small">📅 {formatDate(order.date)}</p>

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

                {/* Mostrar badge de descuento si aplica */}
                {hasDiscount && (
                    <div className="mb-2 p-2 bg-light rounded">
                        <small className="text-success">
                            🎁 <strong>Descuento aplicado:</strong> {order.discount.code}
                            {order.discount.percentage > 0 && ` (${order.discount.percentage}%)`}
                        </small>
                    </div>
                )}

                <h6 className="fw-bold">🛍️ Productos ({order.items?.length || 0})</h6>
                {order.items?.slice(0, 2).map((item, i) => (
                    <div key={i} className="d-flex justify-content-between small">
                        <span>{item.title}</span>
                        <span>x{item.quantity}</span>
                    </div>
                ))}
                {order.items?.length > 2 && (
                    <small className="text-muted">+{order.items.length - 2} más...</small>
                )}

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <strong>Total:</strong>
                    <span className="h6 mb-0 text-success">
                        ${order.total?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>

                <button 
                    className="btn btn-outline-primary btn-sm w-100 mb-3" 
                    onClick={() => setShowDetails(!showDetails)} 
                    disabled={updating || deleting}
                >
                    {showDetails ? '▲ Ocultar' : '▼ Ver'} detalles
                </button>

                {showDetails && (
                    <div className="border-top pt-3">
                        <h6 className="fw-bold">📋 Detalles completos</h6>
                        {order.items?.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between small mb-2">
                                <div>
                                    <div>{item.title}</div>
                                    {item.saborSeleccionado && (
                                        <small className="text-muted">Sabor: {item.saborSeleccionado}</small>
                                    )}
                                    {item.presentacion && (
                                        <small className="text-muted d-block">Presentación: {item.presentacion}</small>
                                    )}
                                </div>
                                <div className="text-end">
                                    <div>{item.quantity} x ${item.price?.toLocaleString('es-AR')}</div>
                                    <small className="text-muted">
                                        ${(item.price * item.quantity)?.toLocaleString('es-AR')}
                                    </small>
                                </div>
                            </div>
                        ))}
                        
                        <div className="border-top pt-2 mt-2">
                            <div className="d-flex justify-content-between small">
                                <span>Subtotal:</span>
                                <span>${order.payment?.subtotal?.toLocaleString('es-AR')}</span>
                            </div>
                            
                            {/* Mostrar descuento en detalles */}
                            {hasDiscount && (
                                <div className="d-flex justify-content-between small text-success">
                                    <span>Descuento ({order.discount.code}):</span>
                                    <span>-${order.discount.amount?.toLocaleString('es-AR')}</span>
                                </div>
                            )}
                            
                            {order.payment?.surcharge > 0 && (
                                <div className="d-flex justify-content-between small">
                                    <span>Recargo ({order.payment.surcharge_percentage}%):</span>
                                    <span>${order.payment.surcharge?.toLocaleString('es-AR')}</span>
                                </div>
                            )}
                            
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Total:</span>
                                <span>${order.total?.toLocaleString('es-AR')}</span>
                            </div>
                        </div>

                        {/* Información adicional del descuento */}
                        {hasDiscount && order.discount.description && (
                            <div className="mt-2 p-2 bg-light rounded">
                                <small className="text-muted">
                                    <strong>Nota:</strong> {order.discount.description}
                                </small>
                            </div>
                        )}
                    </div>
                )}

                <div className="d-flex gap-2 mt-2">
                    <select 
                        className="form-select form-select-sm" 
                        value={order.status} 
                        onChange={e => handleStatusChange(e.target.value)} 
                        disabled={updating || deleting}
                    >
                        <option value="confirmando">⏳ Confirmando</option>
                        <option value="confirmada">✅ Confirmada</option>
                        <option value="pendiente">🔄 Pendiente</option>
                        <option value="enviada">🚀 Enviada</option>
                        <option value="completada">🎯 Completada</option>
                        <option value="cancelada">❌ Cancelada</option>
                    </select>
                    <button 
                        className="btn btn-danger btn-sm" 
                        onClick={handleDelete} 
                        disabled={deleting || updating}
                    >
                        {deleting ? '⏳' : '🗑️'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;

