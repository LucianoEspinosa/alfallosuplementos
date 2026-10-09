import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';


const CategoryModal = ({ category }) => {
    const [showModal, setShowModal] = useState(false);
    const [recommendedProduct, setRecommendedProduct] = useState(null);

    useEffect(() => {
        // Genera una clave única para esta categoría en esta sesión
        const sessionKey = `hasSeenModal_${category}`;
        const hasSeenForCategory = sessionStorage.getItem(sessionKey);
        
        if (hasSeenForCategory) {
            return;
        }

        if (!category) {
            setShowModal(false);
            return;
        }

        const fetchRecommendedProduct = async () => {
            const db = getFirestore();
            const q = query(
                collection(db, 'fragancias'),
                where('categoria', '==', category),
                where('isRecommended', '==', true)
            );
            
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const productData = querySnapshot.docs[0].data();
                const productId = querySnapshot.docs[0].id;

                setRecommendedProduct({ id: productId, ...productData });
                setShowModal(true);
                sessionStorage.setItem(sessionKey, 'true'); // Guarda el estado para esta categoría
            } else {
                setShowModal(false);
            }
        };

        fetchRecommendedProduct();
    }, [category]);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);

    const handleClose = () => {
        setShowModal(false);
    };

    if (!showModal || !recommendedProduct) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="recommended-label">
                <p>Producto Recomendado</p>
            </div>
            <div className="modal-content-minimal">
                <button className="close-button-outside" onClick={handleClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className="product-info-minimal">
                    <img src={recommendedProduct.img} alt={recommendedProduct.nombre} className="product-image-minimal" />
                    <div className="product-details-minimal">
                        <h2 className="product-title-minimal">{recommendedProduct.marca} {recommendedProduct.nombre}</h2>
                        <p className="product-price-minimal">${recommendedProduct.precio?.toLocaleString()}</p>
                        <a href={`/item/${recommendedProduct.id}`} className="view-product-button" onClick={handleClose}>
                            Ver Producto
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;