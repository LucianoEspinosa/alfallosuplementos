import Item from "./Item";

// Grilla de productos: 2 columnas en mobile, 3 en tablet y 4 en desktop.
const ItemList = ({ items }) => {
    return (
        <div className="af-grid">
            {items.map((item) => <Item key={item.id} item={item} />)}
        </div>
    );
};

export default ItemList;
