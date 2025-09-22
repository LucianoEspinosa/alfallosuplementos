import React from "react";
import { Link } from "react-router-dom";

const ResumenModal = ({ show, onClose, producto, cantidad, saborSeleccionado }) => {
    if (!show) return null;

    // Calcular precios
    const precioOriginal = producto.precio || 0;
    const descuento = producto.descuento || 0;
    const precioConDescuento = descuento > 0
        ? Math.round(precioOriginal - (precioOriginal * descuento) / 100)
        : precioOriginal;

    const ahorro = precioOriginal - precioConDescuento;

    return (
        <>
            {/* Fondo oscuro */}
            <div
                className="modal-backdrop fade show"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1040
                }}
                onClick={onClose}
            ></div>

            {/* Modal en la parte inferior */}
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 1050,
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px'
                }}
            >
                <div className="modal-dialog modal-dialog-bottom m-0">
                    <div className="modal-content rounded-top-4">
                        {/* Header */}
                        <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title fw-bold">✅ Producto agregado</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body py-2">
                            {/* Producto info */}
                            <div className="d-flex mb-3">
                                <img
                                    src={producto.img}
                                    alt={producto.nombre}
                                    className="rounded me-3"
                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/60x60?text=Imagen+No+Disponible';
                                    }}
                                />
                                <div>
                                    <h6 className="mb-1 fw-bold">{producto.nombre}</h6>
                                    {saborSeleccionado && (
                                        <p className="mb-1 text-muted small">Sabor: {saborSeleccionado}</p>
                                    )}
                                    <p className="mb-0 small">Cantidad: {cantidad}</p>
                                </div>
                            </div>

                            {/* Precios */}
                            <div className="border-top pt-3">
                                {descuento > 0 ? (
                                    <>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="text-decoration-line-through text-muted small">
                                                ${precioOriginal.toLocaleString('es-AR')}
                                            </span>
                                            <span className="badge bg-danger small">
                                                -{descuento}% OFF
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="fw-bold text-success">
                                                ${precioConDescuento.toLocaleString('es-AR')}
                                            </span>
                                            <span className="text-success small">
                                                Ahorras: ${ahorro.toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <span className="fw-bold text-success">
                                            ${precioOriginal.toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer - Botones */}
                        <div className="modal-footer border-0 pt-0">
                            <div className="d-grid gap-2 w-100">
                                <Link
                                    to="/cart"
                                    className="btn btn-success py-2 fw-bold"
                                    onClick={onClose}
                                >
                                    Ver carrito
                                </Link>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary py-2"
                                    onClick={onClose}
                                >
                                    Seguir comprando
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estilos para el modal inferior */}
            <style jsx>{`
        .modal-dialog-bottom {
          max-width: 100%;
          margin: 0;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
        }
        
        .rounded-top-4 {
          border-top-left-radius: 1rem !important;
          border-top-right-radius: 1rem !important;
          border-bottom-left-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
        }
        
        @media (min-width: 576px) {
          .modal-dialog-bottom {
            max-width: 400px;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      `}</style>
        </>
    );
};

export default ResumenModal;