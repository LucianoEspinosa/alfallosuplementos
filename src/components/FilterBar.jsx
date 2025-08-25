import React, { useState } from "react";

const FilterBar = ({
    onSortChange,
    onPriceFilter,
    onClearFilters,
    sortBy,
    priceRange,
    productCount,
    totalProducts
}) => {
    const [selectedPriceRange, setSelectedPriceRange] = useState("0-10000");

    const handlePriceChange = (e) => {
        const value = e.target.value;
        setSelectedPriceRange(value);
        const [min, max] = value.split('-').map(Number);
        onPriceFilter(min, max);
    };

    const handleClear = () => {
        setSelectedPriceRange("0-10000");
        onClearFilters();
    };

    return (
        <div className="row mb-4">
            {/* Fila para los selects - OCUPAN TODO EL ANCHO */}
            <div className="col-12 d-flex gap-2 mb-2">
                <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    <option value="nombre">Ordenar por: Nombre</option>
                    <option value="precio-asc">Precio: Menor a Mayor</option>
                    <option value="precio-desc">Precio: Mayor a Menor</option>
                    <option value="nuevos">Más Recientes</option>
                </select>

                <select
                    className="form-select"
                    value={selectedPriceRange}
                    onChange={handlePriceChange}
                >
                    <option value="0-10000">Todos los precios</option>
                    <option value="0-5000">Hasta $5,000</option>
                    <option value="5000-10000">$5,000 - $10,000</option>
                    <option value="10000-20000">$10,000 - $20,000</option>
                    <option value="20000-50000">Más de $20,000</option>
                </select>
            </div>

            <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">
                        {productCount} de {totalProducts} productos
                    </span>
                    {(sortBy !== "nombre" || selectedPriceRange !== "0-10000") && (
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleClear}
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterBar;