// import { useState } from "react";
// import { Link } from "react-router-dom";

// // Importar las imágenes desde src/img
// import creatinaImg from "../components/img/creatina.png";
// import proteinaImg from "../components/img/proteina.png";
// import vitaminasImg from "../components/img/vitaminas.png";
// import aminoacidosImg from "../components/img/aminoacidos.png";
// import magnesioImg from "../components/img/magnesio.png";
// import preentrenoImg from "../components/img/preentreno.png";
// import barrasproteicasImg from "../components/img/barrasproteicas.png";
// import ganadordepesoImg from "../components/img/ganadordepeso.png";

// const CategoryCards = () => {
//     const [touchStart, setTouchStart] = useState(0);
//     const [touchEnd, setTouchEnd] = useState(0);
//     const [currentCard, setCurrentCard] = useState(0);

//     // Datos de las categorías promocionales con imágenes importadas
//     const featuredCategories = [
//         {
//             id: "creatinas",
//             nombre: "Creatinas",
//             imagen: creatinaImg,
//             link: "/category/creatina"
//         },
//         {
//             id: "proteinas",
//             nombre: "Proteínas",
//             imagen: proteinaImg,
//             link: "/category/proteinas"
//         },
//         {
//             id: "vitaminas",
//             nombre: "Vitaminas",
//             imagen: vitaminasImg,
//             link: "/category/vitaminas"
//         },
//         {
//             id: "aminoacidos",
//             nombre: "Aminoácidos",
//             imagen: aminoacidosImg,
//             link: "/category/aminoacidos"
//         },
//         {
//             id: "magnesio",
//             nombre: "Magnesio",
//             imagen: magnesioImg,
//             link: "/category/magnesio"
//         },
//         {
//             id: "pre-entrenos",
//             nombre: "Pre-entrenos",
//             imagen: preentrenoImg,
//             link: "/category/preentreno"
//         },
//         {
//             id: "barras-proteicas",
//             nombre: "Barras Proteicas",
//             imagen: barrasproteicasImg,
//             link: "/category/barras proteicas"
//         },
//         {
//             id: "ganadordepeso",
//             nombre: "Ganador de Peso",
//             imagen: ganadordepesoImg,
//             link: "/category/ganadores de masa"
//         }
//     ];

//     // Handlers para el deslizamiento táctil
//     const handleTouchStart = (e) => {
//         setTouchStart(e.targetTouches[0].clientX);
//     };

//     const handleTouchMove = (e) => {
//         setTouchEnd(e.targetTouches[0].clientX);
//     };

//     const handleTouchEnd = () => {
//         if (touchStart - touchEnd > 50) {
//             // Deslizar a la izquierda - avanzar una tarjeta
//             setCurrentCard((prev) => 
//                 prev === featuredCategories.length - 1 ? 0 : prev + 1
//             );
//         }

//         if (touchStart - touchEnd < -50) {
//             // Deslizar a la derecha - retroceder una tarjeta
//             setCurrentCard((prev) => 
//                 prev === 0 ? featuredCategories.length - 1 : prev - 1
//             );
//         }
//     };

//     return (
//         <div className="category-cards-container mb-5">
//             <h2 className="text-center mb-4" style={{ 
//                 textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
//                 fontWeight: 'bold'
//             }}>
//                 Categorías Destacadas
//             </h2>
            
//             {/* Versión desktop - Grid */}
//             <div className="d-none d-md-block">
//                 <div className="row g-4">
//                     {featuredCategories.map(categoria => (
//                         <div key={categoria.id} className="col-md-3 col-6">
//                             <Link 
//                                 to={categoria.link} 
//                                 className="text-decoration-none"
//                             >
//                                 <div className="category-card h-100">
//                                     <div 
//                                         className="category-image position-relative rounded-3 overflow-hidden"
//                                         style={{
//                                             height: "200px",
//                                             backgroundImage: `url(${categoria.imagen})`,
//                                             backgroundSize: "cover",
//                                             backgroundPosition: "center"
//                                         }}
//                                     >
//                                         <div className="category-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end">
//                                             <div className="w-100 p-3 text-white" style={{
//                                                 background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)"
//                                             }}>
//                                                 <h5 className="mb-0 text-center" style={{
//                                                     textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//                                                     fontWeight: '600'
//                                                 }}>
//                                                     {categoria.nombre}
//                                                 </h5>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </Link>
//                         </div>
//                     ))}
//                 </div>
//             </div>
            
