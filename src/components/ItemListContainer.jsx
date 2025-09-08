// import { useEffect, useState, useCallback } from "react";
// import ItemList from "./ItemList";
// import { useParams, Link, useLocation, useSearchParams } from "react-router-dom";
// import { getFirestore, collection, getDocs } from "firebase/firestore";
// import Loading from "./Loading";
// import FilterBar from "./FilterBar";
// import CategoryCards from "./CategoryCards";

// const ItemListContainer = ({ top, oferta, titulo }) => {
//     const [items, setItems] = useState([]);
//     const [filteredItems, setFilteredItems] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [sortBy, setSortBy] = useState("nombre");
//     const [priceRange, setPriceRange] = useState([0, 100000]);
//     const [showFilters, setShowFilters] = useState(false);
//     const { id } = useParams();
//     const location = useLocation();
//     const [searchParams] = useSearchParams();
//     const searchTerm = searchParams.get('search');

//     // Función para normalizar texto (eliminar acentos)
//     const normalizarTexto = useCallback((texto) => {
//         if (!texto) return '';
//         return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
//     }, []);

//     // Verificar si estamos en la página principal de productos
//     const isHomePage = !id && !searchTerm && location.pathname === "/";

//     useEffect(() => {
//         const fetchProducts = async () => {
//             setLoading(true);
//             const db = getFirestore();
//             const itemsCollection = collection(db, "fragancias");
            
//             try {
//                 const resultado = await getDocs(itemsCollection);
                
//                 if (resultado.size > 0) {
//                     const todosLosProductos = resultado.docs.map(producto => ({ 
//                         id: producto.id, 
//                         ...producto.data() 
//                     }));
                    
//                     setItems(todosLosProductos);
                    
//                     // Función para aplicar filtros básicos
//                     const aplicarFiltrosBasicos = (productos) => {
//                         let filtrados = [...productos];
                        
//                         // PRIMERO: Verificar si hay búsqueda
//                         if (searchTerm) {
//                             // Aplicar filtro de búsqueda
//                             const normalizedSearch = normalizarTexto(searchTerm);
//                             filtrados = filtrados.filter(item =>
//                                 normalizarTexto(item.nombre || '').includes(normalizedSearch) ||
//                                 normalizarTexto(item.marca || '').includes(normalizedSearch) ||
//                                 normalizarTexto(item.categoria || '').includes(normalizedSearch) ||
//                                 normalizarTexto(item.descripcion || '').includes(normalizedSearch)
//                             );
//                         }
//                         else if (oferta) {
//                             filtrados = filtrados.filter(item => item.descuento > 0);
//                         } else if (id) {
//                             const esMarca = location.pathname.includes('/brand/');
//                             const textoBuscado = normalizarTexto(decodeURIComponent(id));
                            
//                             if (esMarca) {
//                                 filtrados = filtrados.filter(item => 
//                                     item.marca && normalizarTexto(item.marca) === textoBuscado
//                                 );
//                             } else {
//                                 filtrados = filtrados.filter(item => 
//                                     item.categoria && normalizarTexto(item.categoria) === textoBuscado
//                                 );
//                             }
//                         } else if (top) {
//                             filtrados = filtrados.filter(item => item.stock < 15);
//                         }
                        
//                         return filtrados;
//                     };

//                     // Función para aplicar ordenamiento
//                     const aplicarOrdenamiento = (productos, tipoOrden) => {
//                         return [...productos].sort((a, b) => {
//                             switch (tipoOrden) {
//                                 case "precio-asc":
//                                     return (a.precio || 0) - (b.precio || 0);
//                                 case "precio-desc":
//                                     return (b.precio || 0) - (a.precio || 0);
//                                 case "nombre":
//                                     return (a.nombre || '').localeCompare(b.nombre || '');
//                                 case "nuevos":
//                                     return new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0);
//                                 default:
//                                     return 0;
//                             }
//                         });
//                     };

//                     // Aplicar filtros básicos
//                     let productosFiltrados = aplicarFiltrosBasicos(todosLosProductos);
                    
//                     // Aplicar ordenamiento
//                     productosFiltrados = aplicarOrdenamiento(productosFiltrados, sortBy);
                    
//                     setFilteredItems(productosFiltrados);
//                 } else {
//                     setItems([]);
//                     setFilteredItems([]);
//                 }
//             } catch (error) {
//                 console.error("Error al cargar productos:", error);
//                 setItems([]);
//                 setFilteredItems([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProducts();
//     }, [id, top, oferta, normalizarTexto, location.pathname, sortBy, searchTerm]);

//     // Handlers para FilterBar
//     const handleSortChange = (sortType) => {
//         setSortBy(sortType);
//         const sorted = [...filteredItems].sort((a, b) => {
//             switch (sortType) {
//                 case "precio-asc":
//                     return (a.precio || 0) - (b.precio || 0);
//                 case "precio-desc":
//                     return (b.precio || 0) - (a.precio || 0);
//                 case "nombre":
//                     return (a.nombre || '').localeCompare(b.nombre || '');
//                 case "nuevos":
//                     return new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0);
//                 default:
//                     return 0;
//             }
//         });
//         setFilteredItems(sorted);
//     };

//     const handlePriceFilter = (min, max) => {
//         setPriceRange([min, max]);
//         // Filtrar desde los items ya filtrados (no desde todos)
//         const filtrados = filteredItems.filter(item => 
//             (item.precio || 0) >= min && (item.precio || 0) <= max
//         );
//         setFilteredItems(filtrados);
//     };

//     const handleClearFilters = () => {
//         setSortBy("nombre");
//         setPriceRange([0, 100000]);
        
//         // Restaurar los filtros originales
//         if (searchTerm) {
//             const normalizedSearch = normalizarTexto(searchTerm);
//             const filtrados = items.filter(item =>
//                 normalizarTexto(item.nombre || '').includes(normalizedSearch) ||
//                 normalizarTexto(item.marca || '').includes(normalizedSearch) ||
//                 normalizarTexto(item.categoria || '').includes(normalizedSearch) ||
//                 normalizarTexto(item.descripcion || '').includes(normalizedSearch)
//             );
//             setFilteredItems(filtrados);
//         }
//         else if (id) {
//             const esMarca = location.pathname.includes('/brand/');
//             const textoBuscado = normalizarTexto(decodeURIComponent(id));
            
