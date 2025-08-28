import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const Search = ({ isMobile = false }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState({
        products: [],
        categories: [],
        brands: []
    });
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Búsqueda en tiempo real
    const handleSearch = async (query) => {
        setSearchQuery(query);
        
        if (query.length > 1) {
            setLoading(true);
            const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            try {
                const db = getFirestore();
                const productsRef = collection(db, "fragancias");
                const snapshot = await getDocs(productsRef);
                
                const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Filtrar resultados
                const productResults = allProducts.filter(product => {
                    const searchText = `
                        ${product.nombre || ''} 
                        ${product.marca || ''} 
                        ${product.categoria || ''}
                        ${product.descripcion || ''}
                        ${product.presentacion || ''}
                    `.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    
                    return searchText.includes(normalizedQuery);
                }).slice(0, 8);

                const categoryResults = [...new Set(allProducts.map(p => p.categoria))].filter(categoria => 
                    categoria && categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
                ).slice(0, 3);

                const brandResults = [...new Set(allProducts.map(p => p.marca))].filter(marca => 
                    marca && marca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
                ).slice(0, 3);

                setSearchResults({
                    products: productResults,
                    categories: categoryResults,
                    brands: brandResults
                });
                
                setShowSearchResults(true);
            } catch (error) {
                console.error("Error en búsqueda:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setShowSearchResults(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
            setShowSearchResults(false);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/item/${productId}`);
        setSearchQuery("");
        setShowSearchResults(false);
    };

    const handleCategoryClick = (category) => {
        navigate(`/category/${encodeURIComponent(category)}`);
        setSearchQuery("");
        setShowSearchResults(false);
    };

    const handleBrandClick = (brand) => {
        navigate(`/brand/${encodeURIComponent(brand)}`);
        setSearchQuery("");
        setShowSearchResults(false);
    };

    const handleSeeAllResults = () => {
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        setShowSearchResults(false);
    };

    // Cerrar resultados al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const SearchResultsDropdown = () => {
        if (loading) {
            return (
                <div className="search-results-dropdown">
                    <div className="search-result-item text-center">
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Buscando...</span>
                        </div>
                        <small className="ms-2">Buscando...</small>
                    </div>
                </div>
            );
        }

        if (!searchResults.products.length && !searchResults.categories.length && !searchResults.brands.length) {
            return (
                <div className="search-results-dropdown">
                    <div className="search-result-item text-muted">
                        <i className="fas fa-search me-2"></i>
                        No se encontraron resultados para "{searchQuery}"
                    </div>
                </div>
            );
        }

        return (
            <div className="search-results-dropdown">
                {/* PRODUCTOS */}
                {searchResults.products.length > 0 && (
                    <>
                        <div className="search-result-header">
                            <i className="fas fa-cube me-2"></i>
                            PRODUCTOS
                        </div>
                        {searchResults.products.map(product => (
                            <div
                                key={product.id}
                                className="search-result-item"
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
                                            e.target.src = 'https://via.placeholder.com/40x40?text=Imagen';
                                        }}
                                    />
                                    <div className="ms-2 flex-grow-1">
                                        <div className="fw-bold">{product.nombre}</div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
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

                {/* CATEGORÍAS */}
                {searchResults.categories.length > 0 && (
                    <>
                        <div className="search-result-header">
                            <i className="fas fa-tag me-2"></i>
                            CATEGORÍAS
                        </div>
                        {searchResults.categories.map(category => (
                            <div
                                key={category}
                                className="search-result-item"
                                onClick={() => handleCategoryClick(category)}
                                style={{ cursor: 'pointer' }}
                            >
                                <i className="fas fa-folder me-2 text-primary"></i>
                                {category}
                            </div>
                        ))}
                    </>
                )}

                {/* MARCAS */}
                {searchResults.brands.length > 0 && (
                    <>
                        <div className="search-result-header">
                            <i className="fas fa-star me-2"></i>
                            MARCAS
                        </div>
                        {searchResults.brands.map(brand => (
                            <div
                                key={brand}
                                className="search-result-item"
                                onClick={() => handleBrandClick(brand)}
                                style={{ cursor: 'pointer' }}
                            >
                                <i className="fas fa-copyright me-2 text-warning"></i>
                                {brand}
                            </div>
                        ))}
                    </>
                )}

                {/* VER TODOS */}
                {(searchResults.products.length > 0) && (
                    <div className="search-result-footer">
                        <button 
                            className="btn btn-sm btn-outline-primary w-100"
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
                        className="form-control search-input"
                        placeholder={isMobile ? "🔍 Buscar productos..." : "🔍 Buscar productos, marcas, categorías..."}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => searchQuery.length > 1 && setShowSearchResults(true)}
                    />
                    {isMobile && (
                        <button className="btn btn-primary" type="submit">
                            <i className="fas fa-search"></i>
                        </button>
                    )}
                </div>
            </form>
            
            {showSearchResults && <SearchResultsDropdown />}
        </div>
    );
};

export default Search;