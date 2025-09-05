// components/ProductModal.js
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const ProductModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [latestProduct, setLatestProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si ya se mostró el modal alguna vez
        const hasSeenModal = localStorage.getItem('hasSeenProductModal');
        
        if (!hasSeenModal) {
            fetchLatestProduct();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchLatestProduct = async () => {
        try {
            const db = getFirestore();
            const productsQuery = query(
                collection(db, "fragancias"),
                orderBy("fechaCreacion", "desc"),
                limit(1)
            );
            
            const querySnapshot = await getDocs(productsQuery);
            
            if (!querySnapshot.empty) {
                const productDoc = querySnapshot.docs[0];
                setLatestProduct({
                    id: productDoc.id,
                    ...productDoc.data()
                });
                setShowModal(true);
                // Guardar en localStorage para que no se muestre nuevamente
                localStorage.setItem('hasSeenProductModal', 'true');
            }
        } catch (error) {
            console.error("Error fetching latest product:", error);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    // Si quieres forzar que se muestre de nuevo para testing, puedes comentar la línea del localStorage
    // y descomentar esta función:
    /*
    const resetModal = () => {
        localStorage.removeItem('hasSeenProductModal');
        setShowModal(true);
    }
    */

    if (!showModal || loading) return null;

    return (
        <div className="modal-backdrop" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '10px',
                maxWidth: '500px',
                width: '90%',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
                <button 
                    onClick={closeModal}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                    aria-label="Cerrar modal"
                >
                    ×
                </button>
                
                <div className="modal-body text-center">
                    <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
                        🎉 Nuevo Producto
                    </h3>
                    
                    {latestProduct && (
                        <div className="product-preview">
                            <img 
                                src={latestProduct.imagen} 
                                alt={latestProduct.nombre}
                                style={{
                                    width: '100%',
                                    maxHeight: '200px',
                                    objectFit: 'contain',
                                    marginBottom: '1rem',
                                    borderRadius: '8px'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            <h5 style={{ color: '#34495e', marginBottom: '0.5rem' }}>
                                {latestProduct.nombre}
                            </h5>
                            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                                {latestProduct.marca}
                            </p>
                            <p style={{ 
                                color: '#27ae60', 
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                marginBottom: '1.5rem'
                            }}>
                                ${latestProduct.precio}
                            </p>
                            <Link 
                                to={`/item/${latestProduct.id}`}
                                className="btn btn-primary"
                                onClick={closeModal}
                                style={{
                                    textDecoration: 'none',
                                    padding: '0.75rem 2rem',
                                    borderRadius: '25px',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Ver Producto
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductModal;