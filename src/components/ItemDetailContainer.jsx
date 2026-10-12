import { useState, useEffect } from "react";
import ItemDetail from "./ItemDetail";
import { useParams } from "react-router-dom";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import Loading from "./Loading";

const ItemDetailContainer = () => {
    const [item, setItem] = useState({});
    const [loading, setLoading] = useState(true);
    const {id}= useParams();
    useEffect(() => {
        const db= getFirestore();
        const prod= doc(db,"fragancias",id);
        getDoc(prod).then(resultado=>{
            setItem({id:resultado.id, ...resultado.data()})
            setLoading(false);
        });

    }, [id])

    return (
        <div className="af-detail-page">
            {loading ? <Loading />:<ItemDetail producto={item} />}
        </div>
    )
}
export default ItemDetailContainer
