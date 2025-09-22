// import React, { useState } from "react";
// import { getFirestore, collection, doc, setDoc, updateDoc, getDocs } from "firebase/firestore";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFileExcel, faUpload, faDownload, faSpinner, faCheckCircle, faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import * as XLSX from "xlsx";
// import { Link } from "react-router-dom";

// const ExcelManager = () => {
//     const [isLoading, setIsLoading] = useState(false);
//     const [isExporting, setIsExporting] = useState(false);
//     const [uploadStatus, setUploadStatus] = useState({
//         success: 0,
//         errors: 0,
//         newProducts: 0,
//         updatedProducts: 0,
//         messages: []
//     });
//     const [fileName, setFileName] = useState("");

//     // Función para exportar productos a Excel
//     const exportToExcel = async () => {
//         setIsExporting(true);
//         try {
//             const db = getFirestore();
//             const productsCollection = collection(db, "fragancias");
//             const productsSnapshot = await getDocs(productsCollection);
            
//             const productsData = productsSnapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             }));

//             // Crear workbook y worksheet
//             const wb = XLSX.utils.book_new();
//             const ws = XLSX.utils.json_to_sheet(productsData.map(product => ({
//                 id: product.id,
//                 nombre: product.nombre,
//                 marca: product.marca,
//                 precio: product.precio,
//                 stock: product.stock || 0,
//                 categoria: product.categoria || "",
//                 presentacion: product.presentacion || "",
//                 img: product.img || ""
//             })));

//             // Añadir worksheet al workbook
//             XLSX.utils.book_append_sheet(wb, ws, "Productos");

//             // Descargar archivo
//             const fileName = `productos_${new Date().toISOString().split('T')[0]}.xlsx`;
//             XLSX.writeFile(wb, fileName);
            
//             setUploadStatus(prev => ({
//                 ...prev,
//                 messages: [...prev.messages, `Exportación completada: ${productsData.length} productos exportados`]
//             }));
//         } catch (error) {
//             console.error("Error al exportar a Excel:", error);
//             setUploadStatus(prev => ({
//                 ...prev,
//                 errors: prev.errors + 1,
//                 messages: [...prev.messages, `Error en exportación: ${error.message}`]
//             }));
//         }
//         setIsExporting(false);
//     };

//     // Función para manejar la carga del archivo Excel
//     const handleFileUpload = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         setFileName(file.name);
//         setIsLoading(true);
//         setUploadStatus({
//             success: 0,
//             errors: 0,
//             newProducts: 0,
//             updatedProducts: 0,
//             messages: []
//         });

//         const reader = new FileReader();
//         reader.onload = (event) => {
//             try {
//                 const data = new Uint8Array(event.target.result);
//                 const workbook = XLSX.read(data, { type: 'array' });
                
//                 // Suponiendo que la primera hoja contiene los datos
//                 const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//                 const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
//                 processExcelData(jsonData);
//             } catch (error) {
//                 console.error("Error al procesar el archivo Excel:", error);
//                 setUploadStatus(prev => ({
//                     ...prev,
//                     errors: prev.errors + 1,
//                     messages: [...prev.messages, `Error: ${error.message}`]
//                 }));
//                 setIsLoading(false);
//             }
//         };
//         reader.readAsArrayBuffer(file);
//     };

//     // Procesar los datos del Excel
//     const processExcelData = async (excelData) => {
//         const db = getFirestore();
//         const productsCollection = collection(db, "fragancias");
        
//         try {
//             // Obtener productos existentes
//             const existingProductsSnapshot = await getDocs(productsCollection);
//             const existingProducts = {};
            
//             existingProductsSnapshot.forEach(doc => {
//                 existingProducts[doc.id] = { id: doc.id, ...doc.data() };
//             });

//             let newProductsCount = 0;
//             let updatedProductsCount = 0;
//             let errorCount = 0;
//             const messages = [];

//             // Procesar cada fila del Excel
//             for (const row of excelData) {
//                 try {
//                     // Validar campos obligatorios
//                     if (!row.nombre || !row.marca || row.precio === undefined) {
//                         errorCount++;
//                         messages.push(`Fila omitida: falta nombre, marca o precio`);
//                         continue;
//                     }

//                     // Normalizar el precio (convertir coma a punto y asegurar que sea número)
//                     const precioNormalizado = typeof row.precio === 'string' 
//                         ? parseFloat(row.precio.replace(',', '.')) 
//                         : Number(row.precio);

//                     if (isNaN(precioNormalizado)) {
//                         errorCount++;
//                         messages.push(`Precio inválido para: ${row.nombre}`);
//                         continue;
//                     }

//                     // Buscar producto por ID o por nombre+marca (si no hay ID)
//                     let productId = row.id;
//                     let productToUpdate = productId ? existingProducts[productId] : null;
                    
//                     // Si no encontramos por ID, buscamos por nombre y marca
//                     if (!productToUpdate) {
//                         const matchingProduct = Object.values(existingProducts).find(
//                             p => p.nombre === row.nombre && p.marca === row.marca
//                         );
                        
