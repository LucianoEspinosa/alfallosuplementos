import React, { useCallback, useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import RecomendadoModal from './af/RecomendadoModal';


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

    const handleClose = useCallback(() => {
        setShowModal(false);
    }, []);

    if (!showModal || !recommendedProduct) {
        return null;
    }

    // Mismo diseño que el modal de bienvenida
    return <RecomendadoModal product={recommendedProduct} onClose={handleClose} />;
};

export default CategoryModal;
