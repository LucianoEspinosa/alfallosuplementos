
// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { getFirestore, collection, getDocs } from "firebase/firestore";

// const Search = ({ isMobile = false, onClose, darkMode = false }) => {
//     const [searchQuery, setSearchQuery] = useState("");
//     const [searchResults, setSearchResults] = useState({
//         products: [],
//         categories: [],
//         brands: []
//     });
//     const [showSearchResults, setShowSearchResults] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const searchRef = useRef(null);
//     const navigate = useNavigate();

//     // Búsqueda en tiempo real
//     const handleSearch = async (query) => {
//         setSearchQuery(query);

//         if (query.length > 1) {
//             setLoading(true);
//             const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

//             try {
//                 const db = getFirestore();
//                 const productsRef = collection(db, "fragancias");
//                 const snapshot = await getDocs(productsRef);

//                 const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//                 // Filtrar resultados
//                 const productResults = allProducts.filter(product => {
//                     const searchText = `
//                         ${product.nombre || ''} 
//                         ${product.marca || ''} 
//                         ${product.categoria || ''}
//                         ${product.descripcion || ''}
//                         ${product.presentacion || ''}
//                     `.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

//                     return searchText.includes(normalizedQuery);
//                 }).slice(0, 8);

//                 const categoryResults = [...new Set(allProducts.map(p => p.categoria))].filter(categoria =>
//                     categoria && categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
//                 ).slice(0, 3);

//                 const brandResults = [...new Set(allProducts.map(p => p.marca))].filter(marca =>
//                     marca && marca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
//                 ).slice(0, 3);

//                 setSearchResults({
//                     products: productResults,
//                     categories: categoryResults,
//                     brands: brandResults
//                 });

//                 setShowSearchResults(true);
//             } catch (error) {
//                 console.error("Error en búsqueda:", error);
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             setShowSearchResults(false);
//         }
//     };

//     const handleSearchSubmit = (e) => {
//         e.preventDefault();
//         if (searchQuery.trim()) {
//             navigate(`/?search=${encodeURIComponent(searchQuery)}`);
//             setSearchQuery("");
//             setShowSearchResults(false);
//             if (onClose) onClose(); // Cierra el nav al buscar
//         }
//     };

//     const handleProductClick = (productId) => {
//         navigate(`/item/${productId}`);
//         setSearchQuery("");
//         setShowSearchResults(false);
//         if (onClose) onClose(); // Cierra el nav al seleccionar
//     };

//     const handleCategoryClick = (category) => {
//         navigate(`/category/${encodeURIComponent(category)}`);
//         setSearchQuery("");
//         setShowSearchResults(false);
//         if (onClose) onClose(); // Cierra el nav al seleccionar
//     };

//     const handleBrandClick = (brand) => {
//         navigate(`/brand/${encodeURIComponent(brand)}`);
//         setSearchQuery("");
//         setShowSearchResults(false);
//         if (onClose) onClose(); // Cierra el nav al seleccionar
//     };

//     const handleSeeAllResults = () => {
//         navigate(`/?search=${encodeURIComponent(searchQuery)}`);
//         setShowSearchResults(false);
//         if (onClose) onClose(); // Cierra el nav al ver todos
//     };

//     // Cerrar resultados al hacer clic fuera
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (searchRef.current && !searchRef.current.contains(event.target)) {
//                 setShowSearchResults(false);
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     // Clases CSS condicionales para modo oscuro
//     const inputClass = darkMode 
//         ? "form-control search-input bg-dark text-light border-secondary" 
//         : "form-control search-input";

//     const resultsDropdownClass = darkMode 
//         ? "search-results-dropdown bg-dark border-secondary" 
//         : "search-results-dropdown";

//     const resultItemClass = darkMode 
//         ? "search-result-item text-light border-secondary" 
//         : "search-result-item";

//     const resultHeaderClass = darkMode 
//         ? "search-result-header bg-secondary text-light" 
//         : "search-result-header";

//     const textMutedClass = darkMode 
//         ? "text-light" 
//         : "text-muted";

//     const SearchResultsDropdown = () => {
//         if (loading) {
//             return (
//                 <div className={resultsDropdownClass}>
//                     <div className={`${resultItemClass} text-center`}>
//                         <div className="spinner-border spinner-border-sm text-light" role="status">
//                             <span className="visually-hidden">Buscando...</span>
//                         </div>
//                         <small className="ms-2 text-light">Buscando...</small>
//                     </div>
//                 </div>
//             );
//         }

//         if (!searchResults.products.length && !searchResults.categories.length && !searchResults.brands.length) {
//             return (
//                 <div className={resultsDropdownClass}>
//                     <div className={`${resultItemClass} ${textMutedClass}`}>
//                         <i className="fas fa-search me-2"></i>
//                         No se encontraron resultados para "{searchQuery}"
//                     </div>
//                 </div>
//             );
//         }

//         return (
//             <div className={resultsDropdownClass}>
//                 {/* PRODUCTOS */}
//                 {searchResults.products.length > 0 && (
//                     <>
//                         <div className={resultHeaderClass}>
//                             <i className="fas fa-cube me-2"></i>
//                             PRODUCTOS
//                         </div>
//                         {searchResults.products.map(product => (
//                             <div
//                                 key={product.id}
//                                 className={resultItemClass}
//                                 onClick={() => handleProductClick(product.id)}
//                                 style={{ cursor: 'pointer' }}
//                             >
//                                 <div className="d-flex align-items-center">
//                                     <img
//                                         src={product.img}
//                                         alt={product.nombre}
//                                         className="search-result-image"
//                                         style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
//                                         onError={(e) => {
//                                             e.target.src = 'https://via.placeholder.com/40x40/333/fff?text=Imagen';
//                                         }}
//                                     />
//                                     <div className="ms-2 flex-grow-1">
//                                         <div className="fw-bold">{product.nombre}</div>
//                                         <div className="d-flex justify-content-between align-items-center">
//                                             <small className={textMutedClass}>
//                                                 {product.marca} • {product.presentacion}
//                                             </small>
//                                             <span className="text-success fw-bold">
//                                                 ${product.precio?.toLocaleString('es-AR')}
//                                             </span>
//                                         </div>
//                                         {product.categoria && (
//                                             <small className="text-info">
//                                                 <i className="fas fa-tag me-1"></i>
//                                                 {product.categoria}
//                                             </small>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </>
//                 )}

//                 {/* CATEGORÍAS */}
//                 {searchResults.categories.length > 0 && (
//                     <>
//                         <div className={resultHeaderClass}>
//                             <i className="fas fa-tag me-2"></i>
//                             CATEGORÍAS
//                         </div>
//                         {searchResults.categories.map(category => (
//                             <div
//                                 key={category}
//                                 className={resultItemClass}
//                                 onClick={() => handleCategoryClick(category)}
//                                 style={{ cursor: 'pointer' }}
//                             >
//                                 <i className="fas fa-folder me-2 text-primary"></i>
//                                 {category}
//                             </div>
//                         ))}
//                     </>
//                 )}

//                 {/* MARCAS */}
//                 {searchResults.brands.length > 0 && (
//                     <>
//                         <div className={resultHeaderClass}>
//                             <i className="fas fa-star me-2"></i>
//                             MARCAS
//                         </div>
//                         {searchResults.brands.map(brand => (
//                             <div
//                                 key={brand}
//                                 className={resultItemClass}
//                                 onClick={() => handleBrandClick(brand)}
//                                 style={{ cursor: 'pointer' }}
//                             >
//                                 <i className="fas fa-copyright me-2 text-warning"></i>
//                                 {brand}
//                             </div>
//                         ))}
//                     </>
//                 )}

//                 {/* VER TODOS */}
//                 {(searchResults.products.length > 0) && (
//                     <div className="search-result-footer">
//                         <button
//                             className={`btn btn-sm w-100 ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}
//                             onClick={handleSeeAllResults}
//                         >
//                             <i className="fas fa-eye me-1"></i>
//                             Ver todos los resultados para "{searchQuery}"
//                         </button>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     return (
//         <div className="search-container position-relative" ref={searchRef}>
//             <form onSubmit={handleSearchSubmit}>
//                 <div className="input-group">
//                     <input
//                         type="text"
//                         className={inputClass}
//                         placeholder={isMobile ? "🔍 Buscar productos..." : "🔍 Buscar productos, marcas, categorías..."}
//                         value={searchQuery}
//                         onChange={(e) => handleSearch(e.target.value)}
//                         onFocus={() => searchQuery.length > 1 && setShowSearchResults(true)}
//                         autoFocus={isMobile}
//                         style={{
//                             borderColor: '#dee2e6', // Gris en lugar de azul
//                             boxShadow: 'none', // Elimina el glow azul
//                             backgroundColor: darkMode ? '#343a40' : '#fff',
//                             color: darkMode ? '#fff' : '#000',
//                             borderRadius: '0.375rem'
//                         }}
//                     />
//                 </div>
//             </form>

//             {showSearchResults && (
//                 <div style={{ 
//                     position: 'absolute', 
//                     top: '100%', 
//                     left: 0, 
//                     right: 0, 
//                     zIndex: 1060,
//                     marginTop: '5px'
//                 }}>
//                     <SearchResultsDropdown />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Search;

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const Search = ({ isMobile = false, onClose, darkMode = false }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [searchResults, setSearchResults] = useState({
        products: [],
        categories: [],
        brands: []
    });
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Efecto para cargar todos los productos una sola vez al montar el componente
    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);
            try {
                const db = getFirestore();
                const productsRef = collection(db, "fragancias");
                const snapshot = await getDocs(productsRef);
                const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllProducts(productsData);
            } catch (error) {
                console.error("Error al cargar los productos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllProducts();
    }, []);

    // Búsqueda en tiempo real (ahora filtra por palabras clave)
    const handleSearch = (query) => {
        setSearchQuery(query);

        if (query.length > 1) {
            const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            // Divide la consulta del usuario en palabras individuales
            const keywords = normalizedQuery.split(/\s+/).filter(Boolean); // Divide por espacios y elimina vacíos

            // Filtrar productos
            const productResults = allProducts.filter(product => {
                const searchText = `
                    ${product.nombre || ''} 
                    ${product.marca || ''} 
                    ${product.categoria || ''}
                    ${product.descripcion || ''}
                    ${product.presentacion || ''}
                `.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                // Verifica si TODAS las palabras clave están incluidas en el searchText
                return keywords.every(keyword => searchText.includes(keyword));

            }).slice(0, 8);

            // Filtrar categorías
            const categoryResults = [...new Set(allProducts.map(p => p.categoria))].filter(categoria =>
                categoria && keywords.every(keyword => categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(keyword))
            ).slice(0, 3);

            // Filtrar marcas
            const brandResults = [...new Set(allProducts.map(p => p.marca))].filter(marca =>
                marca && keywords.every(keyword => marca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(keyword))
            ).slice(0, 3);

            setSearchResults({
                products: productResults,
                categories: categoryResults,
                brands: brandResults
            });
            setShowSearchResults(true);
        } else {
            setShowSearchResults(false);
        }
    };

    // Funciones de navegación (sin cambios)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
            setShowSearchResults(false);
            if (onClose) onClose();
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/item/${productId}`);
        setSearchQuery("");
        setShowSearchResults(false);
        if (onClose) onClose();
    };

    const handleCategoryClick = (category) => {
        navigate(`/category/${encodeURIComponent(category)}`);
        setSearchQuery("");
        setShowSearchResults(false);
        if (onClose) onClose();
    };

    const handleBrandClick = (brand) => {
        navigate(`/brand/${encodeURIComponent(brand)}`);
        setSearchQuery("");
        setShowSearchResults(false);
        if (onClose) onClose();
    };

    const handleSeeAllResults = () => {
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        setShowSearchResults(false);
        if (onClose) onClose();
    };

    // Cerrar resultados al hacer clic fuera (sin cambios)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Clases CSS y JSX del render (sin cambios)
    const inputClass = darkMode 
        ? "form-control search-input bg-dark text-light border-secondary" 
        : "form-control search-input";
    const resultsDropdownClass = darkMode 
        ? "search-results-dropdown bg-dark border-secondary" 
        : "search-results-dropdown";
    const resultItemClass = darkMode 
        ? "search-result-item text-light border-secondary" 
        : "search-result-item";
    const resultHeaderClass = darkMode 
        ? "search-result-header bg-secondary text-light" 
        : "search-result-header";
    const textMutedClass = darkMode 
        ? "text-light" 
        : "text-muted";

    const SearchResultsDropdown = () => {
        if (loading) {
            return (
                <div className={resultsDropdownClass}>
                    <div className={`${resultItemClass} text-center`}>
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Buscando...</span>
                        </div>
                        <small className="ms-2">Cargando productos...</small>
                    </div>
                </div>
            );
        }

        if (searchQuery.length > 1 && !searchResults.products.length && !searchResults.categories.length && !searchResults.brands.length) {
            return (
                <div className={resultsDropdownClass}>
                    <div className={`${resultItemClass} ${textMutedClass}`}>
                        <i className="fas fa-search me-2"></i>
                        No se encontraron resultados para "{searchQuery}"
                    </div>
                </div>
            );
        }
        
        return (
            <div className={resultsDropdownClass}>
                {searchResults.products.length > 0 && (
                    <>
                        <div className={resultHeaderClass}>
                            <i className="fas fa-cube me-2"></i> PRODUCTOS
                        </div>
                        {searchResults.products.map(product => (
                            <div
                                key={product.id}
                                className={resultItemClass}
                                onClick={() => handleProductClick(product.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center">
                                    <img
                                        src={product.img}
                                        alt={product.nombre}
                                        className="search-result-image"
                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/40x40/333/fff?text=Imagen';
                                        }}
                                    />
                                    <div className="ms-2 flex-grow-1">
                                        <div className="fw-bold">{product.nombre}</div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className={textMutedClass}>
                                                {product.marca} • {product.presentacion}
                                            </small>
                                            <span className="text-success fw-bold">
                                                ${product.precio?.toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                        {product.categoria && (
                                            <small className="text-info">
                                                <i className="fas fa-tag me-1"></i>
                                                {product.categoria}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {searchResults.categories.length > 0 && (
                    <>
                        <div className={resultHeaderClass}>
                            <i className="fas fa-tag me-2"></i> CATEGORÍAS
                        </div>
                        {searchResults.categories.map(category => (
                            <div
                                key={category}
                                className={resultItemClass}
                                onClick={() => handleCategoryClick(category)}
                                style={{ cursor: 'pointer' }}
                            >
                                <i className="fas fa-folder me-2 text-primary"></i>
                                {category}
                            </div>
                        ))}
                    </>
                )}

                {searchResults.brands.length > 0 && (
                    <>
                        <div className={resultHeaderClass}>
                            <i className="fas fa-star me-2"></i> MARCAS
                        </div>
                        {searchResults.brands.map(brand => (
                            <div
                                key={brand}
                                className={resultItemClass}
                                onClick={() => handleBrandClick(brand)}
                                style={{ cursor: 'pointer' }}
                            >
                                <i className="fas fa-copyright me-2 text-warning"></i>
                                {brand}
                            </div>
                        ))}
                    </>
                )}

                {(searchResults.products.length > 0) && (
                    <div className="search-result-footer">
                        <button
                            className={`btn btn-sm w-100 ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}
                            onClick={handleSeeAllResults}
                        >
                            <i className="fas fa-eye me-1"></i>
                            Ver todos los resultados para "{searchQuery}"
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="search-container position-relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
                <div className="input-group">
                    <input
                        type="text"
                        className={inputClass}
                        placeholder={isMobile ? "🔍 Buscar productos..." : "🔍 Buscar productos, marcas, categorías..."}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => searchQuery.length > 1 && setShowSearchResults(true)}
                        autoFocus={isMobile}
                        style={{
                            borderColor: '#dee2e6',
                            boxShadow: 'none',
                            backgroundColor: darkMode ? '#343a40' : '#fff',
                            color: darkMode ? '#fff' : '#000',
                            borderRadius: '0.375rem'
                        }}
                    />
                </div>
            </form>

            {showSearchResults && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1060,
                    marginTop: '5px'
                }}>
                    <SearchResultsDropdown />
                </div>
            )}
        </div>
    );
};

export default Search;