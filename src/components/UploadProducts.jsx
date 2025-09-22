/*mport React from 'react';
import { collection, addDoc, writeBatch, getFirestore } from 'firebase/firestore';

import productos from './json/star-nutrition-products.json'; // Asegúrate de tener el JSON en tu proyecto

const UploadProducts = () => {
    const uploadProducts = async () => {
        try {
            const batch = writeBatch(db);
            const db = getFirestore
            const productsCollection = collection(db, 'fragancias');

            // Dividir en lotes de 500 (límite de Firestore)
            for (let i = 0; i < productos.suplementos.length; i += 500) {
                const batch = writeBatch(db);
                const chunk = productos.suplementos.slice(i, i + 500);

                chunk.forEach(product => {
                    const docRef = collection(productsCollection);
                    batch.set(docRef, {
                        ...product,
                        precio: Number(product.precio), // Convertir a número
                        precio_costo: Number(product.precio_costo), // Convertir a número
                        stock: Number(product.stock), // Convertir a número
                        descuento: Number(product.descuento) // Convertir a número
                    });
                });

                await batch.commit();
                console.log(`Subidos productos ${i + 1} a ${Math.min(i + 500, productos.suplementos.length)}`);
            }

            console.log('Todos los productos han sido subidos correctamente');
        } catch (error) {
            console.error('Error al subir productos:', error);
        }
    };

    return (
        <div>
            <h2>Subir Productos a Firestore</h2>
            <button
                onClick={uploadProducts}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Subir Productos
            </button>
        </div>
    );
};

export default UploadProducts;*/
import React from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';
import productos from './json/gold.json';

const UploadProducts = () => {
    // Configuración de Firebase (debes usar la misma que en tu index.js)
    const firebaseConfig = {
        apiKey: "AIzaSyDzq1YMmk1KGBAVB6JU7Yl9T2OJUE1XDd4",
        authDomain: "fragancesnet.firebaseapp.com",
        projectId: "fragancesnet",
        storageBucket: "fragancesnet.appspot.com",
        messagingSenderId: "10863367691",
        appId: "1:10863367691:web:16d834616cdc2b996a190e"
    };

    const uploadProducts = async () => {
        try {
            // Inicializa Firebase dentro de la función
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const productsCollection = collection(db, 'fragancias');
            
            // Crear un único batch para toda la operación
            const batch = writeBatch(db);
            
            productos.suplementos.forEach(product => {
                // Usar doc() para crear una referencia a un nuevo documento
                const docRef = doc(productsCollection);
                batch.set(docRef, {
                    ...product,
                    precio: Number(product.precio),
                    precio_costo: Number(product.precio_costo),
                    stock: Number(product.stock),
                    descuento: Number(product.descuento),
                    createdAt: new Date() // Agrega marca de tiempo
                });
            });

            await batch.commit();
            alert(`${productos.suplementos.length} productos subidos exitosamente!`);
        } catch (error) {
            console.error('Error al subir productos:', error);
            alert('Error al subir productos: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Subir Productos a Firestore</h2>
            <button
                onClick={uploadProducts}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Subir Productos
            </button>
            <p style={{ marginTop: '15px', color: '#666' }}>
                Se subirán {productos.suplementos.length} productos a la colección "fragancias"
            </p>
        </div>
    );
};

export default UploadProducts;
