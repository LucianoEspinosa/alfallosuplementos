

// import { useContext, useState, useEffect } from "react";
// import { CartContext } from "./context/CartContext";
// import { getFirestore, collection, addDoc, doc, updateDoc } from "firebase/firestore";
// import { Navigate } from "react-router-dom";
// import { Formik, Field, Form, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import Table from "./Table";
// import WhatsAppConfirmation from "./WhatsAppConfirmation";
// import PaymentMethodSelector from "./PaymentMethodSelector";

// const Checkout = () => {
//   const { cart, precioTotal, clear: clearCart } = useContext(CartContext);
//   const [orderId, setOrderId] = useState("");
//   const [completedOrder, setCompletedOrder] = useState(null);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [metodoPago, setMetodoPago] = useState("efectivo");
//   const [totalFinal, setTotalFinal] = useState(0);
//   const [recargo, setRecargo] = useState(0);
//   const [itemsConRecargo, setItemsConRecargo] = useState([]);

//   // Inicializar con el total sin recargo
//   useEffect(() => {
//     const total = precioTotal();
//     setTotalFinal(total);
//     setItemsConRecargo(cart.map(item => ({
//       ...item,
//       precioConRecargo: item.precioFinal,
//       precioOriginal: item.precioFinal
//     })));
//   }, [precioTotal, cart]);

//   const initialValues = {
//     nombre: "",
//     email: "",
//     telefono: ""
//   };

//   const validationSchema = Yup.object().shape({
//     nombre: Yup.string()
//       .matches(/^[a-zA-Z\s]*$/, "Ingrese un nombre válido")
//       .required("Ingrese un nombre válido"),
//     email: Yup.string()
//       .email("Ingrese un correo electrónico válido")
//       .required("Ingrese un correo electrónico"),
//     telefono: Yup.string()
//       .matches(/^[0-9]*$/, "Ingrese solo números")
//       .min(10, "Teléfono demasiado corto")
//       .required("Ingrese un teléfono")
//   });

//   const handlePaymentMethodChange = (metodo, totalConRecargo, recargoAplicado) => {
//     setMetodoPago(metodo);
//     setTotalFinal(totalConRecargo);
//     setRecargo(recargoAplicado);
    
//     // ACTUALIZAR ITEMS CON RECARGO
//     const nuevosItems = cart.map(item => {
//       const precioConRecargo = metodo === "transferencia" 
//         ? Math.round(item.precioFinal * 1.075)
//         : item.precioFinal;
      
//       return {
//         ...item,
//         precioConRecargo: precioConRecargo,
//         precioOriginal: item.precioFinal
//       };
//     });
    
//     setItemsConRecargo(nuevosItems);
//   };

//   const handleSubmit = async (values) => {
//     console.log("Iniciando submit...");
    
//     if (cart.length === 0) {
//       alert("El carrito está vacío");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const buyer = { 
//         name: values.nombre.trim(), 
//         phone: values.telefono.trim(), 
//         email: values.email.trim().toLowerCase()
//       };

//       // USAR itemsConRecargo EN LUGAR DE cart
//       const items = itemsConRecargo.map((item) => ({
//         id: item.id,
//         title: `${item.marca} ${item.nombre}`,
//         price: item.precioConRecargo,
//         priceOriginal: item.precioOriginal,
//         quantity: item.cantidad,
//         presentacion: item.presentacion,
//         hasSurcharge: metodoPago === "transferencia"
//       }));

//       const fecha = new Date();
//       const date = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}`;

//       const db = getFirestore();
//       const OrderCollection = collection(db, "orders");

//       const orderData = {
//         buyer, 
//         items, 
//         date, 
//         total: totalFinal,
//         payment: {
//           method: metodoPago,
//           subtotal: precioTotal(),
//           surcharge: recargo,
//           total: totalFinal,
//           surcharge_percentage: metodoPago === "transferencia" ? 7.5 : 0,
//           surcharge_applied: metodoPago === "transferencia"
//         },
//         status: 'confirmando' 
//       };

//       console.log("Creando orden en Firebase...");
//       const resultado = await addDoc(OrderCollection, orderData);
//       console.log("Orden creada con ID:", resultado.id);

//       const completedOrderData = {
//         id: resultado.id,
//         buyer,
//         items: orderData.items,
//         date: orderData.date,
//         total: orderData.total,
//         payment: orderData.payment
//       };

//       setOrderId(resultado.id);
//       setCompletedOrder(completedOrderData);
//       setShowConfirmation(true);

//       // Actualizar stock usando el cart original (sin recargo)
//       const productCollection = collection(db, "fragancias");
//       const updatePromises = cart.map(async (item) => {
//         try {
//           const productRef = doc(productCollection, item.id);
//           await updateDoc(productRef, { 
//             stock: item.stock - item.cantidad 
//           });
//           console.log("Stock actualizado para:", item.id);
//         } catch (error) {
//           console.log("Error actualizando stock:", error);
//         }
//       });

//       await Promise.all(updatePromises);
//       clearCart();

//     } catch (error) {
//       console.error("Error completo en la compra:", error);
//       alert("Error al procesar la compra. Intenta nuevamente.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (showConfirmation && completedOrder) {
//     return (
//       <WhatsAppConfirmation 
//         order={completedOrder}
//         onBack={() => setShowConfirmation(false)}
//       />
//     );
//   }

//   return (
//     <div className="container" style={{ minHeight: "60vh" }}>
//       <div className="row my-5">
//         <div className="col-md-5">
//           <h3 className="text-decoration-underline">Carrito de Compras</h3>
//           <Table 
//             cart={itemsConRecargo} 
//             metodoPago={metodoPago}
//             showOriginalPrice={metodoPago === "transferencia"}
//           />

//           <div className="mt-4 p-3 bg-dark text-white rounded">
//             <h5>📱 Confirmación por WhatsApp</h5>
//             <p className="mb-1">• Recibirás el resumen por WhatsApp</p>
//             <p className="mb-1">• Respondé para coordinar envío</p>
//             <p className="mb-0">• Atención personalizada</p>
//           </div>
//         </div>

//         <div className="col-md-5 offset-md-1">
//           <h3 className="text-decoration-underline mb-4">Checkout</h3>

//           <Formik 
//             initialValues={initialValues} 
//             validationSchema={validationSchema} 
//             onSubmit={handleSubmit}
//           >
//             {({ errors, touched, isSubmitting: formikSubmitting }) => (
//               <Form>
//                 {/* CAMPOS DEL FORMULARIO */}
//                 <div className="mb-3">
//                   <label className="form-label">Nombre completo *</label>
//                   <Field 
//                     type="text" 
//                     name="nombre" 
//                     className={`form-control ${errors.nombre && touched.nombre ? "is-invalid" : ""}`} 
//                     placeholder="Ej: María González" 
//                   />
//                   <ErrorMessage name="nombre" component="div" className="invalid-feedback" />
//                 </div>

//                 <div className="mb-3">
//                   <label className="form-label">Email *</label>
//                   <Field 
//                     type="email" 
//                     name="email" 
//                     className={`form-control ${errors.email && touched.email ? "is-invalid" : ""}`} 
//                     placeholder="ejemplo@gmail.com" 
//                   />
//                   <ErrorMessage name="email" component="div" className="invalid-feedback" />
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label">WhatsApp *</label>
//                   <Field 
//                     type="tel" 
//                     name="telefono" 
//                     className={`form-control ${errors.telefono && touched.telefono ? "is-invalid" : ""}`} 
//                     placeholder="11 2345-6789" 
//                   />
//                   <ErrorMessage name="telefono" component="div" className="invalid-feedback" />
//                   <small className="text-muted">Te contactaremos por este número</small>
//                 </div>

//                 {/* Selector de método de pago */}
//                 <div className="mb-4">
//                   <PaymentMethodSelector 
//                     total={precioTotal()}
//                     onPaymentMethodChange={handlePaymentMethodChange}
//                   />
//                 </div>

//                 {/* Resumen final */}
//                 <div className="card mb-4">
//                   <div className="card-body">
//                     <h6 className="card-title">Resumen Final</h6>
//                     <div className="d-flex justify-content-between">
//                       <span>Subtotal:</span>
//                       <span>${precioTotal().toLocaleString('es-AR')}</span>
//                     </div>
                    
//                     {recargo > 0 && (
//                       <div className="d-flex justify-content-between text-danger">
//                         <span>Recargo por transferencia (7.5%):</span>
//                         <span>+${recargo.toLocaleString('es-AR')}</span>
//                       </div>
//                     )}
                    
//                     <hr />
                    
//                     <div className="d-flex justify-content-between fw-bold fs-5">
//                       <span>Total:</span>
//                       <span className="text-success">${totalFinal.toLocaleString('es-AR')}</span>
//                     </div>
                    
//                     <small className="text-muted">
//                       {metodoPago === 'transferencia' ? 
//                         "Incluye 7.5% de recargo" : 
//                         "Sin recargos adicionales"
//                       }
//                     </small>
//                   </div>
//                 </div>

//                 {/* BOTÓN DE CONFIRMAR - CORREGIDO */}
//                 <button 
//                   className="btn btn-success w-100 py-2" 
//                   type="submit"
//                   disabled={isSubmitting || cart.length === 0}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                       Procesando...
//                     </>
//                   ) : (
//                     `✅ Confirmar Compra - $${totalFinal.toLocaleString('es-AR')}`
//                   )}
//                 </button>

//                 <div className="mt-3 text-center">
//                   <small className="text-muted">
//                     Al completar aceptás nuestros términos y condiciones
//                   </small>
//                 </div>
//               </Form>
//             )}
//           </Formik>
//         </div>
//       </div>

//       {orderId && <Navigate to={`/thankyou/${orderId}`} />}
//     </div>
//   );
// };

// export default Checkout;

import { useContext, useState, useEffect } from "react";
import { CartContext } from "./context/CartContext";
import { getFirestore, collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Table from "./Table";
import WhatsAppConfirmation from "./WhatsAppConfirmation";
import PaymentMethodSelector from "./PaymentMethodSelector";

const Checkout = () => {
  const { cart, precioTotal, clear: clearCart } = useContext(CartContext);
  const [orderId, setOrderId] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [totalFinal, setTotalFinal] = useState(0);
  const [recargo, setRecargo] = useState(0);
  const [itemsConRecargo, setItemsConRecargo] = useState([]);

  // Inicializar con el total sin recargo
  useEffect(() => {
    const total = precioTotal();
    setTotalFinal(total);
    setItemsConRecargo(cart.map(item => ({
      ...item,
      precioConRecargo: item.precioFinal,
      precioOriginal: item.precioFinal
    })));
  }, [precioTotal, cart]);

  const initialValues = {
    nombre: "",
    email: "",
    telefono: ""
  };

  const validationSchema = Yup.object().shape({
    nombre: Yup.string()
      .matches(/^[a-zA-Z\s]*$/, "Ingrese un nombre válido")
      .required("Ingrese un nombre válido"),
    email: Yup.string()
      .email("Ingrese un correo electrónico válido")
      .required("Ingrese un correo electrónico"),
    telefono: Yup.string()
      .matches(/^[0-9]*$/, "Ingrese solo números")
      .min(10, "Teléfono demasiado corto")
      .required("Ingrese un teléfono")
  });

  const handlePaymentMethodChange = (metodo, totalConRecargo, recargoAplicado) => {
    setMetodoPago(metodo);
    setTotalFinal(totalConRecargo);
    setRecargo(recargoAplicado);
    
    // ACTUALIZAR ITEMS CON RECARGO
    const nuevosItems = cart.map(item => {
      const precioConRecargo = metodo === "transferencia" 
        ? Math.round(item.precioFinal * 1.075)
        : item.precioFinal;
      
      return {
        ...item,
        precioConRecargo: precioConRecargo,
        precioOriginal: item.precioFinal
      };
    });
    
    setItemsConRecargo(nuevosItems);
  };

  const handleSubmit = async (values) => {
    console.log("Iniciando submit...");
    
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    setIsSubmitting(true);

    try {
      const buyer = { 
        name: values.nombre.trim(), 
        phone: values.telefono.trim(), 
        email: values.email.trim().toLowerCase()
      };

      // USAR itemsConRecargo EN LUGAR DE cart - CORREGIDO
      const items = itemsConRecargo.map((item) => ({
        id: item.id,
        title: `${item.marca} ${item.nombre}`,
        price: item.precioConRecargo,
        priceOriginal: item.precioOriginal,
        quantity: item.cantidad,
        presentacion: item.presentacion,
        saborSeleccionado: item.saborSeleccionado, // ← ESTA ES LA LÍNEA QUE FALTABA
        hasSurcharge: metodoPago === "transferencia"
      }));

      const fecha = new Date();
      const date = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}`;

      const db = getFirestore();
      const OrderCollection = collection(db, "orders");

      const orderData = {
        buyer, 
        items, 
        date, 
        total: totalFinal,
        payment: {
          method: metodoPago,
          subtotal: precioTotal(),
          surcharge: recargo,
          total: totalFinal,
          surcharge_percentage: metodoPago === "transferencia" ? 7.5 : 0,
          surcharge_applied: metodoPago === "transferencia"
        },
        status: 'confirmando' 
      };

      console.log("Creando orden en Firebase...");
      const resultado = await addDoc(OrderCollection, orderData);
      console.log("Orden creada con ID:", resultado.id);

      const completedOrderData = {
        id: resultado.id,
        buyer,
        items: orderData.items,
        date: orderData.date,
        total: orderData.total,
        payment: orderData.payment
      };

      setOrderId(resultado.id);
      setCompletedOrder(completedOrderData);
      setShowConfirmation(true);

      // Actualizar stock usando el cart original (sin recargo)
      const productCollection = collection(db, "fragancias");
      const updatePromises = cart.map(async (item) => {
        try {
          const productRef = doc(productCollection, item.id);
          await updateDoc(productRef, { 
            stock: item.stock - item.cantidad 
          });
          console.log("Stock actualizado para:", item.id);
        } catch (error) {
          console.log("Error actualizando stock:", error);
        }
      });

      await Promise.all(updatePromises);
      clearCart();

    } catch (error) {
      console.error("Error completo en la compra:", error);
      alert("Error al procesar la compra. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation && completedOrder) {
    return (
      <WhatsAppConfirmation 
        order={completedOrder}
        onBack={() => setShowConfirmation(false)}
      />
    );
  }

  return (
    <div className="container" style={{ minHeight: "60vh" }}>
      <div className="row my-5">
        <div className="col-md-5">
          <h3 className="text-decoration-underline">Carrito de Compras</h3>
          <Table 
            cart={itemsConRecargo} 
            metodoPago={metodoPago}
            showOriginalPrice={metodoPago === "transferencia"}
          />

          <div className="mt-4 p-3 bg-dark text-white rounded">
            <h5>📱 Confirmación por WhatsApp</h5>
            <p className="mb-1">• Recibirás el resumen por WhatsApp</p>
            <p className="mb-1">• Respondé para coordinar envío</p>
            <p className="mb-0">• Atención personalizada</p>
          </div>
        </div>

        <div className="col-md-5 offset-md-1">
          <h3 className="text-decoration-underline mb-4">Checkout</h3>

          <Formik 
            initialValues={initialValues} 
            validationSchema={validationSchema} 
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting: formikSubmitting }) => (
              <Form>
                {/* CAMPOS DEL FORMULARIO */}
                <div className="mb-3">
                  <label className="form-label">Nombre completo *</label>
                  <Field 
                    type="text" 
                    name="nombre" 
                    className={`form-control ${errors.nombre && touched.nombre ? "is-invalid" : ""}`} 
                    placeholder="Ej: María González" 
                  />
                  <ErrorMessage name="nombre" component="div" className="invalid-feedback" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <Field 
                    type="email" 
                    name="email" 
                    className={`form-control ${errors.email && touched.email ? "is-invalid" : ""}`} 
                    placeholder="ejemplo@gmail.com" 
                  />
                  <ErrorMessage name="email" component="div" className="invalid-feedback" />
                </div>

                <div className="mb-4">
                  <label className="form-label">WhatsApp *</label>
                  <Field 
                    type="tel" 
                    name="telefono" 
                    className={`form-control ${errors.telefono && touched.telefono ? "is-invalid" : ""}`} 
                    placeholder="11 2345-6789" 
                  />
                  <ErrorMessage name="telefono" component="div" className="invalid-feedback" />
                  <small className="text-muted">Te contactaremos por este número</small>
                </div>

                {/* Selector de método de pago */}
                <div className="mb-4">
                  <PaymentMethodSelector 
                    total={precioTotal()}
                    onPaymentMethodChange={handlePaymentMethodChange}
                  />
                </div>

                {/* Resumen final */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h6 className="card-title">Resumen Final</h6>
                    <div className="d-flex justify-content-between">
                      <span>Subtotal:</span>
                      <span>${precioTotal().toLocaleString('es-AR')}</span>
                    </div>
                    
                    {recargo > 0 && (
                      <div className="d-flex justify-content-between text-danger">
                        <span>Recargo por transferencia (7.5%):</span>
                        <span>+${recargo.toLocaleString('es-AR')}</span>
                      </div>
                    )}
                    
                    <hr />
                    
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>Total:</span>
                      <span className="text-success">${totalFinal.toLocaleString('es-AR')}</span>
                    </div>
                    
                    <small className="text-muted">
                      {metodoPago === 'transferencia' ? 
                        "Incluye 7.5% de recargo" : 
                        "Sin recargos adicionales"
                      }
                    </small>
                  </div>
                </div>

                {/* BOTÓN DE CONFIRMAR - CORREGIDO */}
                <button 
                  className="btn btn-success w-100 py-2" 
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : (
                    `✅ Confirmar Compra - $${totalFinal.toLocaleString('es-AR')}`
                  )}
                </button>

                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Al completar aceptás nuestros términos y condiciones
                  </small>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {orderId && <Navigate to={`/thankyou/${orderId}`} />}
    </div>
  );
};

export default Checkout;