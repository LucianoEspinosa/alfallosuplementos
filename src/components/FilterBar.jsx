// import React, { useState } from "react";

// const FilterBar = ({
//     onSortChange,
//     onPriceFilter,
//     onClearFilters,
//     sortBy,
//     priceRange,
//     productCount,
//     totalProducts
// }) => {
//     const [selectedPriceRange, setSelectedPriceRange] = useState("0-10000");

//     const handlePriceChange = (e) => {
//         const value = e.target.value;
//         setSelectedPriceRange(value);
//         const [min, max] = value.split('-').map(Number);
//         onPriceFilter(min, max);
//     };

//     const handleClear = () => {
//         setSelectedPriceRange("0-10000");
//         onClearFilters();
//     };

//     return (
//         <div className="row mb-4">
//             {/* Fila para los selects - OCUPAN TODO EL ANCHO */}
//             <div className="col-12 d-flex gap-2 mb-2">
//                 <select
//                     className="form-select"
//                     value={sortBy}
//                     onChange={(e) => onSortChange(e.target.value)}
//                 >
//                     <option value="nombre">Ordenar por: Nombre</option>
//                     <option value="precio-asc">Precio: Menor a Mayor</option>
//                     <option value="precio-desc">Precio: Mayor a Menor</option>
//                     <option value="nuevos">Más Recientes</option>
//                 </select>

//                 <select
//                     className="form-select"
//                     value={selectedPriceRange}
//                     onChange={handlePriceChange}
//                 >
//                     <option value="0-10000">Todos los precios</option>
//                     <option value="0-5000">Hasta $5,000</option>
//                     <option value="5000-10000">$5,000 - $10,000</option>
//                     <option value="10000-20000">$10,000 - $20,000</option>
//                     <option value="20000-50000">Más de $20,000</option>
//                 </select>
//             </div>

//             <div className="col-12">
//                 <div className="d-flex justify-content-between align-items-center">
//                     <span className="text-muted small">
//                         {productCount} de {totalProducts} productos
//                     </span>
//                     {(sortBy !== "nombre" || selectedPriceRange !== "0-10000") && (
//                         <button
//                             className="btn btn-sm btn-outline-secondary"
//                             onClick={handleClear}
//                         >
//                             Limpiar filtros
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default FilterBar;

import React from "react";

const FilterBar = ({
    onSortChange,
    onPriceFilter,
    onClearFilters,
    onPresentationFilter,
    sortBy,
    priceRange,
    selectedPresentation,
    uniquePresentations,
    productCount,
    totalProducts
}) => {
    const handlePriceChange = (e) => {
        const value = e.target.value;
        const [min, max] = value.split('-').map(Number);
        onPriceFilter(min, max);
    };

    const handleClear = () => {
        onClearFilters();
    };

    const getPriceLabel = () => {
        if (priceRange[0] === 0 && priceRange[1] === 100000) {
            return "Todos los precios";
        }
        if (priceRange[1] === 50000) {
            return `Más de $${priceRange[0]}`;
        }
        return `$${priceRange[0]} - $${priceRange[1]}`;
    };

    const getSortLabel = () => {
        switch (sortBy) {
            case "nombre": return "Nombre";
            case "precio-asc": return "Precio: Menor a Mayor";
            case "precio-desc": return "Precio: Mayor a Menor";
            case "nuevos": return "Más Recientes";
            default: return "Ordenar por";
        }
    };

    return (
        <div className="filter-bar-container">
            <div className="row g-2 align-items-center justify-content-center">

                <div className="col-auto">
                    <div className="dropdown">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="fa-solid fa-sort-amount-down-alt me-2"></i>
                            {getSortLabel()}
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="sortDropdown">
                            <li><button className="dropdown-item" onClick={() => onSortChange("nombre")}>Nombre</button></li>
                            <li><button className="dropdown-item" onClick={() => onSortChange("precio-asc")}>Precio: Menor a Mayor</button></li>
                            <li><button className="dropdown-item" onClick={() => onSortChange("precio-desc")}>Precio: Mayor a Menor</button></li>
                            <li><button className="dropdown-item" onClick={() => onSortChange("nuevos")}>Más Recientes</button></li>
                        </ul>
                    </div>
                </div>

                <div className="col-auto">
                    <div className="dropdown">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="priceDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="fa-solid fa-dollar-sign me-2"></i>
                            {getPriceLabel()}
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="priceDropdown">
                            <li><button className="dropdown-item" onClick={() => onPriceFilter(0, 100000)}>Todos los precios</button></li>
                            <li><button className="dropdown-item" onClick={() => onPriceFilter(0, 5000)}>Hasta $5,000</button></li>
                            <li><button className="dropdown-item" onClick={() => onPriceFilter(5000, 10000)}>$5,000 - $10,000</button></li>
                            <li><button className="dropdown-item" onClick={() => onPriceFilter(10000, 20000)}>$10,000 - $20,000</button></li>
                            <li><button className="dropdown-item" onClick={() => onPriceFilter(20000, 50000)}>Más de $20,000</button></li>
                        </ul>
                    </div>
                </div>

                {uniquePresentations.length > 1 && (
                    <div className="col-auto">
                        <div className="dropdown">
                            <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="presentationDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="fa-solid fa-weight-scale me-2"></i>
                                {selectedPresentation || "Presentación"}
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="presentationDropdown">
                                <li><button className="dropdown-item" onClick={() => onPresentationFilter("")}>Todas las presentaciones</button></li>
                                {uniquePresentations.map(p => (
                                    <li key={p}>
                                        <button className="dropdown-item" onClick={() => onPresentationFilter(p)}>{p}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <hr className="my-3" />

        </div>
    );
};

export default FilterBar;