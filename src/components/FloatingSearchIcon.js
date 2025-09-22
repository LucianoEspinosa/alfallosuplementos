import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import Search from "./Search";

const FloatingSearchIcon = ({ isNavOpen, onSearchClick }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const toggleSearch = () => {
        if (isNavOpen) return; // No hacer nada si el nav está abierto
        
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        if (onSearchClick) {
            onSearchClick(!isSearchOpen);
        }
    };

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
        document.body.style.overflow = 'unset';
        
        if (onSearchClick) {
            onSearchClick(false);
        }
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
            {/* Botón flotante - solo visible cuando el nav está cerrado */}
            <button
                className="btn btn-dark rounded-circle p-0 d-flex align-items-center justify-content-center d-md-none"
                onClick={toggleSearch}
                aria-label="Abrir búsqueda"
                style={{
                    width: '45px',
                    height: '45px',
                    position: 'fixed',
                    top: '70px',
                    left: '15px',
                    zIndex: 1020,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    border: 'none'
                }}
            >
                <FaSearch size={18} />
            </button>

            {/* Overlay y panel de búsqueda */}
            {isSearchOpen && (
                <div 
                    className="d-md-none"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        zIndex: 1040,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header del panel */}
                    <div 
                        className="bg-dark p-3 border-bottom border-secondary"
                        style={{
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div className="d-flex align-items-center">
                            <button
                                className="btn btn-link p-0 me-3 text-light"
                                onClick={handleCloseSearch}
                                aria-label="Cerrar búsqueda"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <FaTimes size={20} />
                            </button>
                            <h5 className="mb-0 text-light">Buscar productos</h5>
                        </div>
                    </div>

                    {/* Contenido de búsqueda */}
                    <div 
                        className="bg-dark flex-grow-1 p-3"
                        style={{
                            overflowY: 'auto'
                        }}
                    >
                        <Search isMobile={true} onClose={handleCloseSearch} darkMode={true} />
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingSearchIcon;