// import React, { useEffect, useState } from 'react';
// import { getFirestore, doc, getDoc } from 'firebase/firestore';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTimes } from '@fortawesome/free-solid-svg-icons';

// const RecommendedProductModal = () => {
//     const [showModal, setShowModal] = useState(false);
//     const [recommendedProduct, setRecommendedProduct] = useState(null);

//     useEffect(() => {
//         const fetchRecommendedProduct = async () => {
//             const db = getFirestore();
//             const recommendedDocRef = doc(db, 'settings', 'recommendedProduct');
//             const recommendedDocSnap = await getDoc(recommendedDocRef);

//             // Obtener el ID del producto guardado en sessionStorage
//             const lastShownProductId = sessionStorage.getItem('lastShownRecommendedProductId');

//             if (recommendedDocSnap.exists()) {
//                 const currentProductId = recommendedDocSnap.data().productId;
                
//                 // Si el ID de Firestore es diferente al ID que ya mostramos, procedemos
//                 if (currentProductId !== lastShownProductId) {
//                     const productRef = doc(db, 'fragancias', currentProductId);
//                     const productSnap = await getDoc(productRef);
                    
//                     if (productSnap.exists()) {
//                         setRecommendedProduct({ id: productSnap.id, ...productSnap.data() });
//                         setShowModal(true);
//                         // Guardar el nuevo ID en sessionStorage una vez que se muestra el modal
//                         sessionStorage.setItem('lastShownRecommendedProductId', currentProductId);
//                     }
//                 }
//             } else {
//                 // Si no hay producto recomendado en Firestore, aseguramos que el modal no se muestre
//                 setShowModal(false);
//             }
//         };

//         fetchRecommendedProduct();
//     }, []);

//     const handleClose = () => {
//         setShowModal(false);
//     };

//     if (!showModal || !recommendedProduct) {
//         return null;
//     }

//     return (
//         <div className="modal-overlay">
//             <div className="modal-content-minimal">
//                 <button className="close-button" onClick={handleClose}>
//                     <FontAwesomeIcon icon={faTimes} />
//                 </button>
//                 <div className="product-info-minimal">
//                     <img src={recommendedProduct.img} alt={recommendedProduct.nombre} className="product-image-minimal" />
//                     <div className="product-details-minimal">
//                         <h2 className="product-title-minimal">{recommendedProduct.marca} {recommendedProduct.nombre}</h2>
//                         <p className="product-price-minimal">${recommendedProduct.precio?.toLocaleString()}</p>
//                         <a href={`/item/${recommendedProduct.id}`} className="view-product-button" onClick={handleClose}>
//                             Ver Producto
//                         </a>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RecommendedProductModal;

import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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

export default RecommendedProductModal;
