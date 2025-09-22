// import { createContext, useState, useEffect } from "react";

// export const CartContext = createContext();

// const CartContextProvider = ({ children }) => {
//     let [cart, setCart] = useState([]);

//     useEffect(() => {
//         const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
//         setCart(storedCart);
//     }, []);

//     const addItem = (item, quantity) => {
//         // CALCULAR PRECIO FINAL CORRECTAMENTE
//         const calcularPrecioFinal = (item) => {
//             if (item.descuento > 0) {
//                 return Math.round(item.precio - (item.precio * item.descuento) / 100);
//             }
//             return item.precio; // Si no hay descuento, usar precio normal
//         };

//         if (isInCart(item.id)) {
//             let updatedCart = cart.map((prod) => {
//                 if (prod.id === item.id) {
//                     return { 
//                         ...prod, 
//                         cantidad: prod.cantidad + quantity,
//                         precioFinal: calcularPrecioFinal(prod) // ← IMPORTANTE
//                     };
//                 }
//                 return prod;
//             });
//             setCart(updatedCart);
//             localStorage.setItem("cart", JSON.stringify(updatedCart));
//         } else {
//             let updatedCart = [
//                 ...cart,
//                 {
//                     ...item,
//                     cantidad: quantity,
//                     precioFinal: calcularPrecioFinal(item), // ← CORREGIDO
//                 },
//             ];
//             setCart(updatedCart);
//             localStorage.setItem("cart", JSON.stringify(updatedCart));
//         }
//     };

//     const removeItem = (id) => {
//         const updatedCart = cart.filter((prod) => prod.id !== id);
//         setCart(updatedCart);
//         localStorage.setItem("cart", JSON.stringify(updatedCart));
//     };

//     const clear = () => {
//         setCart([]);
//         localStorage.removeItem("cart");
//     };

//     const isInCart = (id) => {
//         return cart.some((prod) => prod.id === id);
//     };

//     const cartTotal = () => {
//         return cart.reduce((suma, item) => (suma += item.cantidad), 0);
//     };

//     const precioTotal = () => {
//         return cart.reduce(
//             (suma, item) => {
//                 const precio = item.precioFinal || item.precio || 0;
//                 const cantidad = item.cantidad || 0;
//                 return suma + (precio * cantidad);
//             },
//             0
//         );
//     };

//     return (
//         <CartContext.Provider
//             value={{ 
//                 cartTotal, 
//                 precioTotal, 
//                 cart, 
//                 addItem, 
//                 removeItem, 
//                 clear,
//                 isInCart // ← Asegúrate de exportar isInCart si se usa
//             }}
//         >
//             {children}
//         </CartContext.Provider>
//     );
// };

// export default CartContextProvider;
import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

const CartContextProvider = ({ children }) => {
    let [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(storedCart);
    }, []);

    // FUNCIÓN CLAVE: Generar ID único con sabor
    const generateItemId = (item) => {
        if (item.saborSeleccionado) {
            return `${item.id}-${item.saborSeleccionado.replace(/\s+/g, '-').toLowerCase()}`;
        }
        return item.id;
    };

    const addItem = (item, quantity) => {
        const calcularPrecioFinal = (item) => {
            if (item.descuento > 0) {
                return Math.round(item.precio - (item.precio * item.descuento) / 100);
            }
            return item.precio;
        };

        const itemId = generateItemId(item);
        const precioFinal = calcularPrecioFinal(item);

        if (isInCart(itemId)) {
            // Sumar cantidad al MISMO producto y MISMO sabor
            let updatedCart = cart.map((prod) => {
                const prodId = generateItemId(prod);
                if (prodId === itemId) {
                    return { 
                        ...prod, 
                        cantidad: prod.cantidad + quantity,
                        precioFinal: precioFinal
                    };
                }
                return prod;
            });
            setCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
        } else {
            // Agregar NUEVO producto o mismo producto con NUEVO sabor
            let updatedCart = [
                ...cart,
                {
                    ...item,
                    id: itemId, // ← Guardar el ID ÚNICO en el item
                    idOriginal: item.id, // ← Guardar también el ID original por si acaso
                    cantidad: quantity,
                    precioFinal: precioFinal,
                    saborSeleccionado: item.saborSeleccionado || null,
                    nombreCompleto: item.saborSeleccionado 
                        ? `${item.nombre} - ${item.saborSeleccionado}`
                        : item.nombre
                },
            ];
            setCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
    };

    const removeItem = (id) => {
        const updatedCart = cart.filter((prod) => prod.id !== id);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const clear = () => {
        setCart([]);
        localStorage.removeItem("cart");
    };

    const isInCart = (id) => {
        return cart.some((prod) => prod.id === id);
    };

    const cartTotal = () => {
        return cart.reduce((suma, item) => suma + item.cantidad, 0);
    };

    const precioTotal = () => {
        return cart.reduce((suma, item) => {
            return suma + (item.precioFinal * item.cantidad);
        }, 0);
    };

    return (
        <CartContext.Provider
            value={{ 
                cartTotal, 
                precioTotal, 
                cart, 
                addItem, 
                removeItem, 
                clear,
                isInCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartContextProvider;