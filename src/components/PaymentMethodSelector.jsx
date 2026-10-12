import React, { useState } from 'react';
import { TRANSFER_SURCHARGE } from '../config';

// Dos botones grandes (spec AFMobileCompra): radio propio, nombre, descripción y total del método.
// `descuento` es solo para mostrar: el total de cada método ya con el descuento aplicado.
const PaymentMethodSelector = ({ total, descuento = 0, onPaymentMethodChange }) => {
    const [metodoSeleccionado, setMetodoSeleccionado] = useState('efectivo');

    const metodosPago = [
        {
            id: 'efectivo',
            nombre: 'Efectivo',
            recargo: 0,
            descripcion: 'Pago en efectivo al recibir el producto'
        },
        {
            id: 'transferencia',
            nombre: 'Transferencia bancaria',
            recargo: TRANSFER_SURCHARGE,
            descripcion: '7,5% de recargo por costos bancarios'
        }
    ];

    const handleMethodChange = (metodo) => {
        setMetodoSeleccionado(metodo.id);
        const recargoMonto = total * metodo.recargo;
        const totalConRecargo = total + recargoMonto;
        onPaymentMethodChange(metodo.id, totalConRecargo, recargoMonto);
    };

    return (
        <div className="af-pay" role="radiogroup" aria-label="Medio de pago">
            {metodosPago.map(metodo => {
                const totalMetodo = Math.max(0, Math.round(total * (1 + metodo.recargo)) - descuento);
                const esSeleccionado = metodoSeleccionado === metodo.id;

                return (
                    <button
                        key={metodo.id}
                        type="button"
                        role="radio"
                        aria-checked={esSeleccionado}
                        className={`af-pay-option ${esSeleccionado ? 'is-on' : ''}`}
                        onClick={() => handleMethodChange(metodo)}
                    >
                        <span className="af-pay-radio">{esSeleccionado && <span className="af-pay-dot" />}</span>
                        <span className="af-pay-text">
                            <span className="af-pay-name">{metodo.nombre}</span>
                            <span className="af-pay-desc">{metodo.descripcion}</span>
                        </span>
                        <span className="af-pay-total">${totalMetodo.toLocaleString('es-AR')}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default PaymentMethodSelector;
