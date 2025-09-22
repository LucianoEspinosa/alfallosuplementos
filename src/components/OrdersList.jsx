// import React, { useState, useEffect } from 'react';
// import {
//     getFirestore,
//     collection,
//     getDocs,
//     query,
//     orderBy,
//     deleteDoc,
//     doc
// } from 'firebase/firestore';
// import OrderCard from './OrderCard';
// import OrderFilter from './OrderFilter';

// // --- Helpers de fecha ---
// const MONTHS_ES = {
//     'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
//     'julio': 6, 'agosto': 7, 'septiembre': 8, 'setiembre': 8, 'octubre': 9,
//     'noviembre': 10, 'diciembre': 11
// };

// function parseDateFlexible(input) {
//     if (!input) return null;

//     // Firestore Timestamp
//     if (typeof input === 'object' && typeof input.toDate === 'function') {
//         const d = input.toDate();
//         return isNaN(d) ? null : d;
//     }

//     // Date instancia
//     if (input instanceof Date) {
//         return isNaN(input) ? null : input;
//     }

//     // Número (epoch en ms o seg)
//     if (typeof input === 'number') {
//         const ms = input < 1e12 ? input * 1000 : input; // si parece segundos, a ms
//         const d = new Date(ms);
//         return isNaN(d) ? null : d;
//     }

//     // String
//     if (typeof input === 'string') {
//         const str = input.trim();

//         // Epoch como string
//         if (/^\d+$/.test(str)) {
//             const num = parseInt(str, 10);
//             const ms = num < 1e12 ? num * 1000 : num;
//             const d = new Date(ms);
//             if (!isNaN(d)) return d;
//         }

//         // ISO u otros parseables por Date
//         const isoTry = new Date(str);
//         if (!isNaN(isoTry)) return isoTry;

//         // dd/mm/yyyy [hh:mm[:ss]]
//         let m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
//         if (m) {
//             const [, dd, mm, yyyy, hh = '0', min = '0', ss = '0'] = m;
//             const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss));
//             return isNaN(d) ? null : d;
//         }

//         // "16 de agosto de 2025, 9:50:16 p.m. ..." (hora opcional)
//         m = str.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(\d{4})(?:,\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?)?/i);
//         if (m) {
//             let [, dd, mesTxt, yyyy, hh, min, ss, ampm] = m;
//             mesTxt = mesTxt.toLowerCase();
//             const mes = MONTHS_ES[mesTxt];
//             if (mes != null) {
//                 let h = Number(hh || 0);
//                 const minutes = Number(min || 0);
//                 const seconds = Number(ss || 0);
//                 if (ampm) {
//                     const isPM = /^p/i.test(ampm);
//                     if (isPM && h < 12) h += 12;
//                     if (!isPM && h === 12) h = 0;
//                 }
//                 const d = new Date(Number(yyyy), mes, Number(dd), h, minutes, seconds);
//                 return isNaN(d) ? null : d;
//             }
//         }
//     }

//     return null;
// }

// function startDateFromRange(range) {
//     if (range === 'todos') return null;

//     const d = new Date();
//     d.setHours(0, 0, 0, 0);

//     if (range === 'hoy') return d;

//     if (range === 'semana') {
//         const w = new Date(d);
//         w.setDate(w.getDate() - 7);
//         return w;
//     }

//     if (range === 'mes') {
//         const m = new Date(d);
//         m.setMonth(m.getMonth() - 1);
//         return m;
//     }

//     return null;
// }

// const OrdersList = () => {
//     const [orders, setOrders] = useState([]);
//     const [filteredOrders, setFilteredOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [filters, setFilters] = useState({
//         status: 'todos',
//         search: '',
//         dateRange: 'todos'
//     });

//     useEffect(() => {
//         fetchOrders();
//     }, []);

//     useEffect(() => {
//         filterOrders();
//     }, [orders, filters]);

//     const fetchOrders = async () => {
//         try {
//             setLoading(true);
//             const db = getFirestore();
//             const ordersCollection = collection(db, 'orders');
//             const q = query(ordersCollection, orderBy('date', 'desc'));
//             const querySnapshot = await getDocs(q);

//             const ordersData = [];
//             querySnapshot.forEach((docSnap) => {
//                 ordersData.push({
//                     id: docSnap.id,
//                     ...docSnap.data()
//                 });
//             });

//             setOrders(ordersData);
//             setLoading(false);
//         } catch (error) {
//             console.error('Error fetching orders:', error);
//             setError('Error al cargar las órdenes');
//             setLoading(false);
//         }
//     };

//     const deleteOrder = async (orderId) => {
//         if (!window.confirm('¿Estás seguro de que quieres eliminar esta orden? Esta acción no se puede deshacer.')) {
//             return;
//         }
//         try {
//             const db = getFirestore();
//             const orderDoc = doc(db, 'orders', orderId);
//             await deleteDoc(orderDoc);
//             setOrders(prev => prev.filter(o => o.id !== orderId));
//             alert('Orden eliminada exitosamente');
//         } catch (error) {
//             console.error('Error deleting order:', error);
//             alert('Error al eliminar la orden');
//         }
//     };

