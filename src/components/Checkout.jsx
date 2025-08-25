/*import { useContext, useState } from "react";
import { CartContext } from "./context/CartContext";
import { getFirestore, collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Table from "./Table";

const Checkout = () => {
  const { cart, clear } = useContext(CartContext);
  const [orderId, setOrderId] = useState("");

  const initialValues = {
    nombre: "",
    email: "",
    telefono: ""
  };

  const validationSchema = Yup.object().shape({
    nombre: Yup.string().matches(/^[a-zA-Z\s]*$/, "Ingrese un nombre válido").required("Ingrese un nombre válido"),
    email: Yup.string().email("Ingrese un correo electrónico válido").required("Ingrese un correo electrónico"),
    telefono: Yup.string().matches(/^[0-9]*$/, "Ingrese solo números en el teléfono").required("Ingrese un teléfono")
  });

  const handleSubmit = (values) => {
    const buyer = { name: values.nombre, phone: values.telefono, email: values.email };
    const items = cart.map((item) => ({
      id: item.id,
      title: item.marca + " " + item.nombre,
      price: item.precioFinal,
      quantity: item.cantidad
    }));
    const fecha = new Date();
    const date = `${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}`;
    const order = { buyer: buyer, items: items, date: date };

    const db = getFirestore();
    const OrderCollection = collection(db, "orders");
    addDoc(OrderCollection, order)
      .then((resultado) => {
        setOrderId(resultado.id);
        clear();
        // Actualizar el stock de los productos en Firestore
        const productCollection = collection(db, "fragancias");
        cart.forEach((item) => {
          const productRef = doc(productCollection, item.id);
          updateDoc(productRef, { stock: item.stock - item.cantidad })
            .then(() => {
              console.log(`Stock actualizado para el producto ${item.id}`);
            })
            .catch((error) => {
              console.log(`Error al actualizar el stock para el producto ${item.id}`, error);
            });
        });
      })

      .catch((resultado) => {
        console.log("Error. No se pudo realizar la compra");
      });

  };




  return (
    <div className="container" style={{ minHeight: "60vh" }}>
      <div className="row my-5">
        <div className="col-md-5">
          <h3 className="text-decoration-underline">Carrito de Compras</h3>
          <Table cart={cart} />
        </div>
        <div className="col-md-5 offset-md-1">
          <h3 className="text-decoration-underline">Checkout</h3>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ errors, touched }) => (
              <Form>
                <div className="mb-3 mt-3">
                  <label className="form-label">Nombre:</label>
                  <Field type="text" name="nombre" className={`form-control ${errors.nombre && touched.nombre ? "is-invalid" : ""}`} placeholder="Ingresa tu nombre" />
                  <ErrorMessage name="nombre" component="div" className="invalid-feedback" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email:</label>
                  <Field type="email" name="email" className={`form-control ${errors.email && touched.email ? "is-invalid" : ""}`} placeholder="Ingresa tu correo electrónico" />
                  <ErrorMessage name="email" component="div" className="invalid-feedback" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Teléfono:</label>
                  <Field type="tel" name="telefono" className={`form-control ${errors.telefono && touched.telefono ? "is-invalid" : ""}`} placeholder="Ingresa tu número de teléfono" />
                  <ErrorMessage name="telefono" component="div" className="invalid-feedback" />
                </div>
                <button className="btn btn-primary" type="submit">
                  Enviar
                </button>
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
*/
// Componente Checkout optimizado - WhatsApp PRIMARY

import { useContext, useState } from "react";
import { CartContext } from "./context/CartContext";
import { getFirestore, collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Table from "./Table";
import WhatsAppConfirmation from "./WhatsAppConfirmation";

const Checkout = () => {
  const { cart, precioTotal, clear: clearCart } = useContext(CartContext);
  const [orderId, setOrderId] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      const buyer = { 
        name: values.nombre.trim(), 
        phone: values.telefono.trim(), 
        email: values.email.trim().toLowerCase()
      };

      const items = cart.map((item) => ({
        id: item.id,
        title: `${item.marca} ${item.nombre}`,
        price: item.precioFinal,
        quantity: item.cantidad,
        presentacion: item.presentacion
      }));

      const fecha = new Date();
      const date = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}`;

      const db = getFirestore();
      const OrderCollection = collection(db, "orders");

      const resultado = await addDoc(OrderCollection, { 
        buyer, 
        items, 
        date, 
        total: precioTotal(), // ✅ función corregida
        status: 'confirmando' 
      });

      const orderData = {
        id: resultado.id,
        buyer,
        items,
        date,
        total: precioTotal()
      };

      setOrderId(resultado.id);
      setCompletedOrder(orderData);
      setShowConfirmation(true);

      // Actualizar stock en segundo plano
      const productCollection = collection(db, "fragancias");
      const updatePromises = cart.map(async (item) => {
        try {
          const productRef = doc(productCollection, item.id);
          await updateDoc(productRef, { 
            stock: item.stock - item.cantidad 
          });
        } catch (error) {
          console.log("Error actualizando stock:", error);
        }
      });

      await Promise.all(updatePromises);

      // Limpiar carrito
      clearCart();

    } catch (error) {
      console.error("Error en la compra:", error);
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
          <Table cart={cart} />

          <div className="mt-4 p-3 bg-dark text-white rounded">
            <h5>📱 Confirmación por WhatsApp</h5>
            <p className="mb-1">• Recibirás el resumen por WhatsApp</p>
            <p className="mb-1">• Respondé para coordinar envío</p>
            <p className="mb-0">• Atención personalizada</p>
          </div>
        </div>

        <div className="col-md-5 offset-md-1">
          <h3 className="text-decoration-underline">Checkout</h3>

          <Formik 
            initialValues={initialValues} 
            validationSchema={validationSchema} 
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
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

                <button 
                  className="btn btn-success w-100 py-2" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Procesando...' : '📱 Finalizar Compra por WhatsApp'}
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
