import React, { useEffect, useRef, useState } from "react";
import { PiCaretDown } from "react-icons/pi";

export const OPCIONES_ORDEN = [
    { id: "masvendidos", label: "más vendidos" },
    { id: "precio-asc", label: "menor precio" },
    { id: "precio-desc", label: "mayor precio" },
    { id: "nombre", label: "nombre" },
    { id: "nuevos", label: "más nuevos" },
];

// "Ordenar: más vendidos ▾" (botón ghost del spec) con su desplegable de opciones.
const FilterBar = ({ sortBy, onSortChange }) => {
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);
    const actual = OPCIONES_ORDEN.find((o) => o.id === sortBy) || OPCIONES_ORDEN[0];

    useEffect(() => {
        const cerrar = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
        };
        document.addEventListener("mousedown", cerrar);
        return () => document.removeEventListener("mousedown", cerrar);
    }, []);

    return (
        <div className="af-sort" ref={ref}>
            <button type="button" className="af-btn af-btn-ghost af-sort-btn" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
                Ordenar: {actual.label}<PiCaretDown size={14} />
            </button>
            {abierto && (
                <div className="af-sort-menu" role="menu">
                    {OPCIONES_ORDEN.map((o) => (
                        <button
                            key={o.id}
                            type="button"
                            role="menuitem"
                            className={`af-sort-item ${o.id === actual.id ? "is-on" : ""}`}
                            onClick={() => {
                                onSortChange(o.id);
                                setAbierto(false);
                            }}
                        >
                            {o.label.charAt(0).toUpperCase() + o.label.slice(1)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterBar;
