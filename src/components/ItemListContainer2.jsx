import { useEffect, useState, useCallback } from "react";
import ItemList from "./ItemList";
import { useParams } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Loading from "./Loading";

const ItemListContainer = ({ top, oferta, titulo }) => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    // Función para normalizar texto (busca con y sin acentos)
    const normalizarTexto = useCallback((texto) => {
        if (!texto) return '';
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const db = getFirestore();
            const itemsCollection = collection(db, "fragancias");

            try {
                const resultado = await getDocs(itemsCollection);

                if (resultado.size > 0) {
                    const todosLosProductos = resultado.docs.map(producto => ({
                        id: producto.id,
                        ...producto.data()
                    }));

                    setItems(todosLosProductos);

                    // Filtrar localmente
                    let productosFiltrados = todosLosProductos;

                    if (oferta) {
                        productosFiltrados = productosFiltrados.filter(item => item.descuento > 0);
                    } else if (id) {
                        const categoriaBuscada = normalizarTexto(id);
                        productosFiltrados = productosFiltrados.filter(item =>
                            item.categoria && normalizarTexto(item.categoria) === categoriaBuscada
                        );
                    } else if (top) {
                        productosFiltrados = productosFiltrados.filter(item => item.stock < 15);
                    }

                    setFilteredItems(productosFiltrados);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [id, top, oferta, normalizarTexto]);

    return (
        <div className="container alto my-5">
            <div className="row text-center">
                <div className="col">
                    {id ? <h1 className="text-capitalize">{id}</h1> :
                        titulo ? <h1>{titulo}</h1> :
                            <h1>Todos los Productos</h1>}
                    <p className="text-muted">{filteredItems.length} producto(s) encontrado(s)</p>
                </div>
            </div>
            <div className="row justify-content-center">
                {loading ? <Loading /> : <ItemList items={filteredItems} />}
            </div>
        </div>
    );
};

export default ItemListContainer;