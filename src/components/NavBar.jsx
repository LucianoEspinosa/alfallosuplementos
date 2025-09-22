
// import React, { useState, useRef, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
// import CartWidget from "./CartWidget";
// import WhatsAppIcon from "./WhatsAppIcon";
// import Search from "./Search";
// import FloatingSearchIcon from "./FloatingSearchIcon";
// import logo from "./img/alfallonegro.png";
// import { getFirestore, collection, getDocs } from "firebase/firestore";

// const NavBar = () => {
//     const [isNavOpen, setIsNavOpen] = useState(false);
//     const [isProductsOpen, setIsProductsOpen] = useState(false);
//     const [isBrandsOpen, setIsBrandsOpen] = useState(false);
//     const [categories, setCategories] = useState([]);
//     const [brands, setBrands] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const navRef = useRef(null);

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

//     const toggleNav = () => setIsNavOpen(!isNavOpen);
//     const toggleProducts = () => setIsProductsOpen(!isProductsOpen);
//     const toggleBrands = () => setIsBrandsOpen(!isBrandsOpen);

//     const closeAllMenus = () => {
//         setIsProductsOpen(false);
//         setIsBrandsOpen(false);
//         setIsNavOpen(false);
//     };

//     // Función para manejar la búsqueda y cerrar el nav
//     const handleSearchAction = () => {
//         closeAllMenus();
//     };

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (navRef.current && !navRef.current.contains(event.target)) {
//                 closeAllMenus();
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
//                         <img src={logo} className="w-50 logoStyle d-md-none" alt="Al Fallo logo" />
//                         <img src={logo} className="w-75 logoStyle d-none d-md-block" alt="Al Fallo logo" />
//                     </Link>

//                     {/* Search Bar Desktop */}
//                     <div className="col-md-4 d-none d-md-block">
//                         <Search isMobile={false} />
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

//                         {/* Search Mobile - con margen superior */}
//                         {isNavOpen && (
//                             <div className="d-md-none mb-4 mt-3"> {/* Más margen */}
//                                 <Search isMobile={true} onClose={closeAllMenus} />
//                             </div>
//                         )}

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
// {/* 
//                             <li className="nav-item">
//                                 <Link className="nav-link py-0 py-2" to={"/ofertas"} onClick={closeAllMenus}>
//                                     🎯 Ofertas
//                                 </Link>
//                             </li> */}

//                         </ul>
//                     </div>

//                     {/* Carrito desktop */}
//                     <div className="col-md-2 d-none d-md-flex justify-content-end align-items-center">
//                         <CartWidget />
//                     </div>
//                 </div>
//             </div>

//             {/* Botón flotante - solo visible cuando el nav está cerrado */}
//             <FloatingSearchIcon isNavOpen={isNavOpen} />
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
import FloatingSearchIcon from "./FloatingSearchIcon";
import logo from "./img/alfallonegro.png";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import AuthComponent from "./AuthComponent"; // <-- COMPONENTE AGREGADO

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

    // Función para manejar la búsqueda y cerrar el nav
    const handleSearchAction = () => {
        closeAllMenus();
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
                        <img src={logo} className="w-50 logoStyle d-md-none" alt="Al Fallo logo" />
                        <img src={logo} className="w-75 logoStyle d-none d-md-block" alt="Al Fallo logo" />
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

                        {/* Search Mobile - con margen superior */}
                        {isNavOpen && (
                            <div className="d-md-none mb-4 mt-3"> {/* Más margen */}
                                <Search isMobile={true} onClose={closeAllMenus} />
                            </div>
                        )}

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
    <Link 
        to="/plan" 
        className="nav-link py-0 py-2 d-flex align-items-center cursor-pointer" 
        onClick={closeAllMenus}
    >
        Plan de Nutrición
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

            {/* Botón flotante - solo visible cuando el nav está cerrado */}
            <FloatingSearchIcon isNavOpen={isNavOpen} />
            <WhatsAppIcon />
        </div>
    );
};

export default NavBar;