//             {/* Versión mobile - Carousel con 2 tarjetas visibles */}
//             <div className="d-md-none">
//                 <div 
//                     className="category-carousel overflow-hidden position-relative"
//                     onTouchStart={handleTouchStart}
//                     onTouchMove={handleTouchMove}
//                     onTouchEnd={handleTouchEnd}
//                 >
//                     <div 
//                         className="d-flex transition-transform"
//                         style={{ 
//                             transform: `translateX(-${currentCard * 50}%)`,
//                             transition: 'transform 0.3s ease'
//                         }}
//                     >
//                         {featuredCategories.map((categoria, index) => (
//                             <div 
//                                 key={categoria.id} 
//                                 className="flex-shrink-0 w-50 px-2"
//                                 style={{ width: '50%' }}
//                             >
//                                 <Link to={categoria.link} className="text-decoration-none">
//                                     <div 
//                                         className="category-image position-relative rounded-3 overflow-hidden"
//                                         style={{
//                                             height: "150px",
//                                             backgroundImage: `url(${categoria.imagen})`,
//                                             backgroundSize: "cover",
//                                             backgroundPosition: "center"
//                                         }}
//                                     >
//                                         <div className="category-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end">
//                                             <div className="w-100 p-2 text-white" style={{
//                                                 background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)"
//                                             }}>
//                                                 <h6 className="mb-0 text-center" style={{
//                                                     textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
//                                                     fontWeight: '600'
//                                                 }}>
//                                                     {categoria.nombre}
//                                                 </h6>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </Link>
//                             </div>
//                         ))}
//                     </div>
                    
//                     {/* Indicadores */}
//                     <div className="d-flex justify-content-center mt-3">
//                         {featuredCategories.map((_, index) => (
//                             <button
//                                 key={index}
//                                 className={`btn p-0 mx-1 ${currentCard === index ? 'text-primary' : 'text-muted'}`}
//                                 onClick={() => setCurrentCard(index)}
//                                 aria-label={`Ir a la categoría ${index + 1}`}
//                                 style={{ fontSize: '0.6rem' }}
//                             >
//                                 ●
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CategoryCards;

import { useState } from "react";
import { Link } from "react-router-dom";

// Importar las imágenes desde src/img
import creatinaImg from "../components/img/creatina.png";
import proteinaImg from "../components/img/proteina.png";
import vitaminasImg from "../components/img/vitaminas.png";
import aminoacidosImg from "../components/img/aminoacidos.png";
import magnesioImg from "../components/img/magnesio.png";
import preentrenoImg from "../components/img/preentreno.png";
import barrasproteicasImg from "../components/img/barrasproteicas.png";
import ganadordepesoImg from "../components/img/ganadordepeso.png";

const CategoryCards = () => {
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [currentCard, setCurrentCard] = useState(0);

    // Datos de las categorías promocionales con imágenes importadas
    const featuredCategories = [
        {
            id: "creatinas",
            nombre: "Creatinas",
            imagen: creatinaImg,
            link: "/category/creatina"
        },
        {
            id: "proteinas",
            nombre: "Proteínas",
            imagen: proteinaImg,
            link: "/category/proteinas"
        },
        {
            id: "vitaminas",
            nombre: "Vitaminas",
            imagen: vitaminasImg,
            link: "/category/vitaminas"
        },
        {
            id: "aminoacidos",
            nombre: "Aminoácidos",
            imagen: aminoacidosImg,
            link: "/category/aminoacidos"
        },
        {
            id: "magnesio",
            nombre: "Magnesio",
            imagen: magnesioImg,
            link: "/category/magnesio"
        },
        {
            id: "pre-entrenos",
            nombre: "Pre-entrenos",
            imagen: preentrenoImg,
            link: "/category/preentreno"
        },
        {
            id: "barras-proteicas",
            nombre: "Barras Proteicas",
            imagen: barrasproteicasImg,
            link: "/category/barras proteicas"
        },
        {
            id: "ganadordepeso",
            nombre: "Ganador de Peso",
            imagen: ganadordepesoImg,
            link: "/category/ganadores de masa"
        }
    ];

    // Handlers para el deslizamiento táctil
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 50) {
            // Deslizar a la izquierda - avanzar una tarjeta
            setCurrentCard((prev) =>
                prev === featuredCategories.length - 1 ? 0 : prev + 1
            );
        }

        if (touchStart - touchEnd < -50) {
            // Deslizar a la derecha - retroceder una tarjeta
            setCurrentCard((prev) =>
                prev === 0 ? featuredCategories.length - 1 : prev - 1
            );
        }
    };

    return (
        <div className="category-cards-container mb-5">
            <h2 className="text-center mb-4" style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                fontWeight: 'bold'
            }}>
                Categorías Destacadas
            </h2>

            {/* Versión desktop - Grid */}
            <div className="d-none d-md-block">
                <div className="row g-4">
                    {featuredCategories.map(categoria => (
                        <div key={categoria.id} className="col-md-3 col-6">
                            <Link
                                to={categoria.link}
                                className="text-decoration-none"
                            >
                                <div className="category-card h-100" role="img" aria-label={`Imagen de la categoría: ${categoria.nombre}`}>
                                    <div
                                        className="category-image position-relative rounded-3 overflow-hidden"
                                        style={{
                                            height: "200px",
                                            backgroundImage: `url(${categoria.imagen})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center"
                                        }}
                                    >
                                        <div className="category-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end">
                                            <div className="w-100 p-3 text-white" style={{
                                                background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)"
                                            }}>
                                                <h5 className="mb-0 text-center" style={{
                                                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                                    fontWeight: '600'
                                                }}>
                                                    {categoria.nombre}
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Versión mobile - Carousel con 2 tarjetas visibles */}
            <div className="d-md-none">
                <div
                    className="category-carousel overflow-hidden position-relative"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className="d-flex transition-transform"
                        style={{
                            transform: `translateX(-${currentCard * 50}%)`,
                            transition: 'transform 0.3s ease'
                        }}
                    >
                        {featuredCategories.map((categoria, index) => (
                            <div
                                key={categoria.id}
                                className="flex-shrink-0 w-50 px-2"
                                style={{ width: '50%' }}
                            >
                                <Link to={categoria.link} className="text-decoration-none">
                                    <div className="category-image position-relative rounded-3 overflow-hidden" role="img" aria-label={`Imagen de la categoría: ${categoria.nombre}`}
                                        style={{
                                            height: "150px",
                                            backgroundImage: `url(${categoria.imagen})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center"
                                        }}
                                    >
                                        <div className="category-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end">
                                            <div className="w-100 p-2 text-white" style={{
                                                background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)"
                                            }}>
                                                <h6 className="mb-0 text-center" style={{
                                                    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                                                    fontWeight: '600'
                                                }}>
                                                    {categoria.nombre}
                                                </h6>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Indicadores */}
                    <div className="d-flex justify-content-center mt-3">
                        {featuredCategories.map((_, index) => (
                            <button
                                key={index}
                                className={`btn p-0 mx-1 ${currentCard === index ? 'text-primary' : 'text-muted'}`}
                                onClick={() => setCurrentCard(index)}
                                aria-label={`Ir a la categoría ${index + 1}`}
                                style={{ fontSize: '0.6rem' }}
                            >
                                ●
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryCards;