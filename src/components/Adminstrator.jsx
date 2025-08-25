import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import logo from "./img/logoalfallo2.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPencilAlt, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";

const Administrator = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtros, setFiltros] = useState({
        marca: '',
        categoria: ''
    });
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    useEffect(() => {
        console.log("consultando");
        const db = getFirestore();
        const itemsCollection = collection(db, "fragancias");
        getDocs(itemsCollection).then(resultado => {
            if (resultado.size > 0) {
                const productos = resultado.docs.map(producto => ({ id: producto.id, ...producto.data() }));
                setItems(productos);
                setFilteredItems(productos);
                
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

    useEffect(() => {
        // Aplicar filtros cuando cambien los filtros o los items
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
        <div className="container py-5">
            <div className="row text-center">
                <h1>Administrador de Fragancias</h1>
            </div>
            
            {/* Filtros */}
            <div className="row mt-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2>Lista de Productos</h2>
                    <button 
                        className="btn btn-outline-primary"
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                        <FontAwesomeIcon icon={faFilter} className="me-2" />
                        {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </button>
                </div>
                
                {mostrarFiltros && (
                    <div className="card mt-3">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-5 mb-2">
                                    <label htmlFor="marca" className="form-label">Filtrar por Marca</label>
                                    <select 
                                        className="form-select" 
                                        id="marca"
                                        name="marca"
                                        value={filtros.marca}
                                        onChange={handleFiltroChange}
                                    >
                                        <option value="">Todas las marcas</option>
                                        {marcas.map(marca => (
                                            <option key={marca} value={marca}>{marca}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-5 mb-2">
                                    <label htmlFor="categoria" className="form-label">Filtrar por Categoría</label>
                                    <select 
                                        className="form-select" 
                                        id="categoria"
                                        name="categoria"
                                        value={filtros.categoria}
                                        onChange={handleFiltroChange}
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
                        <div className="alert alert-info py-2">
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
                    <table className="table table-sm text-center">
                        <thead>
                            <tr>
                                <th scope="col">
                                    <img src={logo} alt="logotipo fragances.net" width={20} />{" "}
                                </th>
                                <th scope="col">Producto</th>
                                <th scope="col" className="d-none d-md-table-cell">Categoría</th>
                                <th scope="col" className="d-none d-md-table-cell">Cantidad</th>
                                <th scope="col" className="d-md-none">Cant</th>
                                <th scope="col">Precio</th>
                                <th scope="col">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <img src={item.img} alt={item.nombre} width={20} />{" "}
                                        </td>
                                        <td className="product-name text-start">
                                            {item.marca && (
                                                <span className="brand">{item.marca} </span>
                                            )}
                                            {item.nombre} ({item.presentacion})
                                        </td>
                                        <td className="d-none d-md-table-cell">{item.categoria || 'N/A'}</td>
                                        <td>{item.stock}</td>
                                        <td>${item.precio?.toLocaleString()}</td>
                                        <td className="d-flex justify-content-center gap-2">
                                            <button className="border-0">
                                                <Link to={{ pathname: `/edit/${item.id}` }} className="text-success">
                                                    <FontAwesomeIcon icon={faPencilAlt} />
                                                </Link>
                                            </button>
                                            <button onClick={() => borrarProducto(item.id)} className="text-danger border-0">
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
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
                    <Link to="/add-product" className="btn btn-primary">Agregar Producto</Link>
                </div>
            </div>
        </div>
    );
};

export default Administrator;
