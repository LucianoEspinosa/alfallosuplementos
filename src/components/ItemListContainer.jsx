import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { PiX, PiCaretDown } from "react-icons/pi";
import { Helmet } from "react-helmet";
import ItemList from "./ItemList";
import Loading from "./Loading";
import FilterBar from "./FilterBar";
import TrustStrip from "./TrustStrip";
import CategoryModal from "./CategoryModal";
import ProductPhoto from "./af/ProductPhoto";
import { getAllProducts } from "../utils/productsCache";
import { normalizarTexto, coincideBusqueda, fechaAlta, etiquetaCantidad } from "../utils/productos";
import { whatsappUrl } from "../config";

const TODAS = "Todas";

const Chips = ({ opciones, activa, onPick, tipo }) => (
    <div className={`af-chips af-chips--${tipo} af-noscrollbar`}>
        {[TODAS, ...opciones].map((op) => (
            <button
                key={op}
                type="button"
                className={`af-chip af-chip--${tipo} ${activa === op ? "is-on" : ""}`}
                onClick={() => onPick(op)}
                aria-pressed={activa === op}
            >
                {op}
            </button>
        ))}
    </div>
);

// Categorías que van primero en la tienda
const PRIORIDAD_CATEGORIAS = ["proteina", "creatina"];
const prioridadCategoria = (cat) => {
    const i = PRIORIDAD_CATEGORIAS.findIndex((k) => normalizarTexto(cat).startsWith(k));
    return i === -1 ? PRIORIDAD_CATEGORIAS.length : i;
};

// Grupo del lateral (desktop): compacto, se despliega al tocar el título
const ListaLateral = ({ titulo, opciones, activa, onPick, contar }) => {
    const [abierto, setAbierto] = useState(false);
    return (
        <div className={`af-side-group ${abierto ? "is-open" : ""}`}>
            <button
                type="button"
                className="af-side-toggle"
                onClick={() => setAbierto((v) => !v)}
                aria-expanded={abierto}
            >
                <span className="af-overline af-side-title">{titulo}</span>
                {!abierto && activa !== TODAS && <span className="af-side-current">{activa}</span>}
                <PiCaretDown size={14} className="af-side-caret" />
            </button>
            {abierto && [TODAS, ...opciones].map((op) => (
                <button
                    key={op}
                    type="button"
                    className={`af-side-item ${activa === op ? "is-on" : ""}`}
                    onClick={() => onPick(op)}
                    aria-pressed={activa === op}
                >
                    <span>{op}</span>
                    <span className="af-side-count">{contar(op)}</span>
                </button>
            ))}
        </div>
    );
};

const ItemListContainer = ({ top, oferta, titulo }) => {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("masvendidos");
    const [categoria, setCategoria] = useState(TODAS);
    const [marca, setMarca] = useState(TODAS);
    const [fotosRotas, setFotosRotas] = useState([]);
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search');
    const esMarca = location.pathname.includes('/brand/');

    // Contenido SEO y descriptivo por categoría
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

    const isHomePage = !id && !top && !oferta && location.pathname === "/";
    const currentCategory = normalizarTexto(id ? decodeURIComponent(id) : '');

    useEffect(() => {
        let vigente = true;
        setLoading(true);
        getAllProducts()
            .then((todosLosProductos) => vigente && setAllProducts(todosLosProductos))
            .catch((error) => console.error("Error al cargar productos:", error))
            .finally(() => vigente && setLoading(false));
        return () => {
            vigente = false;
        };
    }, []);

    // Conjunto base de la página: búsqueda, ofertas o más vendidos (los chips filtran dentro de este conjunto)
    const base = useMemo(() => {
        if (searchTerm) return allProducts.filter((item) => coincideBusqueda(item, searchTerm));
        if (oferta) return allProducts.filter((item) => item.descuento > 0);
        if (top) {
            const marcados = allProducts.filter((item) => item.masVendido === true);
            return marcados.length > 0 ? marcados : allProducts.filter((item) => item.stock < 15);
        }
        return allProducts;
    }, [allProducts, searchTerm, oferta, top]);

    const categorias = useMemo(
        () => [...new Set(base.map((p) => p.categoria).filter(Boolean))]
            .sort((a, b) => prioridadCategoria(a) - prioridadCategoria(b) || a.localeCompare(b)),
        [base]
    );
    const marcas = useMemo(() => [...new Set(base.map((p) => p.marca).filter(Boolean))].sort(), [base]);

    // La categoría o la marca de la URL (/category/:id, /brand/:id) arrancan seleccionadas en los chips
    useEffect(() => {
        const desdeUrl = id ? normalizarTexto(decodeURIComponent(id)) : "";
        const buscar = (lista) => lista.find((v) => normalizarTexto(v) === desdeUrl) || TODAS;
        if (esMarca) {
            setMarca(buscar(marcas));
            setCategoria(TODAS);
        } else if (id) {
            setCategoria(buscar(categorias));
            setMarca(TODAS);
        } else {
            setCategoria(TODAS);
            setMarca(TODAS);
        }
    }, [id, esMarca, categorias, marcas]);

    const filteredAndSortedItems = useMemo(() => {
        const filtrados = base.filter((item) =>
            (categoria === TODAS || item.categoria === categoria) &&
            (marca === TODAS || item.marca === marca)
        );
        return [...filtrados].sort((a, b) => {
            switch (sortBy) {
                case "precio-asc": return (a.precio || 0) - (b.precio || 0);
                case "precio-desc": return (b.precio || 0) - (a.precio || 0);
                case "nombre": return (a.nombre || '').localeCompare(b.nombre || '');
                case "nuevos": return (fechaAlta(b)?.getTime() || 0) - (fechaAlta(a)?.getTime() || 0);
                case "masvendidos":
                default:
                    return prioridadCategoria(a.categoria) - prioridadCategoria(b.categoria) || (b.masVendido === true) - (a.masVendido === true) || (a.nombre || '').localeCompare(b.nombre || '');
            }
        });
    }, [base, categoria, marca, sortBy]);

    // Ir a la grilla al llegar con una búsqueda o con el link "#productos" del footer
    useEffect(() => {
        if (loading) return;
        if (searchTerm || location.hash === "#productos") {
            const el = document.getElementById("productos");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [loading, searchTerm, location.hash]);

    const handleClearFilters = () => {
        setCategoria(TODAS);
        setMarca(TODAS);
        if (searchTerm || id || top || oferta) navigate("/");
    };

    const verProductos = () => {
        const el = document.getElementById("productos");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const getUserVisibleTitle = () => {
        if (isHomePage) return "Productos";
        if (id) return decodeURIComponent(id);
        if (titulo) return titulo;
        return "Productos";
    };

    const seoData = {
        title: categoryContent[currentCategory]?.title || '',
        description: categoryContent[currentCategory]?.description || ''
    };

    // Mosaico del hero desktop: va alternando creatinas y proteínas de Pitbull y Star Nutrition
    // (orden aleatorio en cada visita; las fotos que fallan se saltean)
    const candidatosHero = useMemo(() => {
        const marcasHero = ["pitbull", "star nutrition"];
        const lista = allProducts.filter((p) => {
            const cat = normalizarTexto(p.categoria);
            return p.img && marcasHero.includes(normalizarTexto(p.marca)) && (cat.startsWith("prote") || cat.includes("creatin"));
        });
        for (let i = lista.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lista[i], lista[j]] = [lista[j], lista[i]];
        }
        return lista;
    }, [allProducts]);
    const [turnoHero, setTurnoHero] = useState(0);
    const destacados = useMemo(() => {
        const sanos = candidatosHero.filter((p) => !fotosRotas.includes(p.id));
        if (sanos.length <= 2) return sanos;
        const i = (turnoHero * 2) % sanos.length;
        return [sanos[i], sanos[(i + 1) % sanos.length]];
    }, [candidatosHero, fotosRotas, turnoHero]);
    useEffect(() => {
        if (!isHomePage || candidatosHero.length <= 2) return undefined;
        const t = setInterval(() => setTurnoHero((n) => n + 1), 6000);
        return () => clearInterval(t);
    }, [isHomePage, candidatosHero.length]);
    const descartarFoto = (pid) => setFotosRotas((prev) => (prev.includes(pid) ? prev : [...prev, pid]));

    const contarCategoria = (op) => (op === TODAS ? base.length : base.filter((p) => p.categoria === op).length);
    const contarMarca = (op) => (op === TODAS ? base.length : base.filter((p) => p.marca === op).length);

    const conteo = (
        searchTerm ? (
            <button type="button" className="af-searchchip" onClick={() => navigate("/")}>
                "{searchTerm}" · {etiquetaCantidad(filteredAndSortedItems.length)}<PiX size={12} />
            </button>
        ) : (
            <span>{etiquetaCantidad(filteredAndSortedItems.length)}</span>
        )
    );

    const vacio = (
        <div className="af-empty">
            <span className="af-empty-title">No encontramos productos con esos filtros.</span>
            <span className="af-empty-sub">Escribinos y te conseguimos lo que buscás.</span>
            <button type="button" className="af-btn af-btn-primary" onClick={handleClearFilters}>Ver todos los productos</button>
        </div>
    );

    return (
        <main className="af-home">
            {id && seoData.title && (
                <Helmet>
                    <title>{seoData.title}</title>
                    <meta name="description" content={seoData.description} />
                </Helmet>
            )}

            {/* Modal del producto recomendado: aparece solo si hay una categoría en la URL */}
            {id && !esMarca && <CategoryModal category={id} />}

            {isHomePage && (
                <>
                    <section className="af-hero">
                        <div className="af-hero-inner">
                            <div className="af-hero-copy">
                                <span className="af-tag af-tag-outline af-hero-tag">Suplementos 100% originales</span>
                                <h1 className="af-hero-title">Entrená al fallo.<br /><span>Del resto nos ocupamos nosotros.</span></h1>
                                <p className="af-hero-text">ENA, Gentech, Gold Nutrition, Star, Xtrenght y Pitbull. Consultá stock y precio por WhatsApp y te respondemos al toque.</p>
                                <div className="af-hero-actions">
                                    <a className="af-btn af-btn-primary af-hero-wa" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                                        <FaWhatsapp size={20} />Comprar por WhatsApp
                                    </a>
                                    <button type="button" className="af-btn af-btn-secondary af-hero-ver" onClick={verProductos}>Ver productos</button>
                                </div>
                            </div>
                            <div className="af-hero-mosaic" aria-hidden={destacados.length === 0}>
                                {destacados[0] && (
                                    <Link key={destacados[0].id} to={`/item/${destacados[0].id}`} className="af-tile af-hero-tile af-hero-tile--big">
                                        <ProductPhoto key={destacados[0].id} img={destacados[0].img} marca={destacados[0].marca} nombre={destacados[0].nombre} pct={84} onFail={() => descartarFoto(destacados[0].id)} />
                                    </Link>
                                )}
                                {destacados[1] && (
                                    <Link key={destacados[1].id} to={`/item/${destacados[1].id}`} className="af-tile af-hero-tile">
                                        <ProductPhoto key={destacados[1].id} img={destacados[1].img} marca={destacados[1].marca} nombre={destacados[1].nombre} pct={82} onFail={() => descartarFoto(destacados[1].id)} />
                                    </Link>
                                )}
                                <div className="af-hero-brands">
                                    <span className="af-overline af-overline--soft">6 marcas oficiales</span>
                                    <span className="af-hero-brands-list">ENA · Gentech · Gold · Star · Xtrenght · Pitbull</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    <TrustStrip />
                </>
            )}

            <section id="productos" className="af-products">
                {/* Mobile y tablet: título, chips en dos filas y conteo */}
                <div className="af-products-head">
                    <h2 className="af-products-title">{getUserVisibleTitle()}</h2>
                    {id && seoData.description && <p className="af-products-desc">{seoData.description}</p>}
                    <Chips tipo="cat" opciones={categorias} activa={categoria} onPick={setCategoria} />
                    <Chips tipo="brand" opciones={marcas} activa={marca} onPick={setMarca} />
                    <div className="af-products-bar">
                        {conteo}
                        <FilterBar sortBy={sortBy} onSortChange={setSortBy} />
                    </div>
                </div>

                <div className="af-products-layout">
                    {/* Desktop: barra lateral fija con contadores */}
                    <aside className="af-side">
                        <ListaLateral titulo="Categoría" opciones={categorias} activa={categoria} onPick={setCategoria} contar={contarCategoria} />
                        <ListaLateral titulo="Marca" opciones={marcas} activa={marca} onPick={setMarca} contar={contarMarca} />
                    </aside>

                    <div className="af-products-main">
                        <div className="af-products-headd">
                            <h2 className="af-products-titled">{getUserVisibleTitle()}</h2>
                            <span className="af-products-count">{conteo}</span>
                            <FilterBar sortBy={sortBy} onSortChange={setSortBy} />
                        </div>
                        {id && seoData.description && <p className="af-products-descd">{seoData.description}</p>}

                        {loading ? (
                            <Loading />
                        ) : filteredAndSortedItems.length > 0 ? (
                            <ItemList items={filteredAndSortedItems} />
                        ) : (
                            vacio
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ItemListContainer;
