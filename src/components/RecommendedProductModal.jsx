import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { PiX, PiArrowRight } from 'react-icons/pi';
import './RecommendedModal.css';

const RecommendedProductModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [recommendedProduct, setRecommendedProduct] = useState(null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        const fetchRecommendedProduct = async () => {
            const db = getFirestore();
            const recommendedDocRef = doc(db, 'settings', 'recommendedProduct');
            const recommendedDocSnap = await getDoc(recommendedDocRef);

            // Obtener el ID del producto guardado en sessionStorage
            const lastShownProductId = sessionStorage.getItem('lastShownRecommendedProductId');

            if (recommendedDocSnap.exists()) {
                const currentProductId = recommendedDocSnap.data().productId;

                // Si el ID de Firestore es diferente al ID que ya mostramos, procedemos
                if (currentProductId !== lastShownProductId) {
                    const productRef = doc(db, 'fragancias', currentProductId);
                    const productSnap = await getDoc(productRef);

                    if (productSnap.exists()) {
                        setRecommendedProduct({ id: productSnap.id, ...productSnap.data() });
                        setShowModal(true);
                        // Guardar el nuevo ID en sessionStorage una vez que se muestra el modal
                        sessionStorage.setItem('lastShownRecommendedProductId', currentProductId);
                    }
                }
            } else {
                // Si no hay producto recomendado en Firestore, aseguramos que el modal no se muestre
                setShowModal(false);
            }
        };

        fetchRecommendedProduct();
    }, []);

    const handleClose = () => {
        setShowModal(false);
    };

    const isOpen = showModal && !!recommendedProduct;

    // Esc cierra el modal y se bloquea el scroll del body mientras está abierto
    useEffect(() => {
        if (!isOpen) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setShowModal(false);
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const { marca, nombre, presentacion, precio, descuento, img, masVendido } = recommendedProduct;

    // Precio final (con descuento si aplica) y con transferencia (7.5% de recargo), igual que en el resto del sitio
    const precioFinal = descuento > 0
        ? Math.round(precio - (precio * descuento) / 100)
        : precio;
    const precioConTransferencia = Math.round(precioFinal * 1.075);

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
                        <span className="afm-price">${precioFinal?.toLocaleString()}</span>
                        <span className="afm-price-label">efectivo</span>
                    </div>
                    <p className="afm-transfer">${precioConTransferencia?.toLocaleString()} con transferencia</p>
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

export default RecommendedProductModal;