//             const filtrados = items.filter(item => {
//                 if (esMarca) {
//                     return item.marca && normalizarTexto(item.marca) === textoBuscado;
//                 } else {
//                     return item.categoria && normalizarTexto(item.categoria) === textoBuscado;
//                 }
//             });
//             setFilteredItems(filtrados);
//         } else {
//             setFilteredItems(items);
//         }
        
//         setShowFilters(false);
//     };

//     // Determinar el título dinámico
//     const getTitulo = () => {
//         if (searchTerm) {
//             return `Búsqueda: "${decodeURIComponent(searchTerm)}"`;
//         }
//         if (id) {
//             return decodeURIComponent(id);
//         }
//         if (titulo) return titulo;
//         return <h2>Productos</h2>;
//     };

//     // Ocultar breadcrumb si hay búsqueda
//     const showBreadcrumb = (id || location.pathname.includes('/brand/')) && !searchTerm;

//     return (
//         <div className="container alto my-5">
//             {/* Breadcrumbs de navegación */}
//             {showBreadcrumb && (
//                 <nav aria-label="breadcrumb" className="mb-3">
//                     <ol className="breadcrumb justify-content-center">
//                         <li className="breadcrumb-item">
//                             <Link to="/" className="text-decoration-none">
//                                 Inicio
//                             </Link>
//                         </li>
//                         {location.pathname.includes('/brand/') && (
//                             <li className="breadcrumb-item">
//                                 <Link to="/" className="text-decoration-none">
//                                     Marcas
//                                 </Link>
//                             </li>
//                         )}
//                         <li className="breadcrumb-item active text-capitalize">
//                             {id ? decodeURIComponent(id) : ''}
//                         </li>
//                     </ol>
//                 </nav>
//             )}

//             {/* Tarjetas de categorías - Solo en página principal */}
//             {isHomePage && <CategoryCards />}

//             {/* Título después de las categorías */}
//             <div className="row text-center mb-4">
//                 <div className="col">
//                     <h1 className="text-capitalize fw-bold">{getTitulo()}</h1>
//                 </div>
//             </div>

//             {/* Botón para mostrar/ocultar filtros */}
//             {items.length > 0 && filteredItems.length > 0 && (
//                 <div className="row mb-4">
//                     <div className="col">
//                         <button 
//                             className={`btn ${showFilters ? 'btn-secondary' : 'btn-outline-primary'}`}
//                             onClick={() => setShowFilters(!showFilters)}
//                             style={{ transition: 'all 0.3s ease' }}
//                         >
//                             {showFilters ? '▲ Ocultar Filtros' : '▼ Mostrar Filtros'}
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* FilterBar - Solo mostrar si está activo y hay productos */}
//             {showFilters && items.length > 0 && filteredItems.length > 0 && (
//                 <FilterBar
//                     onSortChange={handleSortChange}
//                     onPriceFilter={handlePriceFilter}
//                     onClearFilters={handleClearFilters}
//                     sortBy={sortBy}
//                     priceRange={priceRange}
//                     productCount={filteredItems.length}
//                     totalProducts={items.length}
//                 />
//             )}

//             {/* Mensaje cuando no hay productos */}
//             {!loading && filteredItems.length === 0 && (
//                 <div className="text-center py-5">
//                     <div className="py-4">
//                         <h4 className="text-muted mb-3">😔 No se encontraron productos</h4>
//                         <p className="text-muted mb-4">
//                             {searchTerm ? 
//                                 "Intenta con otros términos de búsqueda" :
//                                 id ? 
//                                 `Pronto tendremos más stock ${location.pathname.includes('/brand/') ? 'de esta marca' : 'en esta categoría'}` : 
//                                 "Intenta con otros filtros o visita nuestras otras secciones"
//                             }
//                         </p>
//                         <div className="d-flex gap-2 justify-content-center">
//                             <button 
//                                 className="btn btn-primary"
//                                 onClick={handleClearFilters}
//                             >
//                                 ↺ Limpiar filtros
//                             </button>
//                             <Link to="/" className="btn btn-outline-secondary">
//                                 ← Volver al inicio
//                             </Link>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Lista de productos */}
//             <div className="row justify-content-center">
//                 {loading ? (
//                     <Loading />
//                 ) : filteredItems.length > 0 ? (
//                     <ItemList items={filteredItems} />
//                 ) : null}
//             </div>

//             {/* Botón para volver al inicio cuando hay filtros aplicados */}
//             {(id || oferta || top || searchTerm) && filteredItems.length > 0 && (
//                 <div className="row mt-5">
//                     <div className="col text-center">
//                         <Link 
//                             to="/" 
//                             className="btn btn-outline-secondary"
//                         >
//                             ← Ver todos los productos
//                         </Link>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ItemListContainer;

// import { useEffect, useState, useCallback } from "react";
// import ItemList from "./ItemList";
// import { useParams, Link, useLocation, useSearchParams } from "react-router-dom";
// import { getFirestore, collection, getDocs } from "firebase/firestore";
// import Loading from "./Loading";
// import FilterBar from "./FilterBar";
// import CategoryCards from "./CategoryCards";

// const ItemListContainer = ({ top, oferta, titulo }) => {
//     const [items, setItems] = useState([]);
//     const [filteredItems, setFilteredItems] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [sortBy, setSortBy] = useState("nombre");
//     const [priceRange, setPriceRange] = useState([0, 100000]);
//     const [showFilters, setShowFilters] = useState(false);
//     const { id } = useParams();
//     const location = useLocation();
//     const [searchParams] = useSearchParams();
//     const searchTerm = searchParams.get('search');

