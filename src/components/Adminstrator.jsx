
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import logo from "./img/logoalfallo2.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// IMPORTACIÓN CORREGIDA:
import {
    faTrashAlt,
    faPencilAlt,
    faFilter,
    faListAlt,
    faBox,
    faFileExcel  // ÍCONO NUEVO AÑADIDO
} from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";

const Administrator = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);

    // Cargar filtros desde localStorage al inicializar
    const [filtros, setFiltros] = useState(() => {
        const savedFilters = localStorage.getItem('adminFilters');
        return savedFilters ? JSON.parse(savedFilters) : {
            marca: '',
            categoria: ''
        };
    });

    const [mostrarFiltros, setMostrarFiltros] = useState(() => {
        const savedShowFilters = localStorage.getItem('showFilters');
        return savedShowFilters ? JSON.parse(savedShowFilters) : false;
    });

    useEffect(() => {
        console.log("consultando");
        const db = getFirestore();
        const itemsCollection = collection(db, "fragancias");
        getDocs(itemsCollection).then(resultado => {
            if (resultado.size > 0) {
                const productos = resultado.docs.map(producto => ({ id: producto.id, ...producto.data() }));
                setItems(productos);

                // Extraer marcas únicas
                const marcasUnicas = [...new Set(productos.map(item => item.marca))].filter(marca => marca);
                setMarcas(marcasUnicas);

                // Extraer categorías únicas
                const categoriasUnicas = [...new Set(productos.map(item => item.categoria))].filter(categoria => categoria);
                setCategorias(categoriasUnicas);
            } else {
                console.error("Error! No se encontraron productos en la colección!")
            }
        });
    }, []);

    // Guardar filtros en localStorage cuando cambien
    useEffect(() => {
        localStorage.setItem('adminFilters', JSON.stringify(filtros));
    }, [filtros]);

    // Guardar estado de mostrar filtros en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('showFilters', JSON.stringify(mostrarFiltros));
    }, [mostrarFiltros]);

    // Aplicar filtros cuando cambien los filtros o los items
    useEffect(() => {
        let resultados = [...items];

        if (filtros.marca) {
            resultados = resultados.filter(item => item.marca === filtros.marca);
        }

        if (filtros.categoria) {
            resultados = resultados.filter(item => item.categoria === filtros.categoria);
        }

        setFilteredItems(resultados);
    }, [filtros, items]);

    const borrarProducto = async (productId) => {
        const db = getFirestore();
        const productRef = doc(collection(db, "fragancias"), productId);

        try {
            await deleteDoc(productRef);
            console.log(`Producto ${productId} eliminado en la base de datos`);

            const filteredItems = items.filter(item => item.id !== productId);
            setItems(filteredItems);
            console.log(`Producto ${productId} eliminado del estado local`);
        } catch (error) {
            console.error("Error al eliminar el producto", error);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            marca: '',
            categoria: ''
        });
    };

    return (
        <div className="container py-5" style={{ color: 'var(--text-primary)' }}>
            {/* Header con botones de navegación */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 style={{ color: 'var(--text-primary)' }}>Administrador de Suplementos</h1>
                        <div className="d-flex gap-2">

                            {/* Botón para acceder a Excel */}
                            <Link
                                to="/excel"
                                className="btn btn-outline-success"
                                style={{
                                    borderColor: 'green',
                                    color: 'green',
                                    textDecoration: 'none'
                                }}
                            >
                                <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                                Gestión con Excel
                            </Link>
                            {/* Botón para acceder a las órdenes */}
                            <Link
                                to="/orders"
                                className="btn btn-outline-primary"
                                style={{
                                    borderColor: 'var(--accent-color)',
                                    color: 'var(--accent-color)',
                                    textDecoration: 'none'
                                }}
                            >
                                <FontAwesomeIcon icon={faListAlt} className="me-2" />
                                Ver Órdenes
                            </Link>
                            <Link
                                to="/add-product"
                                className="btn btn-primary"
                                style={{
                                    background: 'var(--accent-color)',
                                    borderColor: 'var(--accent-color)',
                                    color: 'white',
                                    textDecoration: 'none'
                                }}
                            >
                                <FontAwesomeIcon icon={faBox} className="me-2" />
                                Agregar Producto
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="row mt-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 style={{ color: 'var(--text-primary)' }}>Lista de Productos</h2>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                        style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                    >
                        <FontAwesomeIcon icon={faFilter} className="me-2" />
                        {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </button>
                </div>

                {mostrarFiltros && (
                    <div className="card mt-3" style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-color)'
                    }}>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-5 mb-2">
                                    <label htmlFor="marca" className="form-label" style={{ color: 'var(--text-primary)' }}>
                                        Filtrar por Marca
                                    </label>
                                    <select
                                        className="form-select"
                                        id="marca"
                                        name="marca"
                                        value={filtros.marca}
                                        onChange={handleFiltroChange}
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)',
                                            borderColor: 'var(--border-color)'
                                        }}
                                    >
                                        <option value="">Todas las marcas</option>
                                        {marcas.map(marca => (
                                            <option key={marca} value={marca}>{marca}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-5 mb-2">
                                    <label htmlFor="categoria" className="form-label" style={{ color: 'var(--text-primary)' }}>
                                        Filtrar por Categoría
                                    </label>
                                    <select
                                        className="form-select"
                                        id="categoria"
                                        name="categoria"
                                        value={filtros.categoria}
                                        onChange={handleFiltroChange}
                                        style={{
                                            background: 'var(--bg-secondary)',
                                            color: 'var(--text-primary)',
                                            borderColor: 'var(--border-color)'
                                        }}
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categorias.map(categoria => (
                                            <option key={categoria} value={categoria}>{categoria}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2 d-flex align-items-end mb-2">
                                    <button
                                        className="btn btn-outline-secondary w-100"
                                        onClick={limpiarFiltros}
                                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Información de filtros aplicados */}
            {(filtros.marca || filtros.categoria) && (
                <div className="row mt-3">
                    <div className="col">
                        <div className="alert alert-info py-2" style={{
                            background: 'rgba(23, 162, 184, 0.2)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)'
                        }}>
                            <small>
                                Filtros aplicados:
                                {filtros.marca && <span className="badge bg-secondary ms-2">Marca: {filtros.marca}</span>}
                                {filtros.categoria && <span className="badge bg-secondary ms-2">Categoría: {filtros.categoria}</span>}
                                <span className="badge bg-info ms-2">{filteredItems.length} productos</span>
                            </small>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de productos */}
            <div className="row justify-content-center px-2 px-md-0 table-container mt-3">
                <div className="table-responsive">
                    <table className="table table-sm text-center" style={{
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                    }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-secondary)' }}>
                                <th scope="col" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                                    <img src={logo} alt="logotipo fragances.net" width={20} />{" "}
                                </th>
                                <th scope="col" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Producto</th>
                                <th scope="col" className="d-none d-md-table-cell" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Categoría</th>
                                <th scope="col" className="d-none d-md-table-cell" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Cantidad</th>
                                <th scope="col" className="d-md-none" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Cant</th>
                                <th scope="col" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Precio</th>
                                <th scope="col" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <tr key={item.id} style={{ borderColor: 'var(--border-color)' }}>
                                        <td style={{ borderColor: 'var(--border-color)' }}>
                                            <img src={item.img} alt={item.nombre} width={30} style={{ borderRadius: '4px' }} />{" "}
                                        </td>
                                        <td className="text-start" style={{ borderColor: 'var(--border-color)' }}>
                                            {item.marca && (
                                                <span className="brand fw-bold" style={{ color: 'var(--text-primary)' }}>
                                                    {item.marca}{" "}
                                                </span>
                                            )}
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {item.nombre} ({item.presentacion})
                                            </span>
                                        </td>
                                        <td className="d-none d-md-table-cell" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                                            {item.categoria || 'N/A'}
                                        </td>
                                        <td style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                                            {item.stock}
                                        </td>
                                        <td style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                                            ${item.precio?.toLocaleString()}
                                        </td>
                                        <td style={{ borderColor: 'var(--border-color)' }}>
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="border-0 bg-transparent">
                                                    <Link to={`/edit/${item.id}`} className="text-success" style={{ fontSize: '1.1rem' }}>
                                                        <FontAwesomeIcon icon={faPencilAlt} />
                                                    </Link>
                                                </button>
                                                <button
                                                    onClick={() => borrarProducto(item.id)}
                                                    className="text-danger border-0 bg-transparent"
                                                    style={{ fontSize: '1.1rem' }}
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                                        {items.length === 0
                                            ? "No hay productos en la base de datos"
                                            : "No se encontraron productos con los filtros aplicados"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-3">
                    <Link to="/add-product" className="btn btn-primary" style={{
                        background: 'var(--accent-color)',
                        borderColor: 'var(--accent-color)',
                        color: 'white'
                    }}>
                        <FontAwesomeIcon icon={faBox} className="me-2" />
                        Agregar Producto
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Administrator;