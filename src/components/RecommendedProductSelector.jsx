// src/components/RecommendedProductSelector.jsx

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

const RecommendedProductSelector = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const fetchProductsAndRecommended = async () => {
            const db = getFirestore();

            // 1. Obtener todos los productos para el selector
            const productsCollection = collection(db, 'fragancias');
            const productsSnapshot = await getDocs(productsCollection);
            const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsList);

            // 2. Obtener el producto recomendado de Firestore
            const recommendedDocRef = doc(db, 'settings', 'recommendedProduct');
            const recommendedDocSnap = await getDoc(recommendedDocRef);
            
            if (recommendedDocSnap.exists()) {
                const recommendedProductId = recommendedDocSnap.data().productId;
                const savedProduct = productsList.find(p => p.id === recommendedProductId);
                if (savedProduct) {
                    setSelectedProduct(savedProduct);
                }
            }
        };
        fetchProductsAndRecommended();
    }, []);

    const handleSelectProduct = (event) => {
        const productId = event.target.value;
        const product = products.find(p => p.id === productId);
        setSelectedProduct(product);
    };

    const handleSave = async () => {
        if (selectedProduct) {
            const db = getFirestore();
            const recommendedDocRef = doc(db, 'settings', 'recommendedProduct');
            
            // Guardar el ID en Firestore
            await setDoc(recommendedDocRef, { productId: selectedProduct.id });
            setStatusMessage('¡Producto recomendado guardado con éxito!');
        } else {
            setStatusMessage('Por favor, selecciona un producto.');
        }
    };

    const handleRemove = async () => {
        const db = getFirestore();
        const recommendedDocRef = doc(db, 'settings', 'recommendedProduct');
        
        // Eliminar el documento de Firestore
        await deleteDoc(recommendedDocRef);
        setSelectedProduct(null);
        setStatusMessage('Producto recomendado eliminado.');
    };

    return (
        <div className="admin-container">
            <h2>Seleccionar Producto Recomendado</h2>
            <p>Elige un producto para que se muestre como "producto del día" en un modal a los visitantes.</p>
            
            <div className="product-selector-actions">
                <select onChange={handleSelectProduct} value={selectedProduct?.id || ''}>
                    <option value="" disabled>Selecciona un producto</option>
                    {products.map(product => (
                        <option key={product.id} value={product.id}>
                            {product.marca} - {product.nombre}
                        </option>
                    ))}
                </select>
                <button onClick={handleSave} className="btn-save">Guardar</button>
                <button onClick={handleRemove} className="btn-remove">Eliminar</button>
            </div>
            
            {statusMessage && <p className="status-message">{statusMessage}</p>}

            {selectedProduct && (
                <div className="recommended-preview">
                    <h3>Producto Recomendado Actual:</h3>
                    <img src={selectedProduct.img} alt={selectedProduct.nombre} className="preview-image" />
                    <p>{selectedProduct.marca} {selectedProduct.nombre}</p>
                    <p>${selectedProduct.precio.toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

export default RecommendedProductSelector;