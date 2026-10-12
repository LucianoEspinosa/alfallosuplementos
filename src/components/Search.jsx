import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PiMagnifyingGlass, PiTrendUp } from "react-icons/pi";
import { getAllProducts } from "../utils/productsCache";
import { coincideBusqueda, precioFinalDe, formatoPrecio, etiquetaCantidad } from "../utils/productos";
import ProductPhoto from "./af/ProductPhoto";

const MAS_BUSCADO = ["Creatina", "Whey", "Pre-entreno", "Aminoácidos", "Magnesio"];

// Fila de resultado (spec AFMobileHome: miniatura de 52px, marca, nombre, presentación y precio)
const Resultado = ({ producto, onClick }) => (
    <button type="button" className="af-searchrow" onClick={onClick}>
        <span className="af-tile af-searchrow-tile">
            <ProductPhoto img={producto.img} marca={producto.marca} nombre={producto.nombre} variant="initial" alt="" />
        </span>
        <span className="af-searchrow-info">
            <span className="af-searchrow-brand">{producto.marca}</span>
            <span className="af-searchrow-name">{producto.nombre}</span>
            <span className="af-searchrow-size">{producto.presentacion}</span>
        </span>
        <span className="af-searchrow-price">{formatoPrecio(precioFinalDe(producto))}</span>
    </button>
);

// variant="header": input del header desktop con resultados en un desplegable.
// variant="panel": contenido del panel de búsqueda mobile (input de 48px, sugerencias y resultados).
const Search = ({ variant = "header", onClose }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const esPanel = variant === "panel";

    // Cargar todos los productos una sola vez (lectura compartida y cacheada)
    useEffect(() => {
        getAllProducts()
            .then(setAllProducts)
            .catch((error) => console.error("Error al cargar los productos:", error));
    }, []);

    const consulta = searchQuery.trim();
    const coincidencias = useMemo(
        () => (consulta ? allProducts.filter((p) => coincideBusqueda(p, consulta)) : []),
        [allProducts, consulta]
    );
    const marcas = useMemo(
        () => [...new Set(allProducts.map((p) => p.marca).filter(Boolean))].sort(),
        [allProducts]
    );

    const cerrar = () => {
        setSearchQuery("");
        setShowSearchResults(false);
        if (onClose) onClose();
    };

    // Ver todos los resultados: filtra la grilla del inicio
    const handleSeeAllResults = () => {
        if (!consulta) return;
        navigate(`/?search=${encodeURIComponent(consulta)}`);
        cerrar();
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleSeeAllResults();
    };

    const handleProductClick = (productId) => {
        navigate(`/item/${productId}`);
        cerrar();
    };

    // Cerrar el desplegable al hacer clic fuera (header desktop)
    useEffect(() => {
        if (esPanel) return undefined;
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchResults(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [esPanel]);

    const resultados = (
        <>
            <div className="af-searchresults">
                {coincidencias.slice(0, 6).map((p) => (
                    <Resultado key={p.id} producto={p} onClick={() => handleProductClick(p.id)} />
                ))}
                {coincidencias.length === 0 && (
                    <div className="af-searchempty">
                        <span className="af-searchempty-title">Sin resultados para "{consulta}".</span>
                        <span className="af-searchempty-sub">Escribinos por WhatsApp y te lo conseguimos.</span>
                    </div>
                )}
            </div>
            {coincidencias.length > 0 && (
                <button type="button" className="af-btn af-btn-primary af-searchall" onClick={handleSeeAllResults}>
                    Ver {etiquetaCantidad(coincidencias.length)}
                </button>
            )}
        </>
    );

    if (esPanel) {
        return (
            <form className="af-searchpanel-body" onSubmit={handleSearchSubmit}>
                <label className="af-searchpanel-field">
                    <PiMagnifyingGlass size={18} className="af-searchpanel-icon" />
                    <span className="af-sr-only">Buscar productos</span>
                    <input
                        type="search"
                        className="af-searchpanel-input"
                        placeholder="Buscar proteína, creatina, marca…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </label>

                {!consulta ? (
                    <>
                        <div className="af-searchgroup">
                            <span className="af-overline">Lo más buscado</span>
                            <div className="af-searchpopular">
                                {MAS_BUSCADO.map((t) => (
                                    <button key={t} type="button" className="af-searchpill" onClick={() => setSearchQuery(t)}>
                                        <PiTrendUp size={13} />{t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="af-searchgroup">
                            <span className="af-overline">Marcas</span>
                            <div className="af-searchbrands">
                                {marcas.map((m) => (
                                    <button key={m} type="button" className="af-searchbrand" onClick={() => setSearchQuery(m)}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    resultados
                )}
            </form>
        );
    }

    return (
        <div className="af-headsearch" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
                <label className="af-headsearch-field">
                    <PiMagnifyingGlass size={16} className="af-headsearch-icon" />
                    <span className="af-sr-only">Buscar productos o marcas</span>
                    <input
                        type="search"
                        className="af-input af-headsearch-input"
                        placeholder="Buscar productos o marcas"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearchResults(true);
                        }}
                        onFocus={() => consulta && setShowSearchResults(true)}
                    />
                </label>
            </form>
            {showSearchResults && consulta && <div className="af-headsearch-dropdown">{resultados}</div>}
        </div>
    );
};

export default Search;