//                         if (matchingProduct) {
//                             productId = matchingProduct.id;
//                             productToUpdate = matchingProduct;
//                         }
//                     }

//                     if (productToUpdate) {
//                         // Actualizar producto existente
//                         const productRef = doc(productsCollection, productId);
//                         const updateData = {};
                        
//                         // Solo actualizar campos que existen en el Excel y son diferentes
//                         if (precioNormalizado !== productToUpdate.precio) {
//                             updateData.precio = precioNormalizado;
//                         }
                        
//                         if (row.stock !== undefined && row.stock !== productToUpdate.stock) {
//                             updateData.stock = Number(row.stock);
//                         }
                        
//                         if (row.categoria && row.categoria !== productToUpdate.categoria) {
//                             updateData.categoria = row.categoria;
//                         }
                        
//                         if (row.presentacion && row.presentacion !== productToUpdate.presentacion) {
//                             updateData.presentacion = row.presentacion;
//                         }
                        
//                         if (Object.keys(updateData).length > 0) {
//                             await updateDoc(productRef, updateData);
//                             updatedProductsCount++;
//                             messages.push(`Actualizado: ${productToUpdate.marca} ${productToUpdate.nombre}`);
//                         } else {
//                             messages.push(`Sin cambios: ${productToUpdate.marca} ${productToUpdate.nombre}`);
//                         }
//                     } else {
//                         // Crear nuevo producto
//                         const newProductRef = doc(productsCollection);
//                         const newProductData = {
//                             nombre: row.nombre,
//                             marca: row.marca,
//                             precio: precioNormalizado,
//                             stock: row.stock !== undefined ? Number(row.stock) : 0,
//                             categoria: row.categoria || "Suplementos",
//                             presentacion: row.presentacion || "",
//                             img: row.img || "/img/default-product.png"
//                         };
                        
//                         await setDoc(newProductRef, newProductData);
//                         newProductsCount++;
//                         messages.push(`Nuevo producto: ${row.marca} ${row.nombre}`);
//                     }
//                 } catch (error) {
//                     errorCount++;
//                     messages.push(`Error procesando fila: ${error.message}`);
//                     console.error("Error procesando fila:", error);
//                 }
//             }

//             setUploadStatus({
//                 success: newProductsCount + updatedProductsCount,
//                 errors: errorCount,
//                 newProducts: newProductsCount,
//                 updatedProducts: updatedProductsCount,
//                 messages: messages
//             });
            
//         } catch (error) {
//             console.error("Error general al procesar datos:", error);
//             setUploadStatus(prev => ({
//                 ...prev,
//                 errors: prev.errors + 1,
//                 messages: [...prev.messages, `Error general: ${error.message}`]
//             }));
//         }
        
//         setIsLoading(false);
//     };

//     return (
//         <div className="container py-5" style={{ color: 'var(--text-primary)' }}>
//             {/* Botón para volver al administrador */}
//             <div className="row mb-4">
//                 <div className="col-12">
//                     <Link to="/admin" className="btn btn-outline-primary mb-3">
//                         <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
//                         Volver al Administrador
//                     </Link>
//                     <h1 style={{ color: 'var(--text-primary)' }}>
//                         <FontAwesomeIcon icon={faFileExcel} className="me-2" />
//                         Gestión de Productos con Excel
//                     </h1>
//                     <p className="text-muted">Exporta e importa productos desde archivos Excel</p>
//                 </div>
//             </div>

//             <div className="row">
//                 <div className="col-12">
//                     <div className="card" style={{ 
//                         background: 'var(--bg-card)', 
//                         borderColor: 'var(--border-color)' 
//                     }}>
//                         <div className="card-header" style={{ 
//                             background: 'var(--bg-secondary)', 
//                             color: 'var(--text-primary)',
//                             borderColor: 'var(--border-color)'
//                         }}>
//                             <h5 className="mb-0">
//                                 Herramientas de Excel
//                             </h5>
//                         </div>
//                         <div className="card-body">
//                             <div className="row">
//                                 <div className="col-md-6 mb-3">
//                                     <div className="d-grid">
//                                         <button 
//                                             className="btn btn-success"
//                                             onClick={exportToExcel}
//                                             disabled={isExporting}
//                                             style={{ 
//                                                 background: 'var(--accent-color)', 
//                                                 borderColor: 'var(--accent-color)',
//                                                 color: 'white'
//                                             }}
//                                         >
//                                             {isExporting ? (
//                                                 <>
//                                                     <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
//                                                     Exportando...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <FontAwesomeIcon icon={faDownload} className="me-2" />
//                                                     Exportar a Excel
//                                                 </>
//                                             )}
//                                         </button>
//                                     </div>
//                                     <div className="form-text text-center" style={{ color: 'var(--text-secondary)' }}>
//                                         Descarga todos tus productos a un archivo Excel
//                                     </div>
//                                 </div>
                                
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="excelFile" className="form-label" style={{ color: 'var(--text-primary)' }}>
//                                         Importar desde Excel
//                                     </label>
//                                     <input 
//                                         type="file" 
//                                         className="form-control" 
//                                         id="excelFile"
//                                         accept=".xlsx, .xls"
//                                         onChange={handleFileUpload}
//                                         disabled={isLoading}
//                                         style={{ 
//                                             background: 'var(--bg-secondary)', 
//                                             color: 'var(--text-primary)',
//                                             borderColor: 'var(--border-color)'
//                                         }}
//                                     />
//                                     <div className="form-text" style={{ color: 'var(--text-secondary)' }}>
//                                         Actualiza precios y agrega nuevos productos
//                                     </div>
//                                 </div>
//                             </div>