//     const filterOrders = () => {
//         let filtered = [...orders];

//         // Estado
//         if (filters.status !== 'todos') {
//             filtered = filtered.filter(order => order.status === filters.status);
//         }

//         // Búsqueda
//         if (filters.search) {
//             const s = filters.search.toLowerCase();
//             filtered = filtered.filter(order =>
//                 order.id.toLowerCase().includes(s) ||
//                 order.buyer?.name?.toLowerCase().includes(s) ||
//                 order.buyer?.email?.toLowerCase().includes(s) ||
//                 order.buyer?.phone?.includes(s)
//             );
//         }

//         // Fecha
//         const startDate = startDateFromRange(filters.dateRange);
//         if (startDate) {
//             filtered = filtered.filter(order => {
//                 const orderDate = parseDateFlexible(order.date);
//                 if (!orderDate) {
//                     // Si alguna fecha no es parseable, la excluimos (y logueamos para depurar).
//                     console.warn('Fecha de orden no parseable:', order.id, order.date);
//                     return false;
//                 }
//                 return orderDate >= startDate;
//             });
//         }

//         setFilteredOrders(filtered);
//     };

//     const updateOrderStatus = (orderId, newStatus) => {
//         setOrders(prev =>
//             prev.map(order =>
//                 order.id === orderId ? { ...order, status: newStatus } : order
//             )
//         );
//     };

//     if (loading) {
//         return (
//             <div className="container text-center py-5">
//                 <div className="spinner-border text-primary" role="status">
//                     <span className="visually-hidden">Cargando...</span>
//                 </div>
//                 <p className="mt-3">Cargando órdenes...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="container py-5">
//                 <div className="alert alert-danger">
//                     <h4>Error</h4>
//                     <p>{error}</p>
//                     <button className="btn btn-primary" onClick={fetchOrders}>
//                         Reintentar
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="container py-4">
//             <div className="row">
//                 <div className="col-12">
//                     <div className="d-flex justify-content-between align-items-center mb-4">
//                         <h1 className="h3 mb-0">📋 Gestión de Órdenes</h1>
//                         <button className="btn btn-outline-primary" onClick={fetchOrders}>
//                             🔄 Actualizar
//                         </button>
//                     </div>

//                     <OrderFilter filters={filters} setFilters={setFilters} />

//                     <div className="row mb-3">
//                         <div className="col-12">
//                             <div className="card">
//                                 <div className="card-body py-2">
//                                     <div className="row">
//                                         <div className="col-md-3">
//                                             <strong>Total: {orders.length}</strong>
//                                         </div>
//                                         <div className="col-md-3">
//                                             <span className="text-success">
//                                                 ✅ Confirmadas: {orders.filter(o => o.status === 'confirmada').length}
//                                             </span>
//                                         </div>
//                                         <div className="col-md-3">
//                                             <span className="text-warning">
//                                                 ⏳ Pendientes: {orders.filter(o => o.status === 'pendiente').length}
//                                             </span>
//                                         </div>
//                                         <div className="col-md-3">
//                                             <span className="text-danger">
//                                                 ❌ Canceladas: {orders.filter(o => o.status === 'cancelada').length}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {filteredOrders.length === 0 ? (
//                         <div className="text-center py-5">
//                             <div className="text-muted">
//                                 <h4>No se encontraron órdenes</h4>
//                                 <p>Intenta con otros filtros o crea una nueva orden</p>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="row">
//                             {filteredOrders.map((order) => (
//                                 <div key={order.id} className="col-lg-6 col-xl-4 mb-4">
//                                     <OrderCard
//                                         order={order}
//                                         onStatusChange={updateOrderStatus}
//                                         onDelete={deleteOrder}
//                                     />
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OrdersList;


import React, { useState, useEffect } from 'react';
import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    deleteDoc,
    doc
} from 'firebase/firestore';
import OrderCard from './OrderCard';
import OrderFilter from './OrderFilter';

// --- Helpers de fecha ---
const MONTHS_ES = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'setiembre': 8, 'octubre': 9,
    'noviembre': 10, 'diciembre': 11
};

