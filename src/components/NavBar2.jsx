import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import CartWidget from "./CartWidget";
import WhatsAppIcon from "./WhatsAppIcon";
import logo from "./img/logoalfallo2.png";

const NavBar = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsNavOpen(false);
                setIsProductsOpen(false);
            }
        };

        const handleScroll = () => {
            setIsNavOpen(false);
            setIsProductsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    const toggleProducts = () => {
        setIsProductsOpen(!isProductsOpen);
    };

    const handleScroll = () => {
        if (isNavOpen) {
            setIsNavOpen(false);
        }
    };

    return (
        <div className="fixed-top cabecera">
            <div className="container">
                <div className="row navbar navbar-expand-md fs-7 fs-md-5 d-flex align-items-end align-items-md-center" onScroll={handleScroll}>
                    <Link to={"/"} className="col-8 col-md-2 d-flex align-items-end text-decoration-none text-black">
                        <img src={logo} className="w-50 logoStyle d-md-none" alt="logo de fragances.net" />
                        
                        
                    </Link>
                    <div className="col-4 col-md-2 d-flex d-md-none align-items-center justify-content-end">
                        <CartWidget />
                        <button className="navbar-toggler custom-button d-md-none" type="button" onClick={toggleNav}>{isNavOpen ? <FaTimes /> : <FaBars />}</button>
                    </div>

                    <div ref={navRef} className={`col-md-8 collapse navbar-collapse flex-column py-0 ${isNavOpen ? 'show' : ''}`} id="navbarNav">
                        
                        <img src={logo} className="w-25 logoStyle" alt="logo de fragances.net" />
                        <ul className="navbar-nav mt-2 mt-md-0">
                            
                            <li className="nav-item dropdown" onMouseEnter={() => setIsProductsOpen(true)} onMouseLeave={() => setIsProductsOpen(false)}>
                                <div className="nav-link py-0 py-2 d-flex align-items-center" onClick={toggleProducts}>
                                    Productos <FaChevronDown className="ms-1" size={12} />
                                </div>
                                <ul className={`dropdown-menu ${isProductsOpen ? 'show' : ''}`} style={{ border: 'none' }}>
                                    <li><Link className="dropdown-item" to="/category/proteinas">proteinas</Link></li>
                                    <li><Link className="dropdown-item" to="/category/creatina">Creatina</Link></li>
                                    <li><Link className="dropdown-item" to="/category/preentreno">Pre-entreno</Link></li>
                                    <li><Link className="dropdown-item" to="/category/aminoacidos">Aminoácidos</Link></li>
                                    <li><Link className="dropdown-item" to="/category/quemadores">Quemadores</Link></li>
                                    <li><Link className="dropdown-item" to="/category/vitaminas">Vitaminas</Link></li>
                                    <li><Link className="dropdown-item" to="/category/magnesio">magnesio</Link></li>
                                </ul>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link py-0 py-2" to={"ofertas"}>
                                    Ofertas
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link py-0 py-2" to={"masvendidos"}>
                                    Más Vendidos
                                </Link>
                            </li>

                        </ul >
                    </div >

    <div className={`col-2 col-md-2 d-none d-md-flex justify-content-end align-items-center ${isNavOpen ? 'justify-content-start' : ''}`}>
        <CartWidget />
    </div>
                </div >
            </div >
    <WhatsAppIcon />
        </div >
    );
};

export default NavBar; 

