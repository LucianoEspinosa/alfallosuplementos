import React, { useCallback, useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import RecomendadoModal from './af/RecomendadoModal';

const RecommendedProductModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [recommendedProduct, setRecommendedProduct] = useState(null);

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

    const handleClose = useCallback(() => {
        setShowModal(false);
    }, []);

    if (!showModal || !recommendedProduct) {
        return null;
    }

    return <RecomendadoModal product={recommendedProduct} onClose={handleClose} />;
};

export default RecommendedProductModal;