//     // ✅ CONTENIDO SEO DINÁMICO PARA CADA CATEGORÍA
//     const categoryContent = {
//         'proteinas': {
//             title: "Las Mejores Proteínas para Aumentar Masa Muscular | Al Fallo",
//             description: "Maximiza tu recuperación y crecimiento muscular con nuestra gama de proteínas. Elige entre proteína de suero (whey), isolada y otras opciones para alcanzar tus objetivos fitness de la forma más deliciosa y efectiva. ¡El suplemento esencial para cualquier rutina de entrenamiento!"
//         },
//         'creatina': {
//             title: "Comprar Creatina Monohidrato y Micronizada al Mejor Precio | Al Fallo",
//             description: "Descubre nuestra amplia selección de creatinas para potenciar tu fuerza y rendimiento. En Al Fallo Suplementos, solo encontrarás creatina monohidrato de la más alta pureza, el suplemento más efectivo para el aumento de masa muscular y la mejora del rendimiento deportivo."
//         },
//         'aminoacidos': {
//             title: "Aminoácidos Esenciales y BCAA para tu Recuperación Muscular | Al Fallo",
//             description: "Acelera tu recuperación y combate la fatiga muscular con nuestra variedad de aminoácidos esenciales (EAA) y aminoácidos de cadena ramificada (BCAA). Ideales para tomar antes, durante o después del entrenamiento, son clave para el crecimiento muscular y la síntesis de proteínas."
//         },
//         'preentreno': {
//             title: "Pre-entrenos para Energía y Máximo Rendimiento | Al Fallo Suplementos",
//             description: "Dale un impulso a tu rutina de ejercicios con nuestra selección de pre-entrenos. Formulado para aumentar tu energía, concentración y fuerza, un buen pre-entreno te ayudará a romper tus límites en cada sesión."
//         },
//         'intraentreno': {
//             title: "Intra-entrenos: Hidratación y Energía Sostenida | Al Fallo Suplementos",
//             description: "Mantén tu rendimiento al máximo durante el entrenamiento con nuestros suplementos intra-entreno. Diseñados para aportar hidratación, electrolitos y carbohidratos, te ayudan a mantener la energía y prevenir la fatiga muscular."
//         },
//         'postentreno': {
//             title: "Post-entrenos para una Recuperación Óptima | Al Fallo Suplementos",
//             description: "Optimiza la recuperación muscular después de tu entrenamiento con nuestros post-entrenos. Contienen una mezcla de proteínas, carbohidratos y aminoácidos para reparar los tejidos musculares y reponer las reservas de glucógeno de forma rápida."
//         },
//         'ganadores de masa': {
//             title: "Ganadores de Peso y Mass Gainer para Aumentar de Volumen | Al Fallo",
//             description: "Si buscas aumentar tu masa muscular y peso de forma efectiva, nuestros ganadores de peso son la solución. Con una alta concentración de calorías, proteínas y carbohidratos, son el suplemento perfecto para quienes tienen dificultades para subir de peso."
//         },
//         'quemadores': {
//             title: "Quemadores de Grasa y Termogénicos para Definición | Al Fallo",
//             description: "Acelera tu metabolismo y quema grasa de forma efectiva con nuestra gama de quemadores de grasa. Estos suplementos, que incluyen termogénicos, te ayudan a alcanzar tus objetivos de definición al potenciar la pérdida de peso y aumentar tu nivel de energía."
//         },
//         'termogenicos': {
//             title: "Termogénicos Naturales para Potenciar la Quema de Grasa | Al Fallo",
//             description: "Los termogénicos son la herramienta ideal para la definición muscular. Aumentan la temperatura corporal para potenciar la quema de calorías y la movilización de grasas. ¡Complementa tu dieta y entrenamiento con estos potentes aliados!"
//         },
//         'magnesio': {
//             title: "Comprar Magnesio para Rendimiento y Relajación Muscular | Al Fallo",
//             description: "El magnesio es un mineral clave para atletas. Ayuda en la función muscular, la síntesis de proteínas y la reducción del cansancio. Descubre nuestra selección de suplementos de magnesio para mejorar tu recuperación y bienestar."
//         },
//         'glutamina': {
//             title: "Glutamina de Alta Pureza para la Recuperación | Al Fallo Suplementos",
//             description: "La glutamina es un aminoácido esencial para la recuperación muscular y el sistema inmune. Tomar glutamina después de entrenar ayuda a reducir el daño muscular y a mantener un estado anabólico para un crecimiento óptimo."
//         },
//         'vitaminas': {
//             title: "Vitaminas y Suplementos Esenciales para tu Salud | Al Fallo",
//             description: "Fortalece tu sistema inmunológico y mejora tu bienestar general con nuestra selección de vitaminas y minerales. Desde multivitamínicos completos hasta vitamina D y magnesio, te ofrecemos lo que necesitas para complementar tu nutrición y mantener tu cuerpo en óptimas condiciones."
//         },
//         'minerales': {
//             title: "Minerales Esenciales para una Nutrición Completa | Al Fallo Suplementos",
//             description: "Los minerales juegan un papel vital en el rendimiento deportivo y la salud. Encuentra suplementos de zinc, calcio, hierro y más para asegurar que tu cuerpo funcione al máximo, previniendo deficiencias y mejorando tu bienestar general."
//         },
//         'omega': {
//             title: "Omega 3, 6 y 9 para Salud Cardiovascular y Articular | Al Fallo",
//             description: "Los ácidos grasos esenciales como el Omega 3, 6 y 9 son fundamentales para tu salud. Nuestros suplementos de omega ayudan a reducir la inflamación, mejorar la salud cardiovascular y apoyar la función cerebral. Un aliado clave para cualquier estilo de vida activo."
//         },
//         'colageno': {
//             title: "Suplementos de Colágeno para Articulaciones y Piel | Al Fallo",
//             description: "Protege tus articulaciones, ligamentos y tendones con nuestra variedad de colágeno. Ideal para prevenir lesiones y mejorar la elasticidad de la piel y el cabello. Un suplemento esencial para la longevidad y la salud del tejido conectivo."
//         },
//         'energeticos': {
//             title: "Suplementos Energéticos para Maximizar tu Rendimiento | Al Fallo",
//             description: "Cuando la energía no es suficiente, nuestros suplementos energéticos te dan el impulso que necesitas. Geles, bebidas y cápsulas con cafeína y carbohidratos para mantener el ritmo durante tus entrenamientos más exigentes y competencias."
//         },
//         'electrolitos': {
//             title: "Electrolitos para Hidratación y Rendimiento Deportivo | Al Fallo",
//             description: "Mantente hidratado y evita calambres con nuestros suplementos de electrolitos. La reposición de sodio, potasio y otros minerales es vital para el rendimiento, especialmente en entrenamientos largos o en climas cálidos."
//         },
//         'carbohidratos': {
//             title: "Carbohidratos Deportivos para Energía y Carga Muscular | Al Fallo",
//             description: "Abastece tus músculos con nuestros carbohidratos de rápida y lenta absorción. Perfectos para la carga de glucógeno antes de un evento o para reponer la energía perdida durante el ejercicio. ¡El combustible que tu cuerpo necesita!"
//         },
//         'barras proteicas': {
//             title: "Barritas Proteicas y Snacks Saludables | Al Fallo Suplementos",
//             description: "El snack ideal para llevar, nuestras barritas proteicas te ofrecen una dosis de proteína y energía en cualquier momento. Perfectas para un tentempié post-entrenamiento o un sustituto de comida rápido y nutritivo."
//         },
//         'snacks': {
//             title: "Snacks Saludables y Nutritivos para tu Dieta | Al Fallo",
//             description: "Descubre nuestra selección de snacks saludables, perfectos para complementar tu dieta. Desde barritas hasta galletas, te ayudamos a mantener el control de tus macros con opciones deliciosas que no comprometen tu nutrición."
//         },
//         'accesorios': {
//             title: "Accesorios Deportivos Esenciales para tu Entrenamiento | Al Fallo",
//             description: "Complementa tu rutina de ejercicios con nuestros accesorios deportivos. Shakers, botellas, toallas y más, diseñados para hacer tu vida más fácil y ayudarte a alcanzar tus metas de forma más eficiente."
//         },
//         'oxido nitrico': {
//             title: "Óxido Nítrico para Potenciar la Vasodilatación | Al Fallo Suplementos",
//             description: "Aumenta el flujo sanguíneo a tus músculos con suplementos de óxido nítrico. Esto se traduce en una mejor 'bomba' muscular, mayor entrega de nutrientes y una increíble vascularidad durante tus entrenamientos. ¡Siente la diferencia!"
//         },
//         'pre-workout': {
//             title: "Pre-workouts Potentes para un Rendimiento Máximo | Al Fallo Suplementos",
//             description: "Desbloquea tu verdadero potencial con nuestros pre-workouts. Una combinación de ingredientes activos para aumentar la energía, la concentración y la fuerza, garantizando que cada sesión de gimnasio sea la mejor. ¡No dejes que el cansancio te detenga!"
//         },
//     };

//     // Función para normalizar texto (eliminar acentos)
//     const normalizarTexto = useCallback((texto) => {
//         if (!texto) return '';
//         return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
//     }, []);

//     // Verificar si estamos en la página principal de productos
//     const isHomePage = !id && !searchTerm && location.pathname === "/";
//     const currentCategory = normalizarTexto(id || '');

//     useEffect(() => {
//         const fetchProducts = async () => {
//             setLoading(true);
//             const db = getFirestore();
//             const itemsCollection = collection(db, "fragancias");

//             try {
//                 const resultado = await getDocs(itemsCollection);

//                 if (resultado.size > 0) {
//                     const todosLosProductos = resultado.docs.map(producto => ({
//                         id: producto.id,
//                         ...producto.data()
//                     }));

//                     setItems(todosLosProductos);

//                     // Función para aplicar filtros básicos
//                     const aplicarFiltrosBasicos = (productos) => {
//                         let filtrados = [...productos];

//                         // PRIMERO: Verificar si hay búsqueda
//                         if (searchTerm) {
//                             // Aplicar filtro de búsqueda
//                             const normalizedSearch = normalizarTexto(searchTerm);
//                             filtrados = filtrados.filter(item =>
//                                 normalizarTexto(item.nombre || '').includes(normalizedSearch) ||
//                                 normalizarTexto(item.marca || '').includes(normalizedSearch) ||
//                                 normalizarTexto(item.categoria || '').includes(normalizedSearch) ||
//                                 normalizarTexto(item.descripcion || '').includes(normalizedSearch)
//                             );
//                         }
//                         else if (oferta) {
//                             filtrados = filtrados.filter(item => item.descuento > 0);
//                         } else if (id) {
//                             const esMarca = location.pathname.includes('/brand/');
//                             const textoBuscado = normalizarTexto(decodeURIComponent(id));

//                             if (esMarca) {
//                                 filtrados = filtrados.filter(item =>
//                                     item.marca && normalizarTexto(item.marca) === textoBuscado
//                                 );
//                             } else {
//                                 filtrados = filtrados.filter(item =>
//                                     item.categoria && normalizarTexto(item.categoria) === textoBuscado
//                                 );
//                             }
//                         } else if (top) {
//                             filtrados = filtrados.filter(item => item.stock < 15);
//                         }

//                         return filtrados;
//                     };

//                     // Función para aplicar ordenamiento
//                     const aplicarOrdenamiento = (productos, tipoOrden) => {
//                         return [...productos].sort((a, b) => {
//                             switch (tipoOrden) {
//                                 case "precio-asc":
//                                     return (a.precio || 0) - (b.precio || 0);
//                                 case "precio-desc":
//                                     return (b.precio || 0) - (a.precio || 0);
//                                 case "nombre":
//                                     return (a.nombre || '').localeCompare(b.nombre || '');
//                                 case "nuevos":
//                                     return new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0);
//                                 default:
//                                     return 0;
//                             }
//                         });
//                     };

//                     // Aplicar filtros básicos
//                     let productosFiltrados = aplicarFiltrosBasicos(todosLosProductos);

//                     // Aplicar ordenamiento
//                     productosFiltrados = aplicarOrdenamiento(productosFiltrados, sortBy);

//                     setFilteredItems(productosFiltrados);
//                 } else {
//                     setItems([]);
//                     setFilteredItems([]);
//                 }
//             } catch (error) {
//                 console.error("Error al cargar productos:", error);
//                 setItems([]);
//                 setFilteredItems([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProducts();
//     }, [id, top, oferta, normalizarTexto, location.pathname, sortBy, searchTerm]);

//     // Handlers para FilterBar
//     const handleSortChange = (sortType) => {
//         setSortBy(sortType);
//         const sorted = [...filteredItems].sort((a, b) => {
//             switch (sortType) {
//                 case "precio-asc":
//                     return (a.precio || 0) - (b.precio || 0);
//                 case "precio-desc":
//                     return (b.precio || 0) - (a.precio || 0);
//                 case "nombre":
//                     return (a.nombre || '').localeCompare(b.nombre || '');
//                 case "nuevos":
//                     return new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0);
//                 default:
//                     return 0;
//             }
//         });
//         setFilteredItems(sorted);
//     };

//     const handlePriceFilter = (min, max) => {
//         setPriceRange([min, max]);
//         // Filtrar desde los items ya filtrados (no desde todos)
//         const filtrados = filteredItems.filter(item =>
//             (item.precio || 0) >= min && (item.precio || 0) <= max
//         );
//         setFilteredItems(filtrados);
//     };

//     const handleClearFilters = () => {
//         setSortBy("nombre");
//         setPriceRange([0, 100000]);

//         // Restaurar los filtros originales
//         if (searchTerm) {
//             const normalizedSearch = normalizarTexto(searchTerm);
//             const filtrados = items.filter(item =>
//                 normalizarTexto(item.nombre || '').includes(normalizedSearch) ||
//                 normalizarTexto(item.marca || '').includes(normalizedSearch) ||
//                 normalizarTexto(item.categoria || '').includes(normalizedSearch) ||
//                 normalizarTexto(item.descripcion || '').includes(normalizedSearch)
//             );
//             setFilteredItems(filtrados);
//         }
//         else if (id) {
//             const esMarca = location.pathname.includes('/brand/');
//             const textoBuscado = normalizarTexto(decodeURIComponent(id));

//             const filtrados = items.filter(item => {
//                 if (esMarca) {
//                     return item.marca && normalizarTexto(item.marca) === textoBuscado;
//                 } else {
//                     return item.categoria && normalizarTexto(item.categoria) === textoBuscado;
//                 }
//             });
//             setFilteredItems(filtrados);
//         } else {
//             setFilteredItems(items);
//         }

//         setShowFilters(false);
//     };

//     // Determinar el título dinámico
//     const getTitulo = () => {
//         if (searchTerm) {
//             return `Búsqueda: "${decodeURIComponent(searchTerm)}"`;
//         }
//         if (id) {
//             return categoryContent[currentCategory]?.title || decodeURIComponent(id);
//         }
//         if (titulo) return titulo;
//         return <h2>Productos</h2>;
//     };

//     // Ocultar breadcrumb si hay búsqueda
//     const showBreadcrumb = (id || location.pathname.includes('/brand/')) && !searchTerm;

//     return (
//         <div className="container alto my-5">
//             {/* Breadcrumbs de navegación */}
//             {showBreadcrumb && (
//                 <nav aria-label="breadcrumb" className="mb-3">
//                     <ol className="breadcrumb justify-content-center">
//                         <li className="breadcrumb-item">
//                             <Link to="/" className="text-decoration-none">
//                                 Inicio
//                             </Link>
//                         </li>
//                         {location.pathname.includes('/brand/') && (
//                             <li className="breadcrumb-item">
//                                 <Link to="/" className="text-decoration-none">
//                                     Marcas
//                                 </Link>
//                             </li>
//                         )}
//                         <li className="breadcrumb-item active text-capitalize">
//                             {id ? decodeURIComponent(id) : ''}
//                         </li>
//                     </ol>
//                 </nav>
//             )}

//             {/* Tarjetas de categorías - Solo en página principal */}
//             {isHomePage && <CategoryCards />}

//             {/* ✅ CAMBIO IMPORTANTE: Título SEO dinámico */}
//             <div className="row text-center mb-4">
//                 <div className="col">
//                     <h1 className="text-capitalize fw-bold">{getTitulo()}</h1>
//                 </div>
//             </div>
//             {/* ✅ NUEVO: Contenido descriptivo SEO */}
//             {id && categoryContent[currentCategory] && (
//                 <div className="row mb-5 text-center">
//                     <div className="col">
//                         <p>{categoryContent[currentCategory].description}</p>
//                     </div>
//                 </div>
//             )}

//             {/* Botón para mostrar/ocultar filtros */}
//             {items.length > 0 && filteredItems.length > 0 && (
//                 <div className="row mb-4">
//                     <div className="col">
//                         <button
//                             className={`btn ${showFilters ? 'btn-secondary' : 'btn-outline-primary'}`}
//                             onClick={() => setShowFilters(!showFilters)}
//                             style={{ transition: 'all 0.3s ease' }}
//                         >
//                             {showFilters ? '▲ Ocultar Filtros' : '▼ Mostrar Filtros'}
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* FilterBar - Solo mostrar si está activo y hay productos */}
//             {showFilters && items.length > 0 && filteredItems.length > 0 && (
//                 <FilterBar
//                     onSortChange={handleSortChange}
//                     onPriceFilter={handlePriceFilter}
//                     onClearFilters={handleClearFilters}
//                     sortBy={sortBy}
//                     priceRange={priceRange}
//                     productCount={filteredItems.length}
//                     totalProducts={items.length}
//                 />
//             )}

//             {/* Mensaje cuando no hay productos */}
//             {!loading && filteredItems.length === 0 && (
//                 <div className="text-center py-5">
//                     <div className="py-4">
//                         <h4 className="text-muted mb-3">😔 No se encontraron productos</h4>
//                         <p className="text-muted mb-4">
//                             {searchTerm ?
//                                 "Intenta con otros términos de búsqueda" :
//                                 id ?
//                                     `Pronto tendremos más stock ${location.pathname.includes('/brand/') ? 'de esta marca' : 'en esta categoría'}` :
//                                     "Intenta con otros filtros o visita nuestras otras secciones"
//                             }
//                         </p>
//                         <div className="d-flex gap-2 justify-content-center">
//                             <button
//                                 className="btn btn-primary"
//                                 onClick={handleClearFilters}
//                             >
//                                 ↺ Limpiar filtros
//                             </button>
//                             <Link to="/" className="btn btn-outline-secondary">
//                                 ← Volver al inicio
//                             </Link>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Lista de productos */}
//             <div className="row justify-content-center">
//                 {loading ? (
//                     <Loading />
//                 ) : filteredItems.length > 0 ? (
//                     <ItemList items={filteredItems} />
//                 ) : null}
//             </div>

//             {/* Botón para volver al inicio cuando hay filtros aplicados */}
//             {(id || oferta || top || searchTerm) && filteredItems.length > 0 && (
//                 <div className="row mt-5">
//                     <div className="col text-center">
//                         <Link
//                             to="/"
//                             className="btn btn-outline-secondary"
//                         >
//                             ← Ver todos los productos
//                         </Link>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ItemListContainer;

import { useEffect, useState, useCallback } from "react";
import ItemList from "./ItemList";
import { useParams, Link, useLocation, useSearchParams } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Loading from "./Loading";
import FilterBar from "./FilterBar";
import CategoryCards from "./CategoryCards";
import { Helmet } from "react-helmet";

const ItemListContainer = ({ top, oferta, titulo }) => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("nombre");
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [showFilters, setShowFilters] = useState(false);
    const { id } = useParams();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search');

    // ✅ CONTENIDO SEO Y DESCRIPTIVO
    const categoryContent = {
        'proteinas': {
            title: "Las Mejores Proteínas para Aumentar Masa Muscular | Al Fallo",
            description: "Maximiza tu recuperación y crecimiento muscular con nuestra gama de proteínas. Elige entre proteína de suero (whey), isolada y otras opciones para alcanzar tus objetivos fitness de la forma más deliciosa y efectiva. ¡El suplemento esencial para cualquier rutina de entrenamiento!"
        },
        'creatina': {
            title: "Comprar Creatina Monohidrato y Micronizada al Mejor Precio | Al Fallo",
            description: "Descubre nuestra amplia selección de creatinas para potenciar tu fuerza y rendimiento. En Al Fallo Suplementos, solo encontrarás creatina monohidrato de la más alta pureza, el suplemento más efectivo para el aumento de masa muscular y la mejora del rendimiento deportivo."
        },
        'aminoacidos': {
            title: "Aminoácidos Esenciales y BCAA para tu Recuperación Muscular | Al Fallo",
            description: "Acelera tu recuperación y combate la fatiga muscular con nuestra variedad de aminoácidos esenciales (EAA) y aminoácidos de cadena ramificada (BCAA). Ideales para tomar antes, durante o después del entrenamiento, son clave para el crecimiento muscular y la síntesis de proteínas."
        },
        'preentreno': {
            title: "Pre-entrenos para Energía y Máximo Rendimiento | Al Fallo Suplementos",
            description: "Dale un impulso a tu rutina de ejercicios con nuestra selección de pre-entrenos. Formulado para aumentar tu energía, concentración y fuerza, un buen pre-entreno te ayudará a romper tus límites en cada sesión."
        },
        'intraentreno': {
            title: "Intra-entrenos: Hidratación y Energía Sostenida | Al Fallo Suplementos",
            description: "Mantén tu rendimiento al máximo durante el entrenamiento con nuestros suplementos intra-entreno. Diseñados para aportar hidratación, electrolitos y carbohidratos, te ayudan a mantener la energía y prevenir la fatiga muscular."
        },
        'postentreno': {
            title: "Post-entrenos para una Recuperación Óptima | Al Fallo Suplementos",
            description: "Optimiza la recuperación muscular después de tu entrenamiento con nuestros post-entrenos. Contienen una mezcla de proteínas, carbohidratos y aminoácidos para reparar los tejidos musculares y reponer las reservas de glucógeno de forma rápida."
        },
        'ganadores de masa': {
            title: "Ganadores de Peso y Mass Gainer para Aumentar de Volumen | Al Fallo",
            description: "Si buscas aumentar tu masa muscular y peso de forma efectiva, nuestros ganadores de peso son la solución. Con una alta concentración de calorías, proteínas y carbohidratos, son el suplemento perfecto para quienes tienen dificultades para subir de peso."
        },
        'quemadores': {
            title: "Quemadores de Grasa y Termogénicos para Definición | Al Fallo",
            description: "Acelera tu metabolismo y quema grasa de forma efectiva con nuestra gama de quemadores de grasa. Estos suplementos, que incluyen termogénicos, te ayudan a alcanzar tus objetivos de definición al potenciar la pérdida de peso y aumentar tu nivel de energía."
        },
        'termogenicos': {
            title: "Termogénicos Naturales para Potenciar la Quema de Grasa | Al Fallo",
            description: "Los termogénicos son la herramienta ideal para la definición muscular. Aumentan la temperatura corporal para potenciar la quema de calorías y la movilización de grasas. ¡Complementa tu dieta y entrenamiento con estos potentes aliados!"
        },
        'magnesio': {
            title: "Comprar Magnesio para Rendimiento y Relajación Muscular | Al Fallo",
            description: "El magnesio es un mineral clave para atletas. Ayuda en la función muscular, la síntesis de proteínas y la reducción del cansancio. Descubre nuestra selección de suplementos de magnesio para mejorar tu recuperación y bienestar."
        },
        'glutamina': {
            title: "Glutamina de Alta Pureza para la Recuperación | Al Fallo Suplementos",
            description: "La glutamina es un aminoácido esencial para la recuperación muscular y el sistema inmune. Tomar glutamina después de entrenar ayuda a reducir el daño muscular y a mantener un estado anabólico para un crecimiento óptimo."
        },
        'vitaminas': {
            title: "Vitaminas y Suplementos Esenciales para tu Salud | Al Fallo",
            description: "Fortalece tu sistema inmunológico y mejora tu bienestar general con nuestra selección de vitaminas y minerales. Desde multivitamínicos completos hasta vitamina D y magnesio, te ofrecemos lo que necesitas para complementar tu nutrición y mantener tu cuerpo en óptimas condiciones."
        },
        'minerales': {
            title: "Minerales Esenciales para una Nutrición Completa | Al Fallo Suplementos",
            description: "Los minerales juegan un papel vital en el rendimiento deportivo y la salud. Encuentra suplementos de zinc, calcio, hierro y más para asegurar que tu cuerpo funcione al máximo, previniendo deficiencias y mejorando tu bienestar general."
        },
        'omega': {
            title: "Omega 3, 6 y 9 para Salud Cardiovascular y Articular | Al Fallo",
            description: "Los ácidos grasos esenciales como el Omega 3, 6 y 9 son fundamentales para tu salud. Nuestros suplementos de omega ayudan a reducir la inflamación, mejorar la salud cardiovascular y apoyar la función cerebral. Un aliado clave para cualquier estilo de vida activo."
        },
        'colageno': {
            title: "Suplementos de Colágeno para Articulaciones y Piel | Al Fallo",
            description: "Protege tus articulaciones, ligamentos y tendones con nuestra variedad de colágeno. Ideal para prevenir lesiones y mejorar la elasticidad de la piel y el cabello. Un suplemento esencial para la longevidad y la salud del tejido conectivo."
        },
        'energeticos': {
            title: "Suplementos Energéticos para Maximizar tu Rendimiento | Al Fallo",
            description: "Cuando la energía no es suficiente, nuestros suplementos energéticos te dan el impulso que necesitas. Geles, bebidas y cápsulas con cafeína y carbohidratos para mantener el ritmo durante tus entrenamientos más exigentes y competencias."
        },
        'electrolitos': {
            title: "Electrolitos para Hidratación y Rendimiento Deportivo | Al Fallo",
            description: "Mantente hidratado y evita calambres con nuestros suplementos de electrolitos. La reposición de sodio, potasio y otros minerales es vital para el rendimiento, especialmente en entrenamientos largos o en climas cálidos."
        },
        'carbohidratos': {
            title: "Carbohidratos Deportivos para Energía y Carga Muscular | Al Fallo",
            description: "Abastece tus músculos con nuestros carbohidratos de rápida y lenta absorción. Perfectos para la carga de glucógeno antes de un evento o para reponer la energía perdida durante el ejercicio. ¡El combustible que tu cuerpo necesita!"
        },
        'barras proteicas': {
            title: "Barritas Proteicas y Snacks Saludables | Al Fallo Suplementos",
            description: "El snack ideal para llevar, nuestras barritas proteicas te ofrecen una dosis de proteína y energía en cualquier momento. Perfectas para un tentempié post-entrenamiento o un sustituto de comida rápido y nutritivo."
        },
        'snacks': {
            title: "Snacks Saludables y Nutritivos para tu Dieta | Al Fallo",
            description: "Descubre nuestra selección de snacks saludables, perfectos para complementar tu dieta. Desde barritas hasta galletas, te ayudamos a mantener el control de tus macros con opciones deliciosas que no comprometen tu nutrición."
        },
        'accesorios': {
            title: "Accesorios Deportivos Esenciales para tu Entrenamiento | Al Fallo",
            description: "Complementa tu rutina de ejercicios con nuestros accesorios deportivos. Shakers, botellas, toallas y más, diseñados para hacer tu vida más fácil y ayudarte a alcanzar tus metas de forma más eficiente."
        },
        'oxido nitrico': {
            title: "Óxido Nítrico para Potenciar la Vasodilatación | Al Fallo Suplementos",
            description: "Aumenta el flujo sanguíneo a tus músculos con suplementos de óxido nítrico. Esto se traduce en una mejor 'bomba' muscular, mayor entrega de nutrientes y una increíble vascularidad durante tus entrenamientos. ¡Siente la diferencia!"
        },
        'pre-workout': {
            title: "Pre-workouts Potentes para un Rendimiento Máximo | Al Fallo Suplementos",
            description: "Desbloquea tu verdadero potencial con nuestros pre-workouts. Una combinación de ingredientes activos para aumentar la energía, la concentración y la fuerza, garantizando que cada sesión de gimnasio sea la mejor. ¡No dejes que el cansancio te detenga!"
        },
    };

    const normalizarTexto = useCallback((texto) => {
        if (!texto) return '';
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }, []);

    const isHomePage = !id && !searchTerm && location.pathname === "/";
    const currentCategory = normalizarTexto(id || '');

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

                    const aplicarFiltrosBasicos = (productos) => {
                        let filtrados = [...productos];
                        if (searchTerm) {
                            const normalizedSearch = normalizarTexto(searchTerm);
                            filtrados = filtrados.filter(item =>
                                normalizarTexto(item.nombre || '').includes(normalizedSearch) ||
                                normalizarTexto(item.marca || '').includes(normalizedSearch) ||
                                normalizarTexto(item.categoria || '').includes(normalizedSearch) ||
                                normalizarTexto(item.descripcion || '').includes(normalizedSearch)
                            );
                        }
                        else if (oferta) {
                            filtrados = filtrados.filter(item => item.descuento > 0);
                        } else if (id) {
                            const esMarca = location.pathname.includes('/brand/');
                            const textoBuscado = normalizarTexto(decodeURIComponent(id));

                            if (esMarca) {
                                filtrados = filtrados.filter(item =>
                                    item.marca && normalizarTexto(item.marca) === textoBuscado
                                );
                            } else {
                                filtrados = filtrados.filter(item =>
                                    item.categoria && normalizarTexto(item.categoria) === textoBuscado
                                );
                            }
                        } else if (top) {
                            filtrados = filtrados.filter(item => item.stock < 15);
                        }
                        return filtrados;
                    };

                    const aplicarOrdenamiento = (productos, tipoOrden) => {
                        return [...productos].sort((a, b) => {
                            switch (tipoOrden) {
                                case "precio-asc":
                                    return (a.precio || 0) - (b.precio || 0);
                                case "precio-desc":
                                    return (b.precio || 0) - (a.precio || 0);
                                case "nombre":
                                    return (a.nombre || '').localeCompare(b.nombre || '');
                                case "nuevos":
                                    return new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0);
                                default:
                                    return 0;
                            }
                        });
                    };

                    let productosFiltrados = aplicarFiltrosBasicos(todosLosProductos);
                    productosFiltrados = aplicarOrdenamiento(productosFiltrados, sortBy);
                    setFilteredItems(productosFiltrados);
                } else {
                    setItems([]);
                    setFilteredItems([]);
                }
            } catch (error) {
                console.error("Error al cargar productos:", error);
                setItems([]);
                setFilteredItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [id, top, oferta, normalizarTexto, location.pathname, sortBy, searchTerm]);

    const handleSortChange = (sortType) => {
        setSortBy(sortType);
        const sorted = [...filteredItems].sort((a, b) => {
            switch (sortType) {
                case "precio-asc":
                    return (a.precio || 0) - (b.precio || 0);
                case "precio-desc":
                    return (b.precio || 0) - (a.precio || 0);
                case "nombre":
                    return (a.nombre || '').localeCompare(b.nombre || '');
                case "nuevos":
                    return new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0);
                default:
                    return 0;
            }
        });
        setFilteredItems(sorted);
    };

    const handlePriceFilter = (min, max) => {
        setPriceRange([min, max]);
        const filtrados = filteredItems.filter(item =>
            (item.precio || 0) >= min && (item.precio || 0) <= max
        );
        setFilteredItems(filtrados);
    };

    const handleClearFilters = () => {
        setSortBy("nombre");
        setPriceRange([0, 100000]);

        if (searchTerm) {
            const normalizedSearch = normalizarTexto(searchTerm);
            const filtrados = items.filter(item =>
                normalizarTexto(item.nombre || '').includes(normalizedSearch) ||
                normalizarTexto(item.marca || '').includes(normalizedSearch) ||
                normalizarTexto(item.categoria || '').includes(normalizedSearch) ||
                normalizarTexto(item.descripcion || '').includes(normalizedSearch)
            );
            setFilteredItems(filtrados);
        }
        else if (id) {
            const esMarca = location.pathname.includes('/brand/');
            const textoBuscado = normalizarTexto(decodeURIComponent(id));
            const filtrados = items.filter(item => {
                if (esMarca) {
                    return item.marca && normalizarTexto(item.marca) === textoBuscado;
                } else {
                    return item.categoria && normalizarTexto(item.categoria) === textoBuscado;
                }
            });
            setFilteredItems(filtrados);
        } else {
            setFilteredItems(items);
        }

        setShowFilters(false);
    };

    const getUserVisibleTitle = () => {
        if (searchTerm) {
            return `Búsqueda: "${decodeURIComponent(searchTerm)}"`;
        }
        if (id) {
            return decodeURIComponent(id);
        }
        if (titulo) return titulo;
        return "Productos";
    };

    const getSeoMetadata = () => {
        const data = categoryContent[currentCategory];
        return {
            title: data?.title || '',
            description: data?.description || ''
        };
    };

    const seoData = getSeoMetadata();
    const showBreadcrumb = (id || location.pathname.includes('/brand/')) && !searchTerm;

    return (
        <div className="container alto my-5">
            {id && seoData.title && (
                <Helmet>
                    <title>{seoData.title}</title>
                    <meta name="description" content={seoData.description} />
                </Helmet>
            )}

            {showBreadcrumb && (
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb justify-content-center">
                        <li className="breadcrumb-item">
                            <Link to="/" className="text-decoration-none">Inicio</Link>
                        </li>
                        {location.pathname.includes('/brand/') && (
                            <li className="breadcrumb-item">
                                <Link to="/" className="text-decoration-none">Marcas</Link>
                            </li>
                        )}
                        <li className="breadcrumb-item active text-capitalize">
                            {id ? decodeURIComponent(id) : ''}
                        </li>
                    </ol>
                </nav>
            )}

            {isHomePage && <CategoryCards />}

            <div className="row text-center mb-4">
                <div className="col">
                    <h1 className="text-capitalize fw-bold">{getUserVisibleTitle()}</h1>
                </div>
            </div>

            {/* ✅ SE REINSERTA LA DESCRIPCIÓN VISIBLE EN LA PÁGINA */}
            {id && categoryContent[currentCategory] && (
                <div className="row mb-5 text-center">
                    <div className="col">
                        <p>{categoryContent[currentCategory].description}</p>
                    </div>
                </div>
            )}

            {items.length > 0 && filteredItems.length > 0 && (
                <div className="row mb-4">
                    <div className="col">
                        <button
                            className={`btn ${showFilters ? 'btn-secondary' : 'btn-outline-primary'}`}
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ transition: 'all 0.3s ease' }}
                        >
                            {showFilters ? '▲ Ocultar Filtros' : '▼ Mostrar Filtros'}
                        </button>
                    </div>
                </div>
            )}

            {showFilters && items.length > 0 && filteredItems.length > 0 && (
                <FilterBar
                    onSortChange={handleSortChange}
                    onPriceFilter={handlePriceFilter}
                    onClearFilters={handleClearFilters}
                    sortBy={sortBy}
                    priceRange={priceRange}
                    productCount={filteredItems.length}
                    totalProducts={items.length}
                />
            )}

            {!loading && filteredItems.length === 0 && (
                <div className="text-center py-5">
                    <div className="py-4">
                        <h4 className="text-muted mb-3">😔 No se encontraron productos</h4>
                        <p className="text-muted mb-4">
                            {searchTerm ?
                                "Intenta con otros términos de búsqueda" :
                                id ?
                                    `Pronto tendremos más stock ${location.pathname.includes('/brand/') ? 'de esta marca' : 'en esta categoría'}` :
                                    "Intenta con otros filtros o visita nuestras otras secciones"
                            }
                        </p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button
                                className="btn btn-primary"
                                onClick={handleClearFilters}
                            >
                                ↺ Limpiar filtros
                            </button>
                            <Link to="/" className="btn btn-outline-secondary">
                                ← Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="row justify-content-center">
                {loading ? (
                    <Loading />
                ) : filteredItems.length > 0 ? (
                    <ItemList items={filteredItems} />
                ) : null}
            </div>

            {(id || oferta || top || searchTerm) && filteredItems.length > 0 && (
                <div className="row mt-5">
                    <div className="col text-center">
                        <Link
                            to="/"
                            className="btn btn-outline-secondary"
                        >
                            ← Ver todos los productos
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemListContainer;