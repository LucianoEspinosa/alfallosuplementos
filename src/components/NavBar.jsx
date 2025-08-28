// import React, { useState, useRef, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaBars, FaTimes, FaChevronDown, FaSearch } from "react-icons/fa";
// import CartWidget from "./CartWidget";
// import WhatsAppIcon from "./WhatsAppIcon";
// import logo from "./img/alfallonegro.png";
// import { getFirestore, collection, getDocs } from "firebase/firestore";

// const NavBar = () => {
//     const [isNavOpen, setIsNavOpen] = useState(false);
//     const [isProductsOpen, setIsProductsOpen] = useState(false);
//     const [isBrandsOpen, setIsBrandsOpen] = useState(false);
//     const [categories, setCategories] = useState([]);
//     const [brands, setBrands] = useState([]);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [searchResults, setSearchResults] = useState({
//         products: [],
//         categories: [],
//         brands: []
//     });
//     const [showSearchResults, setShowSearchResults] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const navRef = useRef(null);
//     const searchRef = useRef(null);
//     const navigate = useNavigate();

//     // Obtener categorías y marcas
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const db = getFirestore();
//                 const productsRef = collection(db, "fragancias");
//                 const snapshot = await getDocs(productsRef);

//                 const allProducts = snapshot.docs.map(doc => doc.data());

//                 const uniqueCategories = [...new Set(
//                     allProducts.map(product => product.categoria).filter(Boolean)
//                 )].sort();

//                 const uniqueBrands = [...new Set(
//                     allProducts.map(product => product.marca).filter(Boolean)
//                 )].sort();

//                 setCategories(uniqueCategories);
//                 setBrands(uniqueBrands);

//             } catch (error) {
//                 console.error("Error:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     // Búsqueda en tiempo real MEJORADA
//     const handleSearch = (query) => {
//         setSearchQuery(query);
//         if (query.length > 1) {
//             const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
//             const db = getFirestore();
//             const productsRef = collection(db, "fragancias");

//             getDocs(productsRef).then(snapshot => {
//                 const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
//                 // 1. BUSCAR PRODUCTOS (en 5 campos)
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

//                 // 2. BUSCAR CATEGORÍAS
//                 const categoryResults = [...new Set(allProducts.map(p => p.categoria))].filter(categoria => 
//                     categoria && categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
//                 ).slice(0, 3);

//                 // 3. BUSCAR MARCAS
//                 const brandResults = [...new Set(allProducts.map(p => p.marca))].filter(marca => 
//                     marca && marca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedQuery)
//                 ).slice(0, 3);

//                 setSearchResults({
//                     products: productResults,
//                     categories: categoryResults,
//                     brands: brandResults
//                 });
                
//                 setShowSearchResults(true);
//             });
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
//             closeAllMenus();
//         }
//     };

//     const handleSearchResultClick = (product) => {
//         navigate(`/item/${product.id}`);
//         setSearchQuery("");
//         setShowSearchResults(false);
//         closeAllMenus();
//     };

//     // Componente de resultados de búsqueda
//     const SearchResultsDropdown = () => {
//         if (!searchResults.products.length && !searchResults.categories.length && !searchResults.brands.length) {
//             return (
//                 <div className="search-results-dropdown">
//                     <div className="search-result-item text-muted">
//                         <i className="fas fa-search me-2"></i>
//                         No se encontraron resultados para "{searchQuery}"
//                     </div>
//                 </div>
//             );
//         }

//         return (
//             <div className="search-results-dropdown">
//                 {/* PRODUCTOS */}
//                 {searchResults.products.length > 0 && (
//                     <>
//                         <div className="search-result-header">
//                             <i className="fas fa-cube me-2"></i>
//                             PRODUCTOS
//                         </div>
//                         {searchResults.products.map(product => (
//                             <div
//                                 key={product.id}
//                                 className="search-result-item"
//                                 onClick={() => handleSearchResultClick(product)}
//                             >
//                                 <div className="d-flex align-items-center">
//                                     <img 
//                                         src={product.img} 
//                                         alt={product.nombre}
//                                         className="search-result-image"
//                                     />
//                                     <div className="ms-2 flex-grow-1">
//                                         <div className="fw-bold">{product.nombre}</div>
//                                         <div className="d-flex justify-content-between align-items-center">
//                                             <small className="text-muted">
//                                                 {product.marca} • {product.presentacion}
//                                             </small>
//                                             <span className="text-success fw-bold">
//                                                 ${product.precio}
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
//                         <div className="search-result-header">
//                             <i className="fas fa-tag me-2"></i>
//                             CATEGORÍAS
//                         </div>
//                         {searchResults.categories.map(category => (
//                             <div
//                                 key={category}
//                                 className="search-result-item"
//                                 onClick={() => {
//                                     navigate(`/category/${encodeURIComponent(category)}`);
//                                     setShowSearchResults(false);
//                                     setSearchQuery("");
//                                 }}
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
//                         <div className="search-result-header">
//                             <i className="fas fa-star me-2"></i>
//                             MARCAS
//                         </div>
//                         {searchResults.brands.map(brand => (
//                             <div
//                                 key={brand}
//                                 className="search-result-item"
//                                 onClick={() => {
//                                     navigate(`/brand/${encodeURIComponent(brand)}`);
//                                     setShowSearchResults(false);
//                                     setSearchQuery("");
//                                 }}
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
//                             className="btn btn-sm btn-outline-primary w-100"
//                             onClick={() => {
//                                 navigate(`/?search=${encodeURIComponent(searchQuery)}`);
//                                 setShowSearchResults(false);
//                             }}
//                         >
//                             <i className="fas fa-eye me-1"></i>
//                             Ver todos los resultados para "{searchQuery}"
//                         </button>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     const toggleNav = () => setIsNavOpen(!isNavOpen);
//     const toggleProducts = () => setIsProductsOpen(!isProductsOpen);
//     const toggleBrands = () => setIsBrandsOpen(!isBrandsOpen);
//     const closeAllMenus = () => {
//         setIsProductsOpen(false);
//         setIsBrandsOpen(false);
//         setIsNavOpen(false);
//         setShowSearchResults(false);
//     };

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (navRef.current && !navRef.current.contains(event.target)) {
//                 closeAllMenus();
//             }
//             if (searchRef.current && !searchRef.current.contains(event.target)) {
//                 setShowSearchResults(false);
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     return (
//         <div className="fixed-top cabecera">
//             <div className="container">
//                 <div className="row navbar navbar-expand-md fs-7 fs-md-5 d-flex align-items-end align-items-md-center">

//                     {/* Logo */}
//                     <Link to={"/"} className="col-4 col-md-2 d-flex align-items-end text-decoration-none text-black">
//                         <img src={logo} className="w-50 logoStyle d-md-none" alt="logo" />
//                         <img src={logo} className="w-75 logoStyle d-none d-md-block" alt="logo" />
//                     </Link>

//                     {/* Search Bar Desktop */}
//                     <div className="col-md-4 d-none d-md-block">
//                         <div className="search-container position-relative" ref={searchRef}>
//                             <form onSubmit={handleSearchSubmit}>
//                                 <div className="input-group">
//                                     <input
//                                         type="text"
//                                         className="form-control search-input"
//                                         placeholder="🔍 Buscar productos, marcas, categorías..."
//                                         value={searchQuery}
//                                         onChange={(e) => handleSearch(e.target.value)}
//                                         onFocus={() => searchQuery.length > 1 && setShowSearchResults(true)}
//                                     />
//                                 </div>
//                             </form>
                            
//                             {showSearchResults && <SearchResultsDropdown />}
//                         </div>
//                     </div>

//                     {/* Iconos móvil */}
//                     <div className="col-8 col-md-2 d-flex d-md-none align-items-center justify-content-end gap-2">
//                         <CartWidget />
//                         <button className="navbar-toggler custom-button" onClick={toggleNav}>
//                             {isNavOpen ? <FaTimes /> : <FaBars />}
//                         </button>
//                     </div>

//                     {/* Menú de navegación */}
//                     <div ref={navRef} className={`col-md-3 collapse navbar-collapse flex-column py-0 ${isNavOpen ? 'show' : ''}`}>

//                         {/* Search Mobile */}
//                         <div className="d-md-none mb-3">
//                             <div className="search-container position-relative" ref={searchRef}>
//                                 <form onSubmit={handleSearchSubmit}>
//                                     <div className="input-group">
//                                         <input
//                                             type="text"
//                                             className="form-control search-input"
//                                             placeholder="🔍 Buscar productos..."
//                                             value={searchQuery}
//                                             onChange={(e) => handleSearch(e.target.value)}
//                                         />
//                                         <button className="btn btn-primary" type="submit">
//                                             <FaSearch />
//                                         </button>
//                                     </div>
//                                 </form>
//                                 {showSearchResults && <SearchResultsDropdown />}
//                             </div>
//                         </div>

//                         <ul className="navbar-nav mt-2 mt-md-0 w-100 d-flex justify-content-center">

//                             {/* Dropdown de Categorías */}
//                             <li className="nav-item dropdown position-relative"
//                                 onMouseEnter={() => !loading && setIsProductsOpen(true)}
//                                 onMouseLeave={() => setIsProductsOpen(false)}>
//                                 <div className="nav-link py-0 py-2 d-flex align-items-center cursor-pointer" onClick={toggleProducts}>
//                                     Categorías <FaChevronDown className="ms-1" size={12} />
//                                 </div>

//                                 {!loading && categories.length > 0 && (
//                                     <ul className={`dropdown-menu ${isProductsOpen ? 'show' : ''}`}>
//                                         {categories.map((category, index) => (
//                                             <li key={index}>
//                                                 <Link
//                                                     className="dropdown-item"
//                                                     to={`/category/${encodeURIComponent(category)}`}
//                                                     onClick={closeAllMenus}
//                                                 >
//                                                     {category}
//                                                 </Link>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 )}
//                             </li>

//                             {/* Dropdown de Marcas */}
//                             <li className="nav-item dropdown position-relative"
//                                 onMouseEnter={() => !loading && setIsBrandsOpen(true)}
//                                 onMouseLeave={() => setIsBrandsOpen(false)}>
//                                 <div className="nav-link py-0 py-2 d-flex align-items-center cursor-pointer" onClick={toggleBrands}>
//                                     Marcas <FaChevronDown className="ms-1" size={12} />
//                                 </div>

//                                 {!loading && brands.length > 0 && (
//                                     <ul className={`dropdown-menu ${isBrandsOpen ? 'show' : ''}`}>
//                                         {brands.map((brand, index) => (
//                                             <li key={index}>
//                                                 <Link
//                                                     className="dropdown-item"
//                                                     to={`/brand/${encodeURIComponent(brand)}`}
//                                                     onClick={closeAllMenus}
//                                                 >
//                                                     {brand}
//                                                 </Link>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 )}
//                             </li>

//                             <li className="nav-item">
//                                 <Link className="nav-link py-0 py-2" to={"/ofertas"} onClick={closeAllMenus}>
//                                     🎯 Ofertas
//                                 </Link>
//                             </li>

//                         </ul>
//                     </div>

//                     {/* Carrito desktop */}
//                     <div className="col-md-2 d-none d-md-flex justify-content-end align-items-center">
//                         <CartWidget />
//                     </div>
//                 </div>
//             </div>
//             <WhatsAppIcon />
//         </div>
//     );
// };

// export default NavBar;
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import CartWidget from "./CartWidget";
import WhatsAppIcon from "./WhatsAppIcon";
import Search from "./Search";
import logo from "./img/alfallonegro.png";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const NavBar = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const [isBrandsOpen, setIsBrandsOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const navRef = useRef(null);

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

    const toggleNav = () => setIsNavOpen(!isNavOpen);
    const toggleProducts = () => setIsProductsOpen(!isProductsOpen);
    const toggleBrands = () => setIsBrandsOpen(!isBrandsOpen);
    
    const closeAllMenus = () => {
        setIsProductsOpen(false);
        setIsBrandsOpen(false);
        setIsNavOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                closeAllMenus();
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
                        <Search isMobile={false} />
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
                            <Search isMobile={true} />
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