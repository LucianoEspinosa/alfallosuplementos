import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { PiList, PiX, PiCaretDown } from "react-icons/pi";
import CartWidget from "./CartWidget";
import WhatsAppIcon from "./WhatsAppIcon";
import Search from "./Search";
import FloatingSearchIcon from "./FloatingSearchIcon";
import logo from "./img/alfallonegro.png";
import { getAllProducts } from "../utils/productsCache";

// En mobile, el detalle, el carrito y el checkout tienen su propio encabezado y su barra fija abajo:
// ahí no se muestran el header general, la lupa flotante ni el botón de WhatsApp.
export const esPantallaConBarra = (pathname) =>
    pathname.startsWith("/item/") || pathname === "/cart" || pathname === "/checkout";

// El menú se abre al pasar el mouse. La separación con el botón está dentro del área del menú
// (padding) y el cierre espera un instante, así no se cierra al bajar el mouse para elegir.
const Desplegable = ({ titulo, items, aRuta, abierto, onAbrir, onCerrar }) => {
    const timer = useRef(null);
    const abrir = () => {
        clearTimeout(timer.current);
        onAbrir();
    };
    const cerrarConDemora = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(onCerrar, 180);
    };
    useEffect(() => () => clearTimeout(timer.current), []);

    return (
        <div className="af-navdrop" onMouseEnter={abrir} onMouseLeave={cerrarConDemora}>
            <button type="button" className="af-navlink" onClick={abierto ? onCerrar : abrir} aria-expanded={abierto}>
                {titulo}<PiCaretDown size={12} />
            </button>
            {abierto && items.length > 0 && (
                <div className="af-navdrop-menu">
                    <div className="af-navdrop-panel">
                        {items.map((item) => (
                            <Link key={item} to={aRuta(item)} className="af-navdrop-item" onClick={onCerrar}>
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const MenuPanel = ({ categorias, marcas, onCerrar }) => (
    <div className="af-menupanel">
        <div className="af-menupanel-group">
            <span className="af-overline">Categorías</span>
            {categorias.map((c) => (
                <Link key={c} to={`/category/${encodeURIComponent(c)}`} className="af-menupanel-item" onClick={onCerrar}>{c}</Link>
            ))}
        </div>
        <div className="af-menupanel-group">
            <span className="af-overline">Marcas</span>
            {marcas.map((m) => (
                <Link key={m} to={`/brand/${encodeURIComponent(m)}`} className="af-menupanel-item" onClick={onCerrar}>{m}</Link>
            ))}
        </div>
    </div>
);

const NavBar = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [abierto, setAbierto] = useState(null); // "categorias" | "marcas" | null
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const navRef = useRef(null);
    const { pathname } = useLocation();
    const conBarra = esPantallaConBarra(pathname);

    // Obtener categorías y marcas
    useEffect(() => {
        getAllProducts()
            .then((allProducts) => {
                setCategories([...new Set(allProducts.map((p) => p.categoria).filter(Boolean))].sort());
                setBrands([...new Set(allProducts.map((p) => p.marca).filter(Boolean))].sort());
            })
            .catch((error) => console.error("Error:", error));
    }, []);

    const closeAllMenus = () => {
        setAbierto(null);
        setIsNavOpen(false);
    };

    // Cerrar los menús al hacer clic fuera o al cambiar de página
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) closeAllMenus();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        closeAllMenus();
    }, [pathname]);

    const botonMenu = (
        <button
            type="button"
            className="af-btn af-btn-secondary af-btn-icon"
            aria-label={isNavOpen ? "Cerrar menú" : "Menú"}
            aria-expanded={isNavOpen}
            onClick={() => setIsNavOpen(!isNavOpen)}
        >
            {isNavOpen ? <PiX size={20} /> : <PiList size={20} />}
        </button>
    );

    return (
        <>
            <header ref={navRef} className={`af-header ${conBarra ? "af-header--subpage" : ""}`}>
                {/* Mobile (< 768px): logo, carrito y menú */}
                <div className="af-header-m">
                    <Link to="/" className="af-header-logo-m" aria-label="Al Fallo Suplementos, inicio">
                        <img src={logo} alt="Al Fallo Suplementos" />
                    </Link>
                    <CartWidget />
                    {botonMenu}
                </div>

                {/* Desktop (≥ 768px): logo, buscador, menú y carrito */}
                <div className="af-header-d">
                    <Link to="/" className="af-header-logo-d" aria-label="Al Fallo Suplementos, inicio">
                        <img src={logo} alt="Al Fallo Suplementos" />
                    </Link>
                    <div className="af-header-search">
                        <Search />
                    </div>
                    <nav className="af-header-nav" aria-label="Principal">
                        <Desplegable
                            titulo="Categorías"
                            items={categories}
                            aRuta={(c) => `/category/${encodeURIComponent(c)}`}
                            abierto={abierto === "categorias"}
                            onAbrir={() => setAbierto("categorias")}
                            onCerrar={() => setAbierto(null)}
                        />
                        <Desplegable
                            titulo="Marcas"
                            items={brands}
                            aRuta={(m) => `/brand/${encodeURIComponent(m)}`}
                            abierto={abierto === "marcas"}
                            onAbrir={() => setAbierto("marcas")}
                            onCerrar={() => setAbierto(null)}
                        />
                    </nav>
                    <span className="af-header-burger">{botonMenu}</span>
                    <CartWidget />
                </div>

                {isNavOpen && <MenuPanel categorias={categories} marcas={brands} onCerrar={closeAllMenus} />}
            </header>

            {/* Lupa flotante (solo mobile) y botón de WhatsApp */}
            {!conBarra && <FloatingSearchIcon isNavOpen={isNavOpen} />}
            <WhatsAppIcon ocultarEnMobile={conBarra} />
        </>
    );
};

export default NavBar;
