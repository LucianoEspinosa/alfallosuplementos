
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrashAlt,
    faPencilAlt,
    faFilter,
    faListAlt,
    faBox,
    faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import ConsultaVoz from "./ConsultaVoz";
import { formatoPrecio } from "../utils/productos";
import "../styles/admin.css";

const leerGuardado = (clave, porDefecto) => {
    try {
        const v = localStorage.getItem(clave);
        return v ? JSON.parse(v) : porDefecto;
    } catch (e) {
        return porDefecto;
    }
};

const guardar = (clave, valor) => {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) {
        // sin localStorage: se ignora
    }
};

const Administrator = () => {
    const [items, setItems] = useState([]);
    const [cargado, setCargado] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [aBorrar, setABorrar] = useState(null); // id del producto que pide confirmación

    // Filtros guardados en localStorage
    const [filtros, setFiltros] = useState(() => leerGuardado('adminFilters', { marca: '', categoria: '' }));
    const [mostrarFiltros, setMostrarFiltros] = useState(() => leerGuardado('showFilters', false));

    useEffect(() => {
        const db = getFirestore();
        getDocs(collection(db, "fragancias"))
            .then(resultado => {
                const productos = resultado.docs.map(producto => ({ id: producto.id, ...producto.data() }));
                setItems(productos);
                setMarcas([...new Set(productos.map(item => item.marca))].filter(Boolean).sort());
                setCategorias([...new Set(productos.map(item => item.categoria))].filter(Boolean).sort());
            })
            .catch(error => console.error("Error cargando productos", error))
            .finally(() => setCargado(true));
    }, []);

    useEffect(() => { guardar('adminFilters', filtros); }, [filtros]);
    useEffect(() => { guardar('showFilters', mostrarFiltros); }, [mostrarFiltros]);

    useEffect(() => {
        let resultados = [...items];
        if (filtros.marca) resultados = resultados.filter(item => item.marca === filtros.marca);
        if (filtros.categoria) resultados = resultados.filter(item => item.categoria === filtros.categoria);
        setFilteredItems(resultados);
    }, [filtros, items]);

    const borrarProducto = async (productId) => {
        const db = getFirestore();
        try {
            await deleteDoc(doc(collection(db, "fragancias"), productId));
            setItems(prev => prev.filter(item => item.id !== productId));
        } catch (error) {
            console.error("Error al eliminar el producto", error);
        } finally {
            setABorrar(null);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const limpiarFiltros = () => setFiltros({ marca: '', categoria: '' });
    const hayFiltros = filtros.marca || filtros.categoria;

    return (
        <div className="adm">
            {/* Encabezado */}
            <div className="adm-head">
                <h1 className="adm-title"><small>Al Fallo</small>Administrador</h1>
                <nav className="adm-actions">
                    <Link to="/excel" className="adm-action">
                        <FontAwesomeIcon icon={faFileExcel} />
                        <span>Excel</span>
                    </Link>
                    <Link to="/orders" className="adm-action">
                        <FontAwesomeIcon icon={faListAlt} />
                        <span>Órdenes</span>
                    </Link>
                    <Link to="/add-product" className="adm-action adm-action--main">
                        <FontAwesomeIcon icon={faBox} />
                        <span>Agregar</span>
                    </Link>
                </nav>
            </div>

            {/* Consultas por voz: costo, precio de venta y ganancia */}
            <ConsultaVoz />

            {/* Lista de productos */}
            <section className="adm-card">
                <div className="adm-listhead">
                    <div>
                        <h2 className="adm-h2">Productos</h2>
                        <div className="adm-muted">
                            {hayFiltros ? `${filteredItems.length} de ${items.length}` : `${items.length}`} productos
                        </div>
                    </div>
                    <button
                        type="button"
                        className={`adm-filterbtn ${mostrarFiltros || hayFiltros ? 'is-on' : ''}`}
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                        <FontAwesomeIcon icon={faFilter} />
                        Filtros{hayFiltros ? ' •' : ''}
                    </button>
                </div>

                {mostrarFiltros && (
                    <div className="adm-filters">
                        <div>
                            <label htmlFor="marca">Marca</label>
                            <select id="marca" name="marca" value={filtros.marca} onChange={handleFiltroChange}>
                                <option value="">Todas</option>
                                {marcas.map(marca => <option key={marca} value={marca}>{marca}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="categoria">Categoría</label>
                            <select id="categoria" name="categoria" value={filtros.categoria} onChange={handleFiltroChange}>
                                <option value="">Todas</option>
                                {categorias.map(categoria => <option key={categoria} value={categoria}>{categoria}</option>)}
                            </select>
                        </div>
                        <div className="adm-filters-foot">
                            <span>{filteredItems.length} resultados</span>
                            {hayFiltros && <button type="button" className="adm-link" onClick={limpiarFiltros}>Limpiar</button>}
                        </div>
                    </div>
                )}

                <div className="adm-list">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <div className="adm-row" key={item.id}>
                                {item.img
                                    ? <img src={item.img} alt="" loading="lazy" />
                                    : <span className="adm-row-noimg" />}
                                <div className="adm-row-info">
                                    {item.marca && <div className="adm-row-brand">{item.marca}</div>}
                                    <div className="adm-row-name">
                                        {item.nombre}{item.presentacion ? ` (${item.presentacion})` : ''}
                                    </div>
                                    <div className="adm-row-sub">
                                        <span className="adm-price">{formatoPrecio(item.precio)}</span>
                                        <span className={Number(item.stock) > 0 ? '' : 'is-out'}>
                                            {Number(item.stock) > 0 ? `Stock ${item.stock}` : 'Sin stock'}
                                        </span>
                                        {item.descuento > 0 && <span>-{item.descuento}%</span>}
                                    </div>
                                </div>
                                <div className="adm-row-cat">{item.categoria || '—'}</div>
                                <div className="adm-row-actions">
                                    {aBorrar === item.id ? (
                                        <>
                                            <button type="button" className="adm-cancel" onClick={() => setABorrar(null)}>No</button>
                                            <button
                                                type="button"
                                                className="adm-del is-confirm"
                                                onClick={() => borrarProducto(item.id)}
                                                aria-label="Confirmar borrado"
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link to={`/edit/${item.id}`} aria-label="Editar">
                                                <FontAwesomeIcon icon={faPencilAlt} />
                                            </Link>
                                            <button
                                                type="button"
                                                className="adm-del"
                                                onClick={() => setABorrar(item.id)}
                                                aria-label="Borrar"
                                            >
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="adm-empty">
                            {!cargado
                                ? "Cargando productos…"
                                : items.length === 0
                                    ? "No hay productos en la base de datos"
                                    : "No hay productos con esos filtros"}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Administrator;
