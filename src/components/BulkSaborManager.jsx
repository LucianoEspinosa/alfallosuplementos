import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BulkSaborManager = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState({});
    const [saboresInput, setSaboresInput] = useState('');
    
    // Estados para filtros
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtros, setFiltros] = useState({
        marca: '',
        categoria: '',
        search: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [allProducts, filtros]);

    const fetchProducts = async () => {
        try {
            const db = getFirestore();
            const productsRef = collection(db, 'fragancias');
            const snapshot = await getDocs(productsRef);
            
            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                sabores: doc.data().sabores || []
            }));
            
            setAllProducts(productsData);
            
            // Extraer marcas y categorías únicas para los filtros - CORREGIDO
            const marcasUnicas = [...new Set(productsData.map(p => p.marca).filter(Boolean))].sort();
            const categoriasUnicas = [...new Set(productsData.map(p => p.categoria).filter(Boolean))].sort();
            
            setMarcas(marcasUnicas);
            setCategorias(categoriasUnicas);
            setLoading(false);
            
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error cargando productos');
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let resultados = [...allProducts];

        // Filtrar por marca
        if (filtros.marca) {
            resultados = resultados.filter(product => product.marca === filtros.marca);
        }

        // Filtrar por categoría
        if (filtros.categoria) {
            resultados = resultados.filter(product => product.categoria === filtros.categoria);
        }

        // Filtrar por búsqueda
        if (filtros.search) {
            const searchLower = filtros.search.toLowerCase();
            resultados = resultados.filter(product =>
                product.nombre?.toLowerCase().includes(searchLower) ||
                product.marca?.toLowerCase().includes(searchLower) ||
                product.descripcion?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredProducts(resultados);
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
        setSelectedProducts({}); // Limpiar selección al cambiar filtros
    };

    const limpiarFiltros = () => {
        setFiltros({
            marca: '',
            categoria: '',
            search: ''
        });
        setSelectedProducts({});
    };

    const handleProductSelect = (productId, isSelected) => {
        setSelectedProducts(prev => ({
            ...prev,
            [productId]: isSelected
        }));
    };

    const handleSelectAll = (isSelected) => {
        const allSelected = {};
        filteredProducts.forEach(product => {
            allSelected[product.id] = isSelected;
        });
        setSelectedProducts(allSelected);
    };

    const parseSabores = (input) => {
        return input.split(',')
            .map(sabor => sabor.trim())
            .filter(sabor => sabor.length > 0);
    };

    const updateSelectedProducts = async () => {
        const selectedCount = Object.values(selectedProducts).filter(Boolean).length;
        
        if (selectedCount === 0) {
            toast.warning('Selecciona al menos un producto');
            return;
        }

        if (!saboresInput.trim()) {
            toast.warning('Ingresa al menos un sabor');
            return;
        }

        setUpdating(true);
        const saboresArray = parseSabores(saboresInput);
        const db = getFirestore();

        try {
            const updatePromises = filteredProducts
                .filter(product => selectedProducts[product.id])
                .map(async (product) => {
                    await updateDoc(doc(db, 'fragancias', product.id), {
                        sabores: saboresArray
                    });
                });

            await Promise.all(updatePromises);
            
            toast.success(`✅ ${updatePromises.length} productos actualizados`);
            setSaboresInput('');
            setSelectedProducts({});
            fetchProducts(); // Recargar datos
            
        } catch (error) {
            console.error('Error updating products:', error);
            toast.error('Error actualizando productos');
        } finally {
            setUpdating(false);
        }
    };

    const clearSabores = async () => {
        const selectedCount = Object.values(selectedProducts).filter(Boolean).length;
        
        if (selectedCount === 0) {
            toast.warning('Selecciona al menos un producto');
            return;
        }

        setUpdating(true);
        const db = getFirestore();

        try {
            const updatePromises = filteredProducts
                .filter(product => selectedProducts[product.id])
                .map(async (product) => {
                    await updateDoc(doc(db, 'fragancias', product.id), {
                        sabores: []
                    });
                });

            await Promise.all(updatePromises);
            
            toast.success(`✅ Sabores eliminados de ${updatePromises.length} productos`);
            setSelectedProducts({});
            fetchProducts();
            
        } catch (error) {
            console.error('Error clearing sabores:', error);
            toast.error('Error eliminando sabores');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando productos...</p>
            </div>
        );
    }

    const selectedCount = Object.values(selectedProducts).filter(Boolean).length;
    const totalFiltrados = filteredProducts.length;

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <h1 className="h3 mb-4">🍦 Gestión Masiva de Sabores</h1>
                    
                    {/* FILTROS */}
                    <div className="card mb-4">
                        <div className="card-header bg-secondary text-white">
                            <h5 className="mb-0">🔍 Filtros</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                {/* Búsqueda por texto */}
                                <div className="col-md-4">
                                    <label className="form-label">Buscar</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nombre, marca, descripción..."
                                        value={filtros.search}
                                        onChange={(e) => handleFiltroChange('search', e.target.value)}
                                    />
                                </div>

                                {/* Filtro por marca */}
                                <div className="col-md-3">
                                    <label className="form-label">Marca</label>
                                    <select
                                        className="form-select"
                                        value={filtros.marca}
                                        onChange={(e) => handleFiltroChange('marca', e.target.value)}
                                    >
                                        <option value="">Todas las marcas</option>
                                        {marcas.map(marca => (
                                            <option key={marca} value={marca}>{marca}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por categoría */}
                                <div className="col-md-3">
                                    <label className="form-label">Categoría</label>
                                    <select
                                        className="form-select"
                                        value={filtros.categoria}
                                        onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categorias.map(categoria => (
                                            <option key={categoria} value={categoria}>{categoria}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Botón limpiar */}
                                <div className="col-md-2 d-flex align-items-end">
                                    <button
                                        className="btn btn-outline-secondary w-100"
                                        onClick={limpiarFiltros}
                                    >
                                        🗑️ Limpiar
                                    </button>
                                </div>
                            </div>

                            {/* Info de filtros */}
                            <div className="mt-3">
                                <small className="text-muted">
                                    Mostrando {totalFiltrados} de {allProducts.length} productos
                                    {(filtros.marca || filtros.categoria || filtros.search) && (
                                        <span className="ms-2">
                                            {filtros.marca && <span className="badge bg-info me-1">Marca: {filtros.marca}</span>}
                                            {filtros.categoria && <span className="badge bg-info me-1">Categoría: {filtros.categoria}</span>}
                                            {filtros.search && <span className="badge bg-info">Búsqueda: "{filtros.search}"</span>}
                                        </span>
                                    )}
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Panel de control */}
                    <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Acciones Masivas</h5>
                        </div>
                        <div className="card-body">
                            <div className="row align-items-end">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Sabores (separados por coma):
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej: Chocolate, Vainilla, Fresa, Limón"
                                        value={saboresInput}
                                        onChange={(e) => setSaboresInput(e.target.value)}
                                        disabled={updating}
                                    />
                                    <small className="text-muted">
                                        Ejemplo: "Chocolate, Vainilla, Fresa"
                                    </small>
                                </div>
                                
                                <div className="col-md-3">
                                    <button
                                        className="btn btn-success w-100"
                                        onClick={updateSelectedProducts}
                                        disabled={updating || selectedCount === 0}
                                    >
                                        {updating ? (
                                            <div className="spinner-border spinner-border-sm" />
                                        ) : (
                                            `💾 Aplicar a ${selectedCount} productos`
                                        )}
                                    </button>
                                </div>
                                
                                <div className="col-md-3">
                                    <button
                                        className="btn btn-danger w-100"
                                        onClick={clearSabores}
                                        disabled={updating || selectedCount === 0}
                                    >
                                        🗑️ Limpiar Sabores
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-3">
                                <button
                                    className="btn btn-outline-primary btn-sm me-2"
                                    onClick={() => handleSelectAll(true)}
                                    disabled={totalFiltrados === 0}
                                >
                                    ✅ Seleccionar Todos ({totalFiltrados})
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => handleSelectAll(false)}
                                >
                                    ❌ Deseleccionar Todos
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de productos */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                Productos ({totalFiltrados})
                                {selectedCount > 0 && (
                                    <span className="badge bg-primary ms-2">
                                        {selectedCount} seleccionados
                                    </span>
                                )}
                            </h5>
                        </div>
                        <div className="card-body">
                            {totalFiltrados === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-muted">No hay productos que coincidan con los filtros</p>
                                    <button className="btn btn-primary btn-sm" onClick={limpiarFiltros}>
                                        Limpiar filtros
                                    </button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                                        checked={selectedCount === totalFiltrados && totalFiltrados > 0}
                                                        disabled={totalFiltrados === 0}
                                                    />
                                                </th>
                                                <th>Producto</th>
                                                <th>Marca</th>
                                                <th>Categoría</th>
                                                <th>Sabores Actuales</th>
                                                <th>Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map((product) => (
                                                <tr key={product.id}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selectedProducts[product.id]}
                                                            onChange={(e) => handleProductSelect(product.id, e.target.checked)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <strong>{product.nombre}</strong>
                                                        <br />
                                                        <small className="text-muted">{product.presentacion}</small>
                                                    </td>
                                                    <td>{product.marca}</td>
                                                    <td>
                                                        <span className="badge bg-secondary">{product.categoria}</span>
                                                    </td>
                                                    <td>
                                                        {product.sabores && product.sabores.length > 0 ? (
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {product.sabores.map((sabor, index) => (
                                                                    <span key={index} className="badge bg-info">
                                                                        {sabor}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">Sin sabores</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={product.stock > 0 ? "text-success" : "text-danger"}>
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default BulkSaborManager;