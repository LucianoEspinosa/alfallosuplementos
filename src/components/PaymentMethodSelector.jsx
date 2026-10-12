import React, { useState } from 'react';
import { TRANSFER_SURCHARGE } from '../config';

const PaymentMethodSelector = ({ total, onPaymentMethodChange }) => {
    const [metodoSeleccionado, setMetodoSeleccionado] = useState('efectivo');

    const metodosPago = [
        {
            id: 'efectivo',
            nombre: 'Efectivo',
            icono: '💵',
            recargo: 0,
            descripcion: 'Pago en efectivo al recibir el producto'
        },
        {
            id: 'transferencia',
            nombre: 'Transferencia Bancaria',
            icono: '📲',
            recargo: TRANSFER_SURCHARGE,
            descripcion: '7.5% de recargo por costos bancarios'
        }
    ];

    // Inicializar con el primer método al montar el componente
    const handleMethodChange = (metodo) => {
        setMetodoSeleccionado(metodo.id);
        const recargoMonto = total * metodo.recargo;
        const totalConRecargo = total + recargoMonto;
        onPaymentMethodChange(metodo.id, totalConRecargo, recargoMonto);
    };

    return (
        <div className="payment-selector">
            <h5 className="mb-3">💳 Selecciona cómo querés pagar</h5>
            
            {metodosPago.map(metodo => {
                const totalMetodo = total + (total * metodo.recargo);
                const esSeleccionado = metodoSeleccionado === metodo.id;

                return (
                    <div 
                        key={metodo.id}
                        className={`payment-option ${esSeleccionado ? 'selected' : ''}`}
                        onClick={() => handleMethodChange(metodo)}
                    >
                        <div className="payment-header">
                            <div className="form-check">
                                <input
                                    type="radio"
                                    checked={esSeleccionado}
                                    readOnly
                                    className="form-check-input"
                                />
                            </div>
                            <span className="payment-icon">{metodo.icono}</span>
                            <span className="payment-name">{metodo.nombre}</span>
                            <span className="payment-amount">
                                ${Math.round(totalMetodo).toLocaleString('es-AR')}
                            </span>
                        </div>
                        
                        <div className="payment-details">
                            <small className="text-muted">{metodo.descripcion}</small>
                            {metodo.recargo > 0 && (
                                <small className="text-danger ms-2">
                                    (+${Math.round(total * metodo.recargo).toLocaleString('es-AR')})
                                </small>
                            )}
                        </div>
                    </div>
                );
            })}

            <div className="payment-info mt-3">
                <small className="text-muted">
                    ⚡ El recargo por transferencia cubre comisiones bancarias y costos de gestión
                </small>
            </div>
        </div>
    );
};

export default PaymentMethodSelector;