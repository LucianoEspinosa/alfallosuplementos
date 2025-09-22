import React, { useState } from "react";
import { collection, getDocs, updateDoc, doc, getFirestore } from "firebase/firestore";

const NormalizadorCategorias = () => {
    const [loading, setLoading] = useState(false);
    const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
    const [resultados, setResultados] = useState({ actualizados: 0, omitidos: 0 });
    const [error, setError] = useState(null);
    const [completado, setCompletado] = useState(false);

    // Función para normalizar texto (eliminar acentos)
    const normalizarTexto = (texto) => {
        if (!texto || typeof texto !== 'string') return texto;
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };

    // Detectar si necesita normalización
    const necesitaNormalizacion = (texto) => {
        if (!texto || typeof texto !== 'string') return false;
        const normalizado = normalizarTexto(texto);
        return texto !== normalizado;
    };

    const normalizarCategoriasFragancias = async () => {
        setLoading(true);
        setError(null);
        setCompletado(false);
        setResultados({ actualizados: 0, omitidos: 0 });

        try {
            const db = getFirestore();
            const fraganciasRef = collection(db, "fragancias");
            const querySnapshot = await getDocs(fraganciasRef);
            
            setProgreso({ actual: 0, total: querySnapshot.size });

            let actualizados = 0;
            let omitidos = 0;

            // Procesar cada documento
            for (const document of querySnapshot.docs) {
                const data = document.data();
                
                // Verificar si tiene campo categoría y necesita normalización
                if (data.categoria && necesitaNormalizacion(data.categoria)) {
                    const categoriaNormalizada = normalizarTexto(data.categoria);
                    
                    // Actualizar el documento
                    const productoRef = doc(db, "fragancias", document.id);
                    await updateDoc(productoRef, {
                        categoria: categoriaNormalizada
                    });
                    
                    actualizados++;
                    console.log(`✅ ${document.id}: ${data.categoria} → ${categoriaNormalizada}`);
                } else {
                    omitidos++;
                }

                setProgreso(prev => ({ ...prev, actual: prev.actual + 1 }));
            }

            setResultados({ actualizados, omitidos });
            setCompletado(true);

        } catch (err) {
            console.error("Error al normalizar categorías:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            padding: '20px', 
            maxWidth: '600px', 
            margin: '20px auto',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <h2 style={{ color: '#333', textAlign: 'center' }}>
                🛠️ Normalizador de Categorías
            </h2>
            
            <p style={{ color: '#666', textAlign: 'center' }}>
                Este herramienta normalizará las categorías eliminando acentos para mejorar las búsquedas.
            </p>

            <button 
                onClick={normalizarCategoriasFragancias}
                disabled={loading}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    marginBottom: '20px'
                }}
            >
                {loading ? '🔄 Procesando...' : '🚀 Iniciar Normalización'}
            </button>

            {/* Barra de progreso */}
            {progreso.total > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '5px' 
                    }}>
                        <span>Progreso:</span>
                        <span>{progreso.actual} / {progreso.total}</span>
                    </div>
                    <div style={{
                        width: '100%',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '10px',
                        height: '20px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${(progreso.actual / progreso.total) * 100}%`,
                            backgroundColor: '#28a745',
                            height: '100%',
                            transition: 'width 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            {Math.round((progreso.actual / progreso.total) * 100)}%
                        </div>
                    </div>
                </div>
            )}

            {/* Resultados */}
            {completado && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    borderRadius: '5px',
                    marginBottom: '15px'
                }}>
                    <h3>✅ Normalización Completada</h3>
                    <p><strong>Actualizados:</strong> {resultados.actualizados} categorías</p>
                    <p><strong>Omitidos:</strong> {resultados.omitidos} documentos</p>
                    <p><strong>Total procesados:</strong> {progreso.total} documentos</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '5px',
                    marginBottom: '15px'
                }}>
                    <h3>❌ Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {/* Información adicional */}
            <div style={{ 
                padding: '15px', 
                backgroundColor: '#e3f2fd', 
                borderRadius: '5px',
                fontSize: '14px'
            }}>
                <h4>📝 Información:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Colección: <strong>fragancias</strong></li>
                    <li>Campo a normalizar: <strong>categoria</strong></li>
                    <li>Acción: Eliminar acentos y convertir a minúsculas</li>
                    <li>Ejemplo: "Perfumería" → "perfumeria"</li>
                </ul>
            </div>
        </div>
    );
};

export default NormalizadorCategorias;