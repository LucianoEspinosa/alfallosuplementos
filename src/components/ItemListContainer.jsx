import { useEffect, useState, useCallback } from "react";
import ItemList from "./ItemList";
import { useParams, Link, useLocation, useSearchParams } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Loading from "./Loading";
import FilterBar from "./FilterBar";
import CategoryCards from "./CategoryCards";

const ItemListContainer = ({ top, oferta, titulo }) => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("nombre");
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [showFilters, setShowFilters] = useState(false);
    const { id } = useParams();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search');

    // Función para normalizar texto (eliminar acentos)
    const normalizarTexto = useCallback((texto) => {
        if (!texto) return '';
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }, []);

    // Verificar si estamos en la página principal de productos
    const isHomePage = !id && !searchTerm && location.pathname === "/";

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const db = getFirestore();
            const itemsCollection = collection(db, "fragancias");
            
            try {
                const resultado = await getDocs(itemsCollection);
                
                if (resultado.size > 0) {
                    const todosLosProductos = resultado.docs.map(producto => ({ 
                        id: producto.id, 
                        ...producto.data() 
                    }));
                    
                    setItems(todosLosProductos);
                    
                    // Función para aplicar filtros básicos
                    const aplicarFiltrosBasicos = (productos) => {
                        let filtrados = [...productos];
                        
                        // PRIMERO: Verificar si hay búsqueda
                        if (searchTerm) {
                            // Aplicar filtro de búsqueda
                            const normalizedSearch = normalizarTexto(searchTerm);
                            filtrados = filtrados.filter(item =>
                                normalizarTexto(item.nombre || '').includes(normalizedSearch) ||
                                normalizarTexto(item.marca || '').includes(normalizedSearch) ||
                                normalizarTexto(item.categoria || '').includes(normalizedSearch) ||
                                normalizarTexto(item.descripcion || '').includes(normalizedSearch)
                            );
                        }
                        else if (oferta) {
                            filtrados = filtrados.filter(item => item.descuento > 0);
                        } else if (id) {
                            const esMarca = location.pathname.includes('/brand/');
                            const textoBuscado = normalizarTexto(decodeURIComponent(id));
                            
                            if (esMarca) {
                                filtrados = filtrados.filter(item => 
                                    item.marca && normalizarTexto(item.marca) === textoBuscado
                                );
                            } else {
                                filtrados = filtrados.filter(item => 
                                    item.categoria && normalizarTexto(item.categoria) === textoBuscado
                                );
                            }
                        } else if (top) {
                            filtrados = filtrados.filter(item => item.stock < 15);
                        }
                        
                        return filtrados;
                    };

                    // Función para aplicar ordenamiento
                    const aplicarOrdenamiento = (productos, tipoOrden) => {
                        return [...productos].sort((a, b) => {
                            switch (tipoOrden) {
                                case "precio-asc":
                                    return (a.precio || 0) - (b.precio || 0);
                                case "precio-desc":
                                    return (b.precio || 0) - (a.precio || 0);
                                case "nombre":
                                    return (a.nombre || '').localeCompare(b.nombre || '');
                                case "nuevos":
                                    return new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0);
                                default:
                                    return 0;
                            }
                        });
                    };

                    // Aplicar filtros básicos
                    let productosFiltrados = aplicarFiltrosBasicos(todosLosProductos);
                    
                    // Aplicar ordenamiento
                    productosFiltrados = aplicarOrdenamiento(productosFiltrados, sortBy);
                    
                    setFilteredItems(productosFiltrados);
                } else {
                    setItems([]);
                    setFilteredItems([]);
                }
            } catch (error) {
                console.error("Error al cargar productos:", error);
                setItems([]);
                setFilteredItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [id, top, oferta, normalizarTexto, location.pathname, sortBy, searchTerm]);

    // Handlers para FilterBar
    const handleSortChange = (sortType) => {
        setSortBy(sortType);
        const sorted = [...filteredItems].sort((a, b) => {
            switch (sortType) {
                case "precio-asc":
                    return (a.precio || 0) - (b.precio || 0);
                case "precio-desc":
                    return (b.precio || 0) - (a.precio || 0);
                case "nombre":
                    return (a.nombre || '').localeCompare(b.nombre || '');
                case "nuevos":
                    return new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0);
                default:
                    return 0;
            }
        });
        setFilteredItems(sorted);
    };

    const handlePriceFilter = (min, max) => {
        setPriceRange([min, max]);
        // Filtrar desde los items ya filtrados (no desde todos)
        const filtrados = filteredItems.filter(item => 
            (item.precio || 0) >= min && (item.precio || 0) <= max
        );
        setFilteredItems(filtrados);
    };

    const handleClearFilters = () => {
        setSortBy("nombre");
        setPriceRange([0, 100000]);
        
        // Restaurar los filtros originales
        if (searchTerm) {
            const normalizedSearch = normalizarTexto(searchTerm);
            const filtrados = items.filter(item =>
                normalizarTexto(item.nombre || '').includes(normalizedSearch) ||
                normalizarTexto(item.marca || '').includes(normalizedSearch) ||
                normalizarTexto(item.categoria || '').includes(normalizedSearch) ||
                normalizarTexto(item.descripcion || '').includes(normalizedSearch)
            );
            setFilteredItems(filtrados);
        }
        else if (id) {
            const esMarca = location.pathname.includes('/brand/');
            const textoBuscado = normalizarTexto(decodeURIComponent(id));
            
            const filtrados = items.filter(item => {
                if (esMarca) {
                    return item.marca && normalizarTexto(item.marca) === textoBuscado;
                } else {
                    return item.categoria && normalizarTexto(item.categoria) === textoBuscado;
                }
            });
            setFilteredItems(filtrados);
        } else {
            setFilteredItems(items);
        }
        
        setShowFilters(false);
    };

    // Determinar el título dinámico
    const getTitulo = () => {
        if (searchTerm) {
            return `Búsqueda: "${decodeURIComponent(searchTerm)}"`;
        }
        if (id) {
            return decodeURIComponent(id);
        }
        if (titulo) return titulo;
        return <h2>Productos</h2>;
    };

    // Ocultar breadcrumb si hay búsqueda
    const showBreadcrumb = (id || location.pathname.includes('/brand/')) && !searchTerm;

    return (
        <div className="container alto my-5">
            {/* Breadcrumbs de navegación */}
            {showBreadcrumb && (
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb justify-content-center">
                        <li className="breadcrumb-item">
                            <Link to="/" className="text-decoration-none">
                                Inicio
                            </Link>
                        </li>
                        {location.pathname.includes('/brand/') && (
                            <li className="breadcrumb-item">
                                <Link to="/" className="text-decoration-none">
                                    Marcas
                                </Link>
                            </li>
                        )}
                        <li className="breadcrumb-item active text-capitalize">
                            {id ? decodeURIComponent(id) : ''}
                        </li>
                    </ol>
                </nav>
            )}

            {/* Tarjetas de categorías - Solo en página principal */}
            {isHomePage && <CategoryCards />}

            {/* Título después de las categorías */}
            <div className="row text-center mb-4">
                <div className="col">
                    <h1 className="text-capitalize fw-bold">{getTitulo()}</h1>
                </div>
            </div>

            {/* Botón para mostrar/ocultar filtros */}
            {items.length > 0 && filteredItems.length > 0 && (
                <div className="row mb-4">
                    <div className="col">
                        <button 
                            className={`btn ${showFilters ? 'btn-secondary' : 'btn-outline-primary'}`}
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ transition: 'all 0.3s ease' }}
                        >
                            {showFilters ? '▲ Ocultar Filtros' : '▼ Mostrar Filtros'}
                        </button>
                    </div>
                </div>
            )}

            {/* FilterBar - Solo mostrar si está activo y hay productos */}
            {showFilters && items.length > 0 && filteredItems.length > 0 && (
                <FilterBar
                    onSortChange={handleSortChange}
                    onPriceFilter={handlePriceFilter}
                    onClearFilters={handleClearFilters}
                    sortBy={sortBy}
                    priceRange={priceRange}
                    productCount={filteredItems.length}
                    totalProducts={items.length}
                />
            )}

            {/* Mensaje cuando no hay productos */}
            {!loading && filteredItems.length === 0 && (
                <div className="text-center py-5">
                    <div className="py-4">
                        <h4 className="text-muted mb-3">😔 No se encontraron productos</h4>
                        <p className="text-muted mb-4">
                            {searchTerm ? 
                                "Intenta con otros términos de búsqueda" :
                                id ? 
                                `Pronto tendremos más stock ${location.pathname.includes('/brand/') ? 'de esta marca' : 'en esta categoría'}` : 
                                "Intenta con otros filtros o visita nuestras otras secciones"
                            }
                        </p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button 
                                className="btn btn-primary"
                                onClick={handleClearFilters}
                            >
                                ↺ Limpiar filtros
                            </button>
                            <Link to="/" className="btn btn-outline-secondary">
                                ← Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de productos */}
            <div className="row justify-content-center">
                {loading ? (
                    <Loading />
                ) : filteredItems.length > 0 ? (
                    <ItemList items={filteredItems} />
                ) : null}
            </div>

            {/* Botón para volver al inicio cuando hay filtros aplicados */}
            {(id || oferta || top || searchTerm) && filteredItems.length > 0 && (
                <div className="row mt-5">
                    <div className="col text-center">
                        <Link 
                            to="/" 
                            className="btn btn-outline-secondary"
                        >
                            ← Ver todos los productos
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemListContainer;