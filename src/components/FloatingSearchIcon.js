import React, { useState, useEffect } from "react";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";
import Search from "./Search";

// Lupa flotante (solo mobile): arriba a la izquierda, se oculta con el menú abierto,
// bloquea el scroll del body y abre la búsqueda a pantalla completa.
const FloatingSearchIcon = ({ isNavOpen, onSearchClick }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const abrir = () => {
        if (isNavOpen) return; // No hacer nada si el nav está abierto
        setIsSearchOpen(true);
        document.body.style.overflow = 'hidden';
        if (onSearchClick) onSearchClick(true);
    };

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
        document.body.style.overflow = 'unset';
        if (onSearchClick) onSearchClick(false);
    };

    useEffect(() => {
        // Cerrar búsqueda si el nav se abre
        if (isNavOpen) {
            setIsSearchOpen(false);
            document.body.style.overflow = 'unset';
        }
    }, [isNavOpen]);

    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // No mostrar el botón flotante si el nav está abierto
    if (isNavOpen) return null;

    return (
        <>
            {!isSearchOpen && (
                <button type="button" className="af-searchfab" onClick={abrir} aria-label="Abrir búsqueda">
                    <PiMagnifyingGlass size={19} />
                </button>
            )}

            {isSearchOpen && (
                <div className="af-searchpanel" role="dialog" aria-modal="true" aria-label="Buscar productos">
                    <div className="af-searchpanel-inner">
                        <div className="af-searchpanel-head">
                            <button type="button" className="af-btn af-btn-secondary af-btn-icon" aria-label="Cerrar búsqueda" onClick={handleCloseSearch}>
                                <PiX size={18} />
                            </button>
                            <span className="af-searchpanel-title">Buscar productos</span>
                        </div>
                        <Search variant="panel" onClose={handleCloseSearch} />
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingSearchIcon;
