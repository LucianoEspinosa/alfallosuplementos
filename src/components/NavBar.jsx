import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown, FaSearch } from "react-icons/fa";
import CartWidget from "./CartWidget";
import WhatsAppIcon from "./WhatsAppIcon";
import logo from "./img/alfallonegro.png";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const NavBar = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const [isBrandsOpen, setIsBrandsOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [loading, setLoading] = useState(true);
    const navRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Obtener categorías y marcas
    useEffect(() => {
        const fetchData = async () => {
            try {
                const db = getFirestore();
                const productsRef = collection(db, "fragancias");
                const snapshot = await getDocs(productsRef);
                
                const allProducts = snapshot.docs.map(doc => doc.data());
                
                const uniqueCategories = [...new Set(
                    allProducts.map(product => product.categoria).filter(Boolean)
                )].sort();
                
                const uniqueBrands = [...new Set(
                    allProducts.map(product => product.marca).filter(Boolean)
                )].sort();
                
                setCategories(uniqueCategories);
                setBrands(uniqueBrands);
                
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Búsqueda en tiempo real
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.length > 2) {
            const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            const db = getFirestore();
            const productsRef = collection(db, "fragancias");
            
            getDocs(productsRef).then(snapshot => {
                const results = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(product => 
                        product.nombre?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery) ||
                        product.marca?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery) ||
                        product.categoria?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
                    )
                    .slice(0, 5);
                
                setSearchResults(results);
                setShowSearchResults(true);
            });
        } else {
            setShowSearchResults(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault(); // ← PREVENIR EL COMPORTAMIENTO POR DEFECTO
        
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
            setShowSearchResults(false);
            closeAllMenus();
        }
    };

    const handleSearchResultClick = (product) => {
        navigate(`/item/${product.id}`);
        setSearchQuery("");
        setShowSearchResults(false);
        closeAllMenus();
    };

    const toggleNav = () => setIsNavOpen(!isNavOpen);
    const toggleProducts = () => setIsProductsOpen(!isProductsOpen);
    const toggleBrands = () => setIsBrandsOpen(!isBrandsOpen);
    const closeAllMenus = () => {
        setIsProductsOpen(false);
        setIsBrandsOpen(false);
        setIsNavOpen(false);
        setShowSearchResults(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                closeAllMenus();
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="fixed-top cabecera">
            <div className="container">
                <div className="row navbar navbar-expand-md fs-7 fs-md-5 d-flex align-items-end align-items-md-center">
                    
                    {/* Logo */}
                    <Link to={"/"} className="col-4 col-md-2 d-flex align-items-end text-decoration-none text-black">
                        <img src={logo} className="w-50 logoStyle d-md-none" alt="logo" />
                        <img src={logo} className="w-75 logoStyle d-none d-md-block" alt="logo" />
                    </Link>

                    {/* Search Bar Desktop */}
                    <div className="col-md-4 d-none d-md-block">
                        <div className="search-container position-relative" ref={searchRef}>
                            <form onSubmit={handleSearchSubmit}>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control search-input"
                                        placeholder="🔍 Buscar productos, marcas, categorías..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => searchQuery.length > 2 && setShowSearchResults(true)}
                                    />
                                 
                                </div>
                            </form>
                            
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="search-results-dropdown">
                                    {searchResults.map(product => (
                                        <div
                                            key={product.id}
                                            className="search-result-item"
                                            onClick={() => handleSearchResultClick(product)}
                                        >
                                            <div className="fw-bold">{product.nombre}</div>
                                            <small className="text-muted">
                                                {product.marca} • {product.categoria}
                                            </small>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Iconos móvil */}
                    <div className="col-8 col-md-2 d-flex d-md-none align-items-center justify-content-end gap-2">
                        
                        <CartWidget />
                        <button className="navbar-toggler custom-button" onClick={toggleNav}>
                            {isNavOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>

                    {/* Menú de navegación */}
                    <div ref={navRef} className={`col-md-3 collapse navbar-collapse flex-column py-0 ${isNavOpen ? 'show' : ''}`}>
                        
                        {/* Search Mobile */}
                        <div className="d-md-none mb-3">
                            <div className="search-container position-relative" ref={searchRef}>
                                <form onSubmit={handleSearchSubmit}>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control search-input"
                                            placeholder="🔍 Buscar productos..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                        <button className="btn btn-primary" type="submit">
                                            <FaSearch />
                                        </button>
                                    </div>
                                </form>
                                {showSearchResults && searchResults.length > 0 && (
                                    <div className="search-results-dropdown">
                                        {searchResults.slice(0, 3).map(product => (
                                            <div
                                                key={product.id}
                                                className="search-result-item"
                                                onClick={() => handleSearchResultClick(product)}
                                            >
                                                {product.nombre}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <ul className="navbar-nav mt-2 mt-md-0 w-100 d-flex justify-content-center">
                            
                            {/* Dropdown de Categorías */}
                            <li className="nav-item dropdown position-relative" 
                                onMouseEnter={() => !loading && setIsProductsOpen(true)} 
                                onMouseLeave={() => setIsProductsOpen(false)}>
                                <div className="nav-link py-0 py-2 d-flex align-items-center cursor-pointer" onClick={toggleProducts}>
                                    Categorías <FaChevronDown className="ms-1" size={12} />
                                </div>
                                
                                {!loading && categories.length > 0 && (
                                    <ul className={`dropdown-menu ${isProductsOpen ? 'show' : ''}`}>
                                        {categories.map((category, index) => (
                                            <li key={index}>
                                                <Link 
                                                    className="dropdown-item" 
                                                    to={`/category/${encodeURIComponent(category)}`}
                                                    onClick={closeAllMenus}
                                                >
                                                    {category}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>

                            {/* Dropdown de Marcas */}
                            <li className="nav-item dropdown position-relative" 
                                onMouseEnter={() => !loading && setIsBrandsOpen(true)} 
                                onMouseLeave={() => setIsBrandsOpen(false)}>
                                <div className="nav-link py-0 py-2 d-flex align-items-center cursor-pointer" onClick={toggleBrands}>
                                    Marcas <FaChevronDown className="ms-1" size={12} />
                                </div>
                                
                                {!loading && brands.length > 0 && (
                                    <ul className={`dropdown-menu ${isBrandsOpen ? 'show' : ''}`}>
                                        {brands.map((brand, index) => (
                                            <li key={index}>
                                                <Link 
                                                    className="dropdown-item" 
                                                    to={`/brand/${encodeURIComponent(brand)}`}
                                                    onClick={closeAllMenus}
                                                >
                                                    {brand}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link py-0 py-2" to={"/ofertas"} onClick={closeAllMenus}>
                                    🎯 Ofertas
                                </Link>
                            </li>

                        </ul>
                    </div>

                    {/* Carrito desktop */}
                    <div className="col-md-2 d-none d-md-flex justify-content-end align-items-center">
                        <CartWidget />
                    </div>
                </div>
            </div>
            <WhatsAppIcon />
        </div>
    );
};

export default NavBar;