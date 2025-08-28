import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import OrderCard from './OrderCard';
import OrderFilter from './OrderFilter';

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
            const q = query(ordersCollection, orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);

            const ordersData = [];
            querySnapshot.forEach((doc) => {
                ordersData.push({
                    id: doc.id,
                    ...doc.data()
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

    const filterOrders = () => {
        let filtered = orders;

        // Filtrar por estado
        if (filters.status !== 'todos') {
            filtered = filtered.filter(order => order.status === filters.status);
        }

        // Filtrar por búsqueda
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchLower) ||
                order.buyer?.name?.toLowerCase().includes(searchLower) ||
                order.buyer?.email?.toLowerCase().includes(searchLower) ||
                order.buyer?.phone?.includes(searchLower)
            );
        }

        // Filtrar por rango de fecha
        if (filters.dateRange !== 'todos') {
            const now = new Date();
            let startDate;

            switch (filters.dateRange) {
                case 'hoy':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'semana':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'mes':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                default:
                    break;
            }

            if (startDate) {
                filtered = filtered.filter(order => {
                    const orderDate = new Date(order.date);
                    return orderDate >= startDate;
                });
            }
        }

        setFilteredOrders(filtered);
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
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
                                    <OrderCard order={order} onStatusChange={updateOrderStatus} />
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