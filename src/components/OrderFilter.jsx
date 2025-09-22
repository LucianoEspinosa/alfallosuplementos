// import React from 'react';

// const OrderFilter = ({ filters, setFilters }) => {
//     const handleFilterChange = (field, value) => {
//         setFilters(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     return (
//         <div className="card mb-4">
//             <div className="card-header">
//                 <h6 className="mb-0">🔍 Filtros de búsqueda</h6>
//             </div>
//             <div className="card-body">
//                 <div className="row g-3">
//                     {/* Búsqueda por texto */}
//                     <div className="col-md-4">
//                         <label className="form-label">Buscar</label>
//                         <input
//                             type="text"
//                             className="form-control"
//                             placeholder="ID, nombre, email, teléfono..."
//                             value={filters.search}
//                             onChange={(e) => handleFilterChange('search', e.target.value)}
//                         />
//                     </div>

//                     {/* Filtro por estado */}
//                     <div className="col-md-3">
//                         <label className="form-label">Estado</label>
//                         <select
//                             className="form-select"
//                             value={filters.status}
//                             onChange={(e) => handleFilterChange('status', e.target.value)}
//                         >
//                             <option value="todos">Todos los estados</option>
//                             <option value="confirmando">⏳ Confirmando</option>
//                             <option value="confirmada">✅ Confirmada</option>
//                             <option value="pendiente">🔄 Pendiente</option>
//                             <option value="enviada">🚀 Enviada</option>
//                             <option value="completada">🎯 Completada</option>
//                             <option value="cancelada">❌ Cancelada</option>
//                         </select>
//                     </div>

//                     {/* Filtro por fecha */}
//                     <div className="col-md-3">
//                         <label className="form-label">Fecha</label>
//                         <select
//                             className="form-select"
//                             value={filters.dateRange}
//                             onChange={(e) => handleFilterChange('dateRange', e.target.value)}
//                         >
//                             <option value="todos">Todas las fechas</option>
//                             <option value="hoy">Hoy</option>
//                             <option value="semana">Última semana</option>
//                             <option value="mes">Último mes</option>
//                         </select>
//                     </div>

//                     {/* Botón para limpiar filtros */}
//                     <div className="col-md-2 d-flex align-items-end">
//                         <button
//                             className="btn btn-outline-secondary w-100"
//                             onClick={() => setFilters({
//                                 status: 'todos',
//                                 search: '',
//                                 dateRange: 'todos'
//                             })}
//                         >
//                             🗑️ Limpiar
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OrderFilter;


import React from 'react';

const OrderFilter = ({ filters, setFilters }) => {
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h6 className="mb-0">🔍 Filtros de búsqueda</h6>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label">Buscar</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="ID, nombre, email, teléfono..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Estado</label>
                        <select
                            className="form-select"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="confirmando">⏳ Confirmando</option>
                            <option value="confirmada">✅ Confirmada</option>
                            <option value="pendiente">🔄 Pendiente</option>
                            <option value="enviada">🚀 Enviada</option>
                            <option value="completada">🎯 Completada</option>
                            <option value="cancelada">❌ Cancelada</option>
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Fecha</label>
                        <select
                            className="form-select"
                            value={filters.dateRange}
                            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                        >
                            <option value="todos">Todas las fechas</option>
                            <option value="hoy">Hoy</option>
                            <option value="semana">Última semana</option>
                            <option value="mes">Último mes</option>
                        </select>
                    </div>

                    <div className="col-md-2 d-flex align-items-end">
                        <button
                            className="btn btn-outline-secondary w-100"
                            onClick={() => setFilters({
                                status: 'todos',
                                search: '',
                                dateRange: 'todos'
                            })}
                        >
                            🗑️ Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderFilter;
