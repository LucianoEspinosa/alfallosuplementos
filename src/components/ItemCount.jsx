// Selector de cantidad − / + del spec AFMobileDetalle.
// La regla de stock la maneja ItemDetail (la misma que tenía este componente).
const ItemCount = ({ value, onDec, onInc }) => {
    return (
        <div className="af-qty">
            <button type="button" className="af-qty-btn" onClick={onDec} aria-label="Restar">−</button>
            <span className="af-qty-value" aria-live="polite">{value}</span>
            <button type="button" className="af-qty-btn" onClick={onInc} aria-label="Sumar">+</button>
        </div>
    );
};

export default ItemCount;