//                             {fileName && (
//                                 <div className="alert alert-info py-2 mb-3" style={{ 
//                                     background: 'rgba(23, 162, 184, 0.2)', 
//                                     borderColor: 'var(--border-color)',
//                                     color: 'var(--text-primary)'
//                                 }}>
//                                     <small>
//                                         Archivo seleccionado: <strong>{fileName}</strong>
//                                     </small>
//                                 </div>
//                             )}

//                             {(isLoading || isExporting) && (
//                                 <div className="text-center my-3">
//                                     <FontAwesomeIcon icon={faSpinner} spin size="2x" style={{ color: 'var(--accent-color)' }} />
//                                     <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
//                                         {isExporting ? 'Exportando datos...' : 'Procesando archivo...'}
//                                     </p>
//                                 </div>
//                             )}

//                             {(uploadStatus.success > 0 || uploadStatus.errors > 0) && !isLoading && (
//                                 <div className="mt-3">
//                                     <h6 style={{ color: 'var(--text-primary)' }}>Resultados de la importación:</h6>
                                    
//                                     {uploadStatus.success > 0 && (
//                                         <div className="alert alert-success py-2" style={{ 
//                                             background: 'rgba(40, 167, 69, 0.2)', 
//                                             borderColor: 'var(--border-color)',
//                                             color: 'var(--text-primary)'
//                                         }}>
//                                             <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
//                                             <strong>Éxito:</strong> {uploadStatus.success} productos procesados correctamente
//                                             ({uploadStatus.newProducts} nuevos, {uploadStatus.updatedProducts} actualizados)
//                                         </div>
//                                     )}
                                    
//                                     {uploadStatus.errors > 0 && (
//                                         <div className="alert alert-warning py-2" style={{ 
//                                             background: 'rgba(255, 193, 7, 0.2)', 
//                                             borderColor: 'var(--border-color)',
//                                             color: 'var(--text-primary)'
//                                         }}>
//                                             <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
//                                             <strong>Errores:</strong> {uploadStatus.errors} problemas durante la importación
//                                         </div>
//                                     )}
                                    
//                                     {uploadStatus.messages.length > 0 && (
//                                         <details className="mt-2">
//                                             <summary style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
//                                                 Ver detalles de la operación
//                                             </summary>
//                                             <div className="mt-2 p-2" style={{ 
//                                                 background: 'var(--bg-secondary)', 
//                                                 borderRadius: '4px',
//                                                 maxHeight: '200px',
//                                                 overflowY: 'auto'
//                                             }}>
//                                                 {uploadStatus.messages.map((msg, index) => (
//                                                     <div key={index} className="small mb-1" style={{ color: 'var(--text-secondary)' }}>
//                                                         {msg}
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </details>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ExcelManager;

// import React, { useState } from "react";
// import { getFirestore, collection, doc, setDoc, updateDoc, getDocs } from "firebase/firestore";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFileExcel, faUpload, faDownload, faSpinner, faCheckCircle, faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import * as XLSX from "xlsx";
// import { Link } from "react-router-dom";

// const ExcelManager = () => {
//     const [isLoading, setIsLoading] = useState(false);
//     const [isExporting, setIsExporting] = useState(false);
//     const [uploadStatus, setUploadStatus] = useState({
//         success: 0,
//         errors: 0,
//         newProducts: 0,
//         updatedProducts: 0,
//         messages: []
//     });
//     const [fileName, setFileName] = useState("");

//     // Función para exportar productos a Excel
//     const exportToExcel = async () => {
//         setIsExporting(true);
//         try {
//             const db = getFirestore();
//             const productsCollection = collection(db, "fragancias");
//             const productsSnapshot = await getDocs(productsCollection);
            
//             const productsData = productsSnapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             }));

//             // Crear workbook y worksheet
//             const wb = XLSX.utils.book_new();
//             const ws = XLSX.utils.json_to_sheet(productsData.map(product => ({
//                 id: product.id,
//                 nombre: product.nombre,
//                 marca: product.marca,
//                 precio_costo: product.precio_costo || 0,
//                 stock: product.stock || 0,
//                 categoria: product.categoria || "",
//                 presentacion: product.presentacion || "",
//                 ganancia: product.ganancia || 1.3,
//                 img: product.img || ""
//             })));

//             // Añadir worksheet al workbook
//             XLSX.utils.book_append_sheet(wb, ws, "Productos");

//             // Descargar archivo
//             const fileName = `productos_costo_${new Date().toISOString().split('T')[0]}.xlsx`;
//             XLSX.writeFile(wb, fileName);
            
