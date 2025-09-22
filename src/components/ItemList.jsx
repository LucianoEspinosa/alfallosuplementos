import Item from "./Item";

const ItemList = ({ items }) => {
    
    return (
        <div className="row justify-content-center">
            {items.map(item =><Item key={item.id}  item={item} />)}
        </div>
    )
}
export default ItemList;