function parseDateFlexible(input) {
    if (!input) return null;

    // Firestore Timestamp
    if (typeof input === 'object' && typeof input.toDate === 'function') {
        const d = input.toDate();
        return isNaN(d) ? null : d;
    }

    // Date instancia
    if (input instanceof Date) {
        return isNaN(input) ? null : input;
    }

    // Número (epoch en ms o seg)
    if (typeof input === 'number') {
        const ms = input < 1e12 ? input * 1000 : input;
        const d = new Date(ms);
        return isNaN(d) ? null : d;
    }

    // String
    if (typeof input === 'string') {
        const str = input.trim();

        // Epoch como string
        if (/^\d+$/.test(str)) {
            const num = parseInt(str, 10);
            const ms = num < 1e12 ? num * 1000 : num;
            const d = new Date(ms);
            if (!isNaN(d)) return d;
        }

        // ISO u otros parseables por Date
        const isoTry = new Date(str);
        if (!isNaN(isoTry)) return isoTry;

        // dd/mm/yyyy [hh:mm[:ss]]
        let m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
        if (m) {
            const [, dd, mm, yyyy, hh = '0', min = '0', ss = '0'] = m;
            const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss));
            return isNaN(d) ? null : d;
        }

        // "16 de agosto de 2025, 9:50:16 p.m. ..." (hora opcional)
        m = str.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(\d{4})(?:,\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?)?/i);
        if (m) {
            let [, dd, mesTxt, yyyy, hh, min, ss, ampm] = m;
            mesTxt = mesTxt.toLowerCase();
            const mes = MONTHS_ES[mesTxt];
            if (mes != null) {
                let h = Number(hh || 0);
                const minutes = Number(min || 0);
                const seconds = Number(ss || 0);
                if (ampm) {
                    const isPM = /^p/i.test(ampm);
                    if (isPM && h < 12) h += 12;
                    if (!isPM && h === 12) h = 0;
                }
                const d = new Date(Number(yyyy), mes, Number(dd), h, minutes, seconds);
                return isNaN(d) ? null : d;
            }
        }
    }

    return null;
}

function startDateFromRange(range) {
    if (range === 'todos') return null;

    const d = new Date();
    d.setHours(0, 0, 0, 0);

    if (range === 'hoy') return d;

    if (range === 'semana') {
        const w = new Date(d);
        w.setDate(w.getDate() - 7);
        return w;
    }

    if (range === 'mes') {
        const m = new Date(d);
        m.setMonth(m.getMonth() - 1);
        return m;
    }

    return null;
}

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        status: 'todos',
        search: '',
        dateRange: 'todos'
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const db = getFirestore();
            const ordersCollection = collection(db, 'orders');
            // CAMBIO IMPORTANTE: Ordenar por 'timestamp' en lugar de 'date'
            const q = query(ordersCollection, orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);

            const ordersData = [];
            querySnapshot.forEach((docSnap) => {
                ordersData.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            });

            setOrders(ordersData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Error al cargar las órdenes');
            setLoading(false);
        }
    };

    const deleteOrder = async (orderId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta orden? Esta acción no se puede deshacer.')) {
            return;
        }
        try {
            const db = getFirestore();
            const orderDoc = doc(db, 'orders', orderId);
            await deleteDoc(orderDoc);
            setOrders(prev => prev.filter(o => o.id !== orderId));
            alert('Orden eliminada exitosamente');
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Error al eliminar la orden');
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        // Estado
        if (filters.status !== 'todos') {
            filtered = filtered.filter(order => order.status === filters.status);
        }

        // Búsqueda
        if (filters.search) {
            const s = filters.search.toLowerCase();
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(s) ||
                order.buyer?.name?.toLowerCase().includes(s) ||
                order.buyer?.email?.toLowerCase().includes(s) ||
                order.buyer?.phone?.includes(s)
            );
        }

        // Fecha - CAMBIO: Usar timestamp en lugar de date
        const startDate = startDateFromRange(filters.dateRange);
        if (startDate) {
            filtered = filtered.filter(order => {
                // Priorizar timestamp sobre date
                const orderDate = order.timestamp ? parseDateFlexible(order.timestamp) : parseDateFlexible(order.date);
                if (!orderDate) {
                    console.warn('Fecha de orden no parseable:', order.id, order.date, order.timestamp);
                    return false;
                }
                return orderDate >= startDate;
            });
        }

        setFilteredOrders(filtered);
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prev =>
            prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando órdenes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    <h4>Error</h4>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchOrders}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="h3 mb-0">📋 Gestión de Órdenes</h1>
                        <button className="btn btn-outline-primary" onClick={fetchOrders}>
                            🔄 Actualizar
                        </button>
                    </div>

                    <OrderFilter filters={filters} setFilters={setFilters} />

                    <div className="row mb-3">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body py-2">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <strong>Total: {orders.length}</strong>
                                        </div>
                                        <div className="col-md-3">
                                            <span className="text-success">
                                                ✅ Confirmadas: {orders.filter(o => o.status === 'confirmada').length}
                                            </span>
                                        </div>
                                        <div className="col-md-3">
                                            <span className="text-warning">
                                                ⏳ Pendientes: {orders.filter(o => o.status === 'pendiente').length}
                                            </span>
                                        </div>
                                        <div className="col-md-3">
                                            <span className="text-danger">
                                                ❌ Canceladas: {orders.filter(o => o.status === 'cancelada').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="text-muted">
                                <h4>No se encontraron órdenes</h4>
                                <p>Intenta con otros filtros o crea una nueva orden</p>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="col-lg-6 col-xl-4 mb-4">
                                    <OrderCard
                                        order={order}
                                        onStatusChange={updateOrderStatus}
                                        onDelete={deleteOrder}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersList;