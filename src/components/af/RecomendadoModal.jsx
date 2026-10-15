import React, { useEffect, useState } from 'react';
import { PiX, PiArrowRight } from 'react-icons/pi';
import { precioFinalDe, precioTransferencia, formatoPrecio } from '../../utils/productos';
import '../RecommendedModal.css';

// Modal "Recomendado" del rediseño. Lo usan el modal de bienvenida (RecommendedProductModal)
// y el de cada categoría (CategoryModal), así los dos se ven igual.
const RecomendadoModal = ({ product: recommendedProduct, onClose: handleClose }) => {
    const [imgError, setImgError] = useState(false);

    // Esc cierra el modal y se bloquea el scroll del body mientras está abierto
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [handleClose]);

    const { marca, nombre, presentacion, descuento, img, masVendido } = recommendedProduct;

    // Precio final (con descuento si aplica) y con transferencia, igual que en el resto del sitio
    const precioFinal = precioFinalDe(recommendedProduct);
    const precioConTransferencia = precioTransferencia(precioFinal);

    const meta = [marca, presentacion].filter(Boolean).join(' · ');
    const showImg = img && !imgError;

    return (
        <div className="afm-overlay" onClick={handleClose}>
            <div
                className="afm-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Producto recomendado"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="afm-top">
                    <span className="afm-tag">Recomendado</span>
                    <button type="button" className="afm-close" onClick={handleClose} aria-label="Cerrar">
                        <PiX size={16} />
                    </button>
                </div>

                <div className="afm-photo">
                    {showImg ? (
                        <img src={img} alt={nombre} onError={() => setImgError(true)} />
                    ) : (
                        <div className="afm-fallback" aria-hidden="true">
                            <span className="afm-fallback-initial">{(marca || nombre || '?').charAt(0).toUpperCase()}</span>
                            {marca && <span className="afm-fallback-brand">{marca}</span>}
                        </div>
                    )}
                    {descuento > 0 ? (
                        <span className="afm-badge afm-badge--sale">Oferta -{descuento}%</span>
                    ) : masVendido ? (
                        <span className="afm-badge afm-badge--top">Más vendido</span>
                    ) : null}
                </div>

                <div className="afm-info">
                    {meta && <p className="afm-meta">{meta}</p>}
                    <h2 className="afm-name">{nombre}</h2>
                    <div className="afm-price-row">
                        <span className="afm-price">{formatoPrecio(precioFinal)}</span>
                        <span className="afm-price-label">efectivo</span>
                    </div>
                    <p className="afm-transfer">{formatoPrecio(precioConTransferencia)} con transferencia</p>
                </div>

                <div className="afm-actions">
                    <a href={`/item/${recommendedProduct.id}`} className="afm-cta" onClick={handleClose}>
                        Ver producto
                        <PiArrowRight size={18} />
                    </a>
                    <button type="button" className="afm-secondary" onClick={handleClose}>
                        Seguir viendo la tienda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecomendadoModal;