//             setUploadStatus(prev => ({
//                 ...prev,
//                 messages: [...prev.messages, `Exportación completada: ${productsData.length} productos exportados`]
//             }));
//         } catch (error) {
//             console.error("Error al exportar a Excel:", error);
//             setUploadStatus(prev => ({
//                 ...prev,
//                 errors: prev.errors + 1,
//                 messages: [...prev.messages, `Error en exportación: ${error.message}`]
//             }));
//         }
//         setIsExporting(false);
//     };

//     // Función para manejar la carga del archivo Excel
//     const handleFileUpload = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         setFileName(file.name);
//         setIsLoading(true);
//         setUploadStatus({
//             success: 0,
//             errors: 0,
//             newProducts: 0,
//             updatedProducts: 0,
//             messages: []
//         });

//         const reader = new FileReader();
//         reader.onload = (event) => {
//             try {
//                 const data = new Uint8Array(event.target.result);
//                 const workbook = XLSX.read(data, { type: 'array' });
                
//                 // Suponiendo que la primera hoja contiene los datos
//                 const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//                 const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
//                 processExcelData(jsonData);
//             } catch (error) {
//                 console.error("Error al procesar el archivo Excel:", error);
//                 setUploadStatus(prev => ({
//                     ...prev,
//                     errors: prev.errors + 1,
//                     messages: [...prev.messages, `Error: ${error.message}`]
//                 }));
//                 setIsLoading(false);
//             }
//         };
//         reader.readAsArrayBuffer(file);
//     };

//     // Procesar los datos del Excel - ACTUALIZA PRECIO_COSTO Y RECALCULA PRECIO
//     const processExcelData = async (excelData) => {
//         const db = getFirestore();
//         const productsCollection = collection(db, "fragancias");
        
//         try {
//             // Obtener productos existentes
//             const existingProductsSnapshot = await getDocs(productsCollection);
//             const existingProducts = {};
            
//             existingProductsSnapshot.forEach(doc => {
//                 existingProducts[doc.id] = { id: doc.id, ...doc.data() };
//             });

//             let newProductsCount = 0;
//             let updatedProductsCount = 0;
//             let errorCount = 0;
//             const messages = [];

//             // Procesar cada fila del Excel
//             for (const row of excelData) {
//                 try {
//                     // Validar campos obligatorios
//                     if (!row.nombre || !row.marca || row.precio_costo === undefined) {
//                         errorCount++;
//                         messages.push(`Fila omitida: falta nombre, marca o precio_costo`);
//                         continue;
//                     }

//                     // Normalizar el precio_costo (convertir coma a punto y asegurar que sea número)
//                     const precioCostoNormalizado = typeof row.precio_costo === 'string' 
//                         ? parseFloat(row.precio_costo.replace(',', '.')) 
//                         : Number(row.precio_costo);

//                     if (isNaN(precioCostoNormalizado)) {
//                         errorCount++;
//                         messages.push(`Precio costo inválido para: ${row.nombre}`);
//                         continue;
//                     }

//                     // Buscar producto por ID o por nombre+marca (si no hay ID)
//                     let productId = row.id;
//                     let productToUpdate = productId ? existingProducts[productId] : null;
                    
//                     // Si no encontramos por ID, buscamos por nombre y marca
//                     if (!productToUpdate) {
//                         const matchingProduct = Object.values(existingProducts).find(
//                             p => p.nombre === row.nombre && p.marca === row.marca
//                         );
                        
//                         if (matchingProduct) {
//                             productId = matchingProduct.id;
//                             productToUpdate = matchingProduct;
//                         }
//                     }

//                     if (productToUpdate) {
//                         // Calcular el nuevo precio de venta basado en la ganancia existente
//                         const ganancia = productToUpdate.ganancia || 1.3;
//                         const nuevoPrecioVenta = Math.round(precioCostoNormalizado * ganancia);
                        
//                         // Solo actualizamos si el precio_costo cambió
//                         if (precioCostoNormalizado !== productToUpdate.precio_costo) {
//                             const productRef = doc(productsCollection, productId);
//                             await updateDoc(productRef, {
//                                 precio_costo: precioCostoNormalizado,
//                                 precio: nuevoPrecioVenta
//                             });
//                             updatedProductsCount++;
//                             messages.push(`Precios actualizados: ${productToUpdate.marca} ${productToUpdate.nombre} - Costo: $${precioCostoNormalizado}, Venta: $${nuevoPrecioVenta} (Ganancia: ${ganancia}x)`);
//                         } else {
//                             messages.push(`Sin cambios: ${productToUpdate.marca} ${productToUpdate.nombre} - Precio igual`);
//                         }
//                     } else {
//                         // Opcional: Crear nuevo producto con ganancia por defecto
//                         const gananciaDefault = 1.3;
//                         const precioVentaDefault = Math.round(precioCostoNormalizado * gananciaDefault);
                        
//                         const newProductRef = doc(productsCollection);
//                         const newProductData = {
//                             nombre: row.nombre,
//                             marca: row.marca,
//                             precio_costo: precioCostoNormalizado,
//                             precio: precioVentaDefault,
//                             stock: row.stock !== undefined ? Number(row.stock) : 0,
//                             categoria: row.categoria || "Suplementos",
//                             presentacion: row.presentacion || "",
//                             ganancia: gananciaDefault,
//                             img: row.img || "/img/default-product.png"
//                         };
                        
//                         await setDoc(newProductRef, newProductData);
//                         newProductsCount++;
//                         messages.push(`Nuevo producto: ${row.marca} ${row.nombre} - Costo: $${precioCostoNormalizado}, Venta: $${precioVentaDefault}`);
//                     }
//                 } catch (error) {
//                     errorCount++;
//                     messages.push(`Error procesando fila: ${error.message}`);
//                     console.error("Error procesando fila:", error);
//                 }
//             }

//             setUploadStatus({
//                 success: newProductsCount + updatedProductsCount,
//                 errors: errorCount,
//                 newProducts: newProductsCount,
//                 updatedProducts: updatedProductsCount,
//                 messages: messages
//             });
            
//         } catch (error) {
//             console.error("Error general al procesar datos:", error);
//             setUploadStatus(prev => ({
//                 ...prev,
//                 errors: prev.errors + 1,
//                 messages: [...prev.messages, `Error general: ${error.message}`]
//             }));
//         }
        
//         setIsLoading(false);
//     };

//     return (
//         <div className="container py-5" style={{ color: 'var(--text-primary)' }}>
//             {/* Botón para volver al administrador */}
//             <div className="row mb-4">
//                 <div className="col-12">
//                     <Link to="/admin" className="btn btn-outline-primary mb-3">
//                         <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
//                         Volver al Administrador
//                     </Link>
//                     <h1 style={{ color: 'var(--text-primary)' }}>
//                         <FontAwesomeIcon icon={faFileExcel} className="me-2" />
//                         Gestión de Precios de Costo con Excel
//                     </h1>
//                     <p className="text-muted">Exporta e importa precios de costo desde archivos Excel</p>
//                 </div>
//             </div>

//             <div className="row">
//                 <div className="col-12">
//                     <div className="card" style={{ 
//                         background: 'var(--bg-card)', 
//                         borderColor: 'var(--border-color)' 
//                     }}>
//                         <div className="card-header" style={{ 
//                             background: 'var(--bg-secondary)', 
//                             color: 'var(--text-primary)',
//                             borderColor: 'var(--border-color)'
//                         }}>
//                             <h5 className="mb-0">
//                                 Herramientas de Excel - Precios de Costo
//                             </h5>
//                         </div>
//                         <div className="card-body">
//                             <div className="row">
//                                 <div className="col-md-6 mb-3">
//                                     <div className="d-grid">
//                                         <button 
//                                             className="btn btn-success"
//                                             onClick={exportToExcel}
//                                             disabled={isExporting}
//                                             style={{ 
//                                                 background: 'var(--accent-color)', 
//                                                 borderColor: 'var(--accent-color)',
//                                                 color: 'white'
//                                             }}
//                                         >
//                                             {isExporting ? (
//                                                 <>
//                                                     <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
//                                                     Exportando...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <FontAwesomeIcon icon={faDownload} className="me-2" />
//                                                     Exportar Precios de Costo
//                                                 </>
//                                             )}
//                                         </button>
//                                     </div>
//                                     <div className="form-text text-center" style={{ color: 'var(--text-secondary)' }}>
//                                         Descarga precios de costo a un archivo Excel
//                                     </div>
//                                 </div>
                                
//                                 <div className="col-md-6 mb-3">
//                                     <label htmlFor="excelFile" className="form-label" style={{ color: 'var(--text-primary)' }}>
//                                         Importar Precios de Costo
//                                     </label>
//                                     <input 
//                                         type="file" 
//                                         className="form-control" 
//                                         id="excelFile"
//                                         accept=".xlsx, .xls"
//                                         onChange={handleFileUpload}
//                                         disabled={isLoading}
//                                         style={{ 
//                                             background: 'var(--bg-secondary)', 
//                                             color: 'var(--text-primary)',
//                                             borderColor: 'var(--border-color)'
//                                         }}
//                                     />
//                                     <div className="form-text" style={{ color: 'var(--text-secondary)' }}>
//                                         Actualiza precios de costo (se recalculará el precio de venta automáticamente)
//                                     </div>
//                                 </div>
//                             </div>

//                             {fileName && (
//                                 <div className="alert alert-info py-2 mb-3" style={{ 
//                                     background: 'rgba(23, 162, 184, 0.2)', 
//                                     borderColor: 'var(--border-color)',
//                                     color: 'var(--text-primary)'
//                                 }}>
//                                     <small>
//                                         Archivo seleccionado: <strong>{fileName}</strong>
//                                     </small>
//                                 </div>
//                             )}

//                             {(isLoading || isExporting) && (
//                                 <div className="text-center my-3">
//                                     <FontAwesomeIcon icon={faSpinner} spin size="2x" style={{ color: 'var(--accent-color)' }} />
//                                     <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
//                                         {isExporting ? 'Exportando datos...' : 'Procesando archivo...'}
//                                     </p>
//                                 </div>
//                             )}

//                             {(uploadStatus.success > 0 || uploadStatus.errors > 0) && !isLoading && (
//                                 <div className="mt-3">
//                                     <h6 style={{ color: 'var(--text-primary)' }}>Resultados de la importación:</h6>
                                    
//                                     {uploadStatus.success > 0 && (
//                                         <div className="alert alert-success py-2" style={{ 
//                                             background: 'rgba(40, 167, 69, 0.2)', 
//                                             borderColor: 'var(--border-color)',
//                                             color: 'var(--text-primary)'
//                                         }}>
//                                             <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
//                                             <strong>Éxito:</strong> {uploadStatus.success} productos procesados correctamente
//                                             ({uploadStatus.newProducts} nuevos, {uploadStatus.updatedProducts} actualizados)
//                                         </div>
//                                     )}
                                    
//                                     {uploadStatus.errors > 0 && (
//                                         <div className="alert alert-warning py-2" style={{ 
//                                             background: 'rgba(255, 193, 7, 0.2)', 
//                                             borderColor: 'var(--border-color)',
//                                             color: 'var(--text-primary)'
//                                         }}>
//                                             <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
//                                             <strong>Errores:</strong> {uploadStatus.errors} problemas durante la importación
//                                         </div>
//                                     )}
                                    
//                                     {uploadStatus.messages.length > 0 && (
//                                         <details className="mt-2">
//                                             <summary style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
//                                                 Ver detalles de la operación
//                                             </summary>
//                                             <div className="mt-2 p-2" style={{ 
//                                                 background: 'var(--bg-secondary)', 
//                                                 borderRadius: '4px',
//                                                 maxHeight: '200px',
//                                                 overflowY: 'auto'
//                                             }}>
//                                                 {uploadStatus.messages.map((msg, index) => (
//                                                     <div key={index} className="small mb-1" style={{ color: 'var(--text-secondary)' }}>
//                                                         {msg}
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </details>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ExcelManager;

import React, { useState } from "react";
import { getFirestore, collection, doc, setDoc, updateDoc, getDocs } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faUpload, faDownload, faSpinner, faCheckCircle, faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const ExcelManager = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({
        success: 0,
        errors: 0,
        newProducts: 0,
        updatedProducts: 0,
        messages: []
    });
    const [fileName, setFileName] = useState("");

    // Función para exportar productos a Excel
    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const db = getFirestore();
            const productsCollection = collection(db, "fragancias");
            const productsSnapshot = await getDocs(productsCollection);
            
            const productsData = productsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Crear workbook y worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(productsData.map(product => ({
                id: product.id,
                nombre: product.nombre,
                marca: product.marca,
                precio_costo: product.precio_costo || 0,
                stock: product.stock || 0,
                categoria: product.categoria || "",
                presentacion: product.presentacion || "",
                ganancia: product.ganancia || 1.3,
                img: product.img || ""
            })));

            // Añadir worksheet al workbook
            XLSX.utils.book_append_sheet(wb, ws, "Productos");

            // Descargar archivo
            const fileName = `productos_costo_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            setUploadStatus(prev => ({
                ...prev,
                messages: [...prev.messages, `Exportación completada: ${productsData.length} productos exportados`]
            }));
        } catch (error) {
            console.error("Error al exportar a Excel:", error);
            setUploadStatus(prev => ({
                ...prev,
                errors: prev.errors + 1,
                messages: [...prev.messages, `Error en exportación: ${error.message}`]
            }));
        }
        setIsExporting(false);
    };

    // Función para manejar la carga del archivo Excel
    const handleFileUpload = (e) => {
        console.log("Evento de archivo disparado");
        
        const file = e.target.files[0];
        if (!file) {
            console.log("No se seleccionó ningún archivo");
            return;
        }

        // Reinicia el input para permitir cargar el mismo archivo otra vez
        e.target.value = null;

        console.log("Archivo a procesar:", file.name, file.type, file.size);
        
        setFileName(file.name);
        setIsLoading(true);
        setUploadStatus({
            success: 0,
            errors: 0,
            newProducts: 0,
            updatedProducts: 0,
            messages: []
        });

        const reader = new FileReader();
        
        reader.onload = (event) => {
            console.log("Archivo leído exitosamente");
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                console.log("Workbook creado con hojas:", workbook.SheetNames);
                
                // Suponiendo que la primera hoja contiene los datos
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                console.log("Datos convertidos a JSON:", jsonData.length, "filas");
                
                processExcelData(jsonData);
            } catch (error) {
                console.error("Error al procesar el archivo Excel:", error);
                setUploadStatus(prev => ({
                    ...prev,
                    errors: prev.errors + 1,
                    messages: [...prev.messages, `Error: ${error.message}`]
                }));
                setIsLoading(false);
            }
        };
        
        reader.onerror = (error) => {
            console.error("Error al leer el archivo:", error);
            setUploadStatus(prev => ({
                ...prev,
                errors: prev.errors + 1,
                messages: [...prev.messages, `Error al leer el archivo: ${error}`]
            }));
            setIsLoading(false);
        };
        
        reader.readAsArrayBuffer(file);
    };

    // Procesar los datos del Excel - ACTUALIZA TODOS LOS CAMPOS INCLUYENDO IMÁGENES
    const processExcelData = async (excelData) => {
        console.log("Procesando datos Excel:", excelData);
        
        const db = getFirestore();
        const productsCollection = collection(db, "fragancias");
        
        try {
            // Obtener productos existentes
            console.log("Obteniendo productos existentes de Firestore...");
            const existingProductsSnapshot = await getDocs(productsCollection);
            const existingProducts = {};
            
            existingProductsSnapshot.forEach(doc => {
                existingProducts[doc.id] = { id: doc.id, ...doc.data() };
            });

            console.log("Productos existentes:", Object.keys(existingProducts).length);

            let newProductsCount = 0;
            let updatedProductsCount = 0;
            let errorCount = 0;
            const messages = [];

            // Procesar cada fila del Excel
            for (const [index, row] of excelData.entries()) {
                try {
                    console.log(`Procesando fila ${index + 1}:`, row);

                    // Validar campos obligatorios
                    if (!row.nombre || !row.marca || row.precio_costo === undefined) {
                        errorCount++;
                        messages.push(`Fila ${index + 1} omitida: falta nombre, marca o precio_costo`);
                        console.warn(`Fila ${index + 1} omitida por campos faltantes`);
                        continue;
                    }

                    // Normalizar el precio_costo
                    const precioCostoNormalizado = typeof row.precio_costo === 'string' 
                        ? parseFloat(row.precio_costo.replace(',', '.')) 
                        : Number(row.precio_costo);

                    if (isNaN(precioCostoNormalizado)) {
                        errorCount++;
                        messages.push(`Precio costo inválido para: ${row.nombre}`);
                        console.warn(`Precio costo inválido en fila ${index + 1}`);
                        continue;
                    }

                    // Buscar producto por ID o por nombre+marca
                    let productId = row.id;
                    let productToUpdate = productId ? existingProducts[productId] : null;
                    
                    if (!productToUpdate) {
                        const matchingProduct = Object.values(existingProducts).find(
                            p => p.nombre === row.nombre && p.marca === row.marca
                        );
                        
                        if (matchingProduct) {
                            productId = matchingProduct.id;
                            productToUpdate = matchingProduct;
                            console.log(`Producto encontrado por nombre+marca: ${productId}`);
                        }
                    }

                    if (productToUpdate) {
                        // Calcular el nuevo precio de venta
                        const ganancia = row.ganancia !== undefined ? Number(row.ganancia) : productToUpdate.ganancia || 1.3;
                        const nuevoPrecioVenta = Math.round(precioCostoNormalizado * ganancia);
                        
                        // Preparar datos para actualizar (TODOS los campos incluyendo imagen)
                        const updateData = {
                            nombre: row.nombre,
                            marca: row.marca,
                            precio_costo: precioCostoNormalizado,
                            precio: nuevoPrecioVenta,
                            stock: row.stock !== undefined ? Number(row.stock) : productToUpdate.stock,
                            categoria: row.categoria || productToUpdate.categoria || "Suplementos",
                            presentacion: row.presentacion || productToUpdate.presentacion || "",
                            ganancia: ganancia,
                            img: row.img || productToUpdate.img || "/img/default-product.png" // ← IMAGEN ACTUALIZADA
                        };
                        
                        const productRef = doc(productsCollection, productId);
                        await updateDoc(productRef, updateData);
                        updatedProductsCount++;
                        
                        const imgMessage = row.img ? `Imagen actualizada: ${row.img}` : `Imagen mantiene: ${productToUpdate.img}`;
                        messages.push(`Actualizado: ${row.marca} ${row.nombre} - ${imgMessage}`);
                        console.log(`Producto actualizado: ${productId}`);
                        
                    } else {
                        // Crear nuevo producto
                        const gananciaDefault = row.ganancia !== undefined ? Number(row.ganancia) : 1.3;
                        const precioVentaDefault = Math.round(precioCostoNormalizado * gananciaDefault);
                        
                        const newProductRef = doc(productsCollection);
                        const newProductData = {
                            nombre: row.nombre,
                            marca: row.marca,
                            precio_costo: precioCostoNormalizado,
                            precio: precioVentaDefault,
                            stock: row.stock !== undefined ? Number(row.stock) : 0,
                            categoria: row.categoria || "Suplementos",
                            presentacion: row.presentacion || "",
                            ganancia: gananciaDefault,
                            img: row.img || "/img/default-product.png" // ← IMAGEN NUEVA
                        };
                        
                        await setDoc(newProductRef, newProductData);
                        newProductsCount++;
                        
                        const imgMessage = row.img ? `Imagen: ${row.img}` : `Imagen por defecto`;
                        messages.push(`Nuevo producto: ${row.marca} ${row.nombre} - ${imgMessage}`);
                        console.log(`Nuevo producto creado: ${newProductRef.id}`);
                    }
                } catch (error) {
                    errorCount++;
                    messages.push(`Error procesando fila ${index + 1}: ${error.message}`);
                    console.error("Error procesando fila:", error);
                }
            }

            setUploadStatus({
                success: newProductsCount + updatedProductsCount,
                errors: errorCount,
                newProducts: newProductsCount,
                updatedProducts: updatedProductsCount,
                messages: messages
            });
            
        } catch (error) {
            console.error("Error general al procesar datos:", error);
            setUploadStatus(prev => ({
                ...prev,
                errors: prev.errors + 1,
                messages: [...prev.messages, `Error general: ${error.message}`]
            }));
        }
        
        setIsLoading(false);
    };

    return (
        <div className="container py-5" style={{ color: 'var(--text-primary)' }}>
            {/* Botón para volver al administrador */}
            <div className="row mb-4">
                <div className="col-12">
                    <Link to="/admin" className="btn btn-outline-primary mb-3">
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                        Volver al Administrador
                    </Link>
                    <h1 style={{ color: 'var(--text-primary)' }}>
                        <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                        Gestión de Productos con Excel
                    </h1>
                    <p className="text-muted">Exporta e importa productos completos desde archivos Excel (incluyendo imágenes)</p>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card" style={{ 
                        background: 'var(--bg-card)', 
                        borderColor: 'var(--border-color)' 
                    }}>
                        <div className="card-header" style={{ 
                            background: 'var(--bg-secondary)', 
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color)'
                        }}>
                            <h5 className="mb-0">
                                Herramientas de Excel - Gestión Completa
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="d-grid">
                                        <button 
                                            className="btn btn-success"
                                            onClick={exportToExcel}
                                            disabled={isExporting}
                                            style={{ 
                                                background: 'var(--accent-color)', 
                                                borderColor: 'var(--accent-color)',
                                                color: 'white'
                                            }}
                                        >
                                            {isExporting ? (
                                                <>
                                                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                                    Exportando...
                                                </>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                                                    Exportar Productos
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="form-text text-center" style={{ color: 'var(--text-secondary)' }}>
                                        Descarga todos los productos a un archivo Excel
                                    </div>
                                </div>
                                
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="excelFile" className="form-label" style={{ color: 'var(--text-primary)' }}>
                                        Importar Productos
                                    </label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        id="excelFile"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileUpload}
                                        disabled={isLoading}
                                        style={{ 
                                            background: 'var(--bg-secondary)', 
                                            color: 'var(--text-primary)',
                                            borderColor: 'var(--border-color)'
                                        }}
                                    />
                                    <div className="form-text" style={{ color: 'var(--text-secondary)' }}>
                                        Actualiza todos los campos incluyendo imágenes, precios y stock
                                    </div>
                                </div>
                            </div>

                            {fileName && (
                                <div className="alert alert-info py-2 mb-3" style={{ 
                                    background: 'rgba(23, 162, 184, 0.2)', 
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}>
                                    <small>
                                        Archivo seleccionado: <strong>{fileName}</strong>
                                    </small>
                                </div>
                            )}

                            {(isLoading || isExporting) && (
                                <div className="text-center my-3">
                                    <FontAwesomeIcon icon={faSpinner} spin size="2x" style={{ color: 'var(--accent-color)' }} />
                                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                                        {isExporting ? 'Exportando datos...' : 'Procesando archivo...'}
                                    </p>
                                </div>
                            )}

                            {(uploadStatus.success > 0 || uploadStatus.errors > 0) && !isLoading && (
                                <div className="mt-3">
                                    <h6 style={{ color: 'var(--text-primary)' }}>Resultados de la importación:</h6>
                                    
                                    {uploadStatus.success > 0 && (
                                        <div className="alert alert-success py-2" style={{ 
                                            background: 'rgba(40, 167, 69, 0.2)', 
                                            borderColor: 'var(--border-color)',
                                            color: 'var(--text-primary)'
                                        }}>
                                            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                            <strong>Éxito:</strong> {uploadStatus.success} productos procesados correctamente
                                            ({uploadStatus.newProducts} nuevos, {uploadStatus.updatedProducts} actualizados)
                                        </div>
                                    )}
                                    
                                    {uploadStatus.errors > 0 && (
                                        <div className="alert alert-warning py-2" style={{ 
                                            background: 'rgba(255, 193, 7, 0.2)', 
                                            borderColor: 'var(--border-color)',
                                            color: 'var(--text-primary)'
                                        }}>
                                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                            <strong>Errores:</strong> {uploadStatus.errors} problemas durante la importación
                                        </div>
                                    )}
                                    
                                    {uploadStatus.messages.length > 0 && (
                                        <details className="mt-2">
                                            <summary style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                Ver detalles de la operación ({uploadStatus.messages.length} mensajes)
                                            </summary>
                                            <div className="mt-2 p-2" style={{ 
                                                background: 'var(--bg-secondary)', 
                                                borderRadius: '4px',
                                                maxHeight: '200px',
                                                overflowY: 'auto'
                                            }}>
                                                {uploadStatus.messages.map((msg, index) => (
                                                    <div key={index} className="small mb-1" style={{ color: 'var(--text-secondary)' }}>
                                                        {msg}
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExcelManager;