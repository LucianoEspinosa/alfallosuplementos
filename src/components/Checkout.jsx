import { useContext, useState, useEffect } from "react";
import { CartContext } from "./context/CartContext";
import { getFirestore, collection, addDoc, doc, updateDoc, Timestamp, getDoc, increment } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
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

  // Estados para el descuento
  const [codigoDescuento, setCodigoDescuento] = useState("");
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [codigoValido, setCodigoValido] = useState(null);
  const [loadingDescuento, setLoadingDescuento] = useState(false);
  const [infoDescuento, setInfoDescuento] = useState(null);
  const [discountData, setDiscountData] = useState(null);
  const [emailActual, setEmailActual] = useState("");

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

  // Recalcular total cuando cambie el descuento
  useEffect(() => {
    const subtotal = precioTotal();
    const totalConRecargo = metodoPago === "transferencia"
      ? Math.round(subtotal * 1.075)
      : subtotal;

    const totalConDescuento = totalConRecargo - descuentoAplicado;
    setTotalFinal(Math.max(0, totalConDescuento));
  }, [descuentoAplicado, metodoPago, precioTotal]);

  // NUEVO EFECTO: Re-validar descuento cuando cambie el email
  useEffect(() => {
    if (discountData?.firstPurchaseOnly && descuentoAplicado > 0 && emailActual) {
      revalidarDescuentoPorEmail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailActual]);

  // Función para verificar primera compra
  const verificarPrimeraCompra = async (email) => {
    try {
      // La consulta se hace en el servidor (Cloud Function): "orders" no es legible desde el navegador
      const funciones = getFunctions(undefined, "southamerica-east1");
      const esPrimeraCompraFn = httpsCallable(funciones, "esPrimeraCompra");
      const resultado = await esPrimeraCompraFn({ email: email.toLowerCase().trim() });
      return resultado.data.esPrimeraCompra === true;
    } catch (error) {
      console.error("Error verificando primera compra:", error);
      return false;
    }
  };

  // NUEVA FUNCIÓN: Re-validar descuento cuando cambia el email
  const revalidarDescuentoPorEmail = async () => {
    if (!discountData?.firstPurchaseOnly || !emailActual) return;

    try {
      const esPrimeraCompra = await verificarPrimeraCompra(emailActual);
      
      if (!esPrimeraCompra) {
        // Invalidar el descuento si ya no es primera compra
        setDescuentoAplicado(0);
        setCodigoValido(false);
        setInfoDescuento("❌ Código invalidado: Este email ya realizó una compra anterior");
        setDiscountData(null);
        
        // Revertir el contador de usos en Firestore
        try {
          const db = getFirestore();
          const discountRef = doc(db, "discountCodes", codigoDescuento.toUpperCase());
          await updateDoc(discountRef, {
            timesUsed: increment(-1)
          });
        } catch (error) {
          console.error("Error revertiendo contador de usos:", error);
        }
      }
    } catch (error) {
      console.error("Error revalidando descuento:", error);
    }
  };

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

  // Función para validar y aplicar código de descuento
  const aplicarDescuento = async () => {
    if (!codigoDescuento.trim()) return;

    setLoadingDescuento(true);
    setCodigoValido(null);
    setInfoDescuento(null);
    setDiscountData(null);

    try {
      const db = getFirestore();
      const discountRef = doc(db, "discountCodes", codigoDescuento.toUpperCase());
      const discountDoc = await getDoc(discountRef);

      if (!discountDoc.exists()) {
        setCodigoValido(false);
        setInfoDescuento("Código no válido");
        setLoadingDescuento(false);
        return;
      }

      const discountData = discountDoc.data();
      setDiscountData(discountData);

      if (!discountData.active) {
        setCodigoValido(false);
        setInfoDescuento("Este código no está activo");
        setLoadingDescuento(false);
        return;
      }

      const now = new Date();
      if (discountData.validFrom && now < discountData.validFrom.toDate()) {
        setCodigoValido(false);
        setInfoDescuento("Este código aún no es válido");
        setLoadingDescuento(false);
        return;
      }

      if (discountData.validUntil && now > discountData.validUntil.toDate()) {
        setCodigoValido(false);
        setInfoDescuento("Este código ha expirado");
        setLoadingDescuento(false);
        return;
      }

      if (discountData.usageLimit && discountData.timesUsed >= discountData.usageLimit) {
        setCodigoValido(false);
        setInfoDescuento("Límite de uso alcanzado");
        setLoadingDescuento(false);
        return;
      }

      const subtotal = precioTotal();
      if (discountData.minPurchase && subtotal < discountData.minPurchase) {
        setCodigoValido(false);
        setInfoDescuento(`Mínimo de compra: $${discountData.minPurchase}`);
        setLoadingDescuento(false);
        return;
      }

      // Validación de primera compra
      if (discountData.firstPurchaseOnly) {
        // Obtener el email del formulario usando Formik
        const emailField = document.querySelector('input[name="email"]');
        const email = emailField ? emailField.value.trim() : '';
        
        if (!email) {
          setCodigoValido(false);
          setInfoDescuento("Completa tu email para validar este código de primera compra");
          setLoadingDescuento(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setCodigoValido(false);
          setInfoDescuento("Ingresa un email válido para validar el código");
          setLoadingDescuento(false);
          return;
        }

        setInfoDescuento("Verificando si es tu primera compra...");
        
        const esPrimeraCompra = await verificarPrimeraCompra(email);
        
        if (!esPrimeraCompra) {
          setCodigoValido(false);
          setInfoDescuento("Este código es válido solo para tu primera compra");
          setLoadingDescuento(false);
          return;
        }

        // Guardar el email actual para futuras validaciones
        setEmailActual(email);
      }

      // Aplicar el descuento
      if (discountData.discountType === "percentage") {
        const descuento = (subtotal * discountData.value) / 100;
        setDescuentoAplicado(descuento);
        setInfoDescuento(`${discountData.value}% de descuento aplicado`);
      } else if (discountData.discountType === "fixed") {
        setDescuentoAplicado(discountData.value);
        setInfoDescuento(`$${discountData.value} de descuento aplicado`);
      }

      // Incrementar el contador de usos
      await updateDoc(discountRef, {
        timesUsed: increment(1)
      });

      setCodigoValido(true);

    } catch (error) {
      console.error("Error al aplicar descuento:", error);
      setCodigoValido(false);
      setInfoDescuento("Error al aplicar el código");
    } finally {
      setLoadingDescuento(false);
    }
  };

  const limpiarDescuento = () => {
    setCodigoDescuento("");
    setDescuentoAplicado(0);
    setCodigoValido(null);
    setInfoDescuento(null);
    setDiscountData(null);
    setEmailActual("");
  };

  const handlePaymentMethodChange = (metodo, totalConRecargo, recargoAplicado) => {
    setMetodoPago(metodo);
    setRecargo(recargoAplicado);

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
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    // Validación final antes de enviar
    if (discountData?.firstPurchaseOnly) {
      const esPrimeraCompra = await verificarPrimeraCompra(values.email.trim());
      if (!esPrimeraCompra) {
        alert("Este código de descuento es válido solo para primera compra. El email ingresado ya tiene compras anteriores.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const buyer = {
        name: values.nombre.trim(),
        phone: values.telefono.trim(),
        email: values.email.trim().toLowerCase()
      };

      const items = itemsConRecargo.map((item) => ({
        id: item.id,
        title: `${item.marca} ${item.nombre}`,
        price: item.precioConRecargo,
        priceOriginal: item.precioOriginal,
        quantity: item.cantidad,
        presentacion: item.presentacion,
        saborSeleccionado: item.saborSeleccionado,
        hasSurcharge: metodoPago === "transferencia"
      }));

      const fecha = new Date();
      const dateString = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}`;
      const timestamp = Timestamp.fromDate(fecha);

      const db = getFirestore();
      const OrderCollection = collection(db, "orders");

      const discountInfo = {
        applied: descuentoAplicado > 0,
        code: codigoDescuento.toUpperCase(),
        amount: descuentoAplicado,
        type: discountData?.discountType || "percentage",
        percentage: discountData?.value || 0,
        description: discountData?.description || "",
        firstPurchaseOnly: discountData?.firstPurchaseOnly || false
      };

      const orderData = {
        buyer,
        items,
        date: dateString,
        timestamp: timestamp,
        total: totalFinal,
        discount: discountInfo,
        payment: {
          method: metodoPago,
          subtotal: precioTotal(),
          surcharge: recargo,
          discount: descuentoAplicado,
          total: totalFinal,
          surcharge_percentage: metodoPago === "transferencia" ? 7.5 : 0,
          surcharge_applied: metodoPago === "transferencia"
        },
        status: 'confirmando'
      };

      const resultado = await addDoc(OrderCollection, orderData);

      const completedOrderData = {
        id: resultado.id,
        buyer,
        items: orderData.items,
        date: orderData.date,
        total: orderData.total,
        payment: orderData.payment,
        discount: orderData.discount
      };

      setOrderId(resultado.id);
      setCompletedOrder(completedOrderData);
      setShowConfirmation(true);

      // El stock se descuenta en el servidor (Cloud Function sendOrderEmail al crearse la orden)
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
            {({ errors, touched, isSubmitting: formikSubmitting, submitCount, values, handleChange }) => (
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
                    onChange={(e) => {
                      // Primero dejar que Formik maneje el cambio
                      handleChange(e);
                      // Luego actualizar nuestro estado para revalidar el descuento
                      setEmailActual(e.target.value.trim());
                    }}
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

                {/* CÓDIGO DE DESCUENTO */}
                <div className="card mb-3">
                  <div className="card-body bg-secondary-subtle">
                    <h6 className="card-title">¿Tienes un código de descuento?</h6>
                    
                    {/* Aviso cuando hay un código de primera compra aplicado */}
                    {discountData?.firstPurchaseOnly && descuentoAplicado > 0 && (
                      <div className="alert alert-info py-2 mb-2">
                        <small>
                          ⚠️ <strong>Importante:</strong> Este código es válido solo para primera compra. 
                          Si cambias el email, el descuento se re-validará automáticamente.
                        </small>
                      </div>
                    )}
                    
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ingresa tu código"
                        value={codigoDescuento}
                        onChange={(e) => setCodigoDescuento(e.target.value)}
                        disabled={descuentoAplicado > 0}
                      />
                      {descuentoAplicado > 0 ? (
                        <button
                          className="btn btn-outline-danger"
                          type="button"
                          onClick={limpiarDescuento}
                        >
                          Quitar
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={aplicarDescuento}
                          disabled={loadingDescuento || !codigoDescuento.trim()}
                        >
                          {loadingDescuento ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            "Aplicar"
                          )}
                        </button>
                      )}
                    </div>

                    {infoDescuento && (
                      <div className={`mt-2 ${codigoValido ? 'text-success' : 'text-danger'}`}>
                        <small>
                          {codigoValido ? '✓ ' : '✗ '}
                          {infoDescuento}
                          {discountData?.firstPurchaseOnly && codigoValido && (
                            <span className="badge bg-warning ms-2">Primera compra</span>
                          )}
                        </small>
                      </div>
                    )}
                  </div>
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

                    {descuentoAplicado > 0 && (
                      <div className="d-flex justify-content-between text-success">
                        <span>
                          Descuento ({codigoDescuento})
                          {discountData?.firstPurchaseOnly && (
                            <span className="badge bg-warning ms-1">Primera compra</span>
                          )}:
                        </span>
                        <span>-${descuentoAplicado.toLocaleString('es-AR')}</span>
                      </div>
                    )}

                    <hr />

                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>Total:</span>
                      <span className="text-success">${totalFinal.toLocaleString('es-AR')}</span>
                    </div>

                    <small className="text-muted">
                      {metodoPago === 'transferencia'
                        ? "Incluye 7.5% de recargo"
                        : "Sin recargos adicionales"
                      }
                    </small>
                  </div>
                </div>

                {/* BOTÓN DE CONFIRMAR */}
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

                {/* Aviso dinámico: solo si intentó enviar y hay errores */}
                {submitCount > 0 && Object.keys(errors).length > 0 && (
                  <div className="mt-2 text-center">
                    <small className="text-danger fw-bold">
                      ⚠️ Recordá completar todos los campos obligatorios
                    </small>
                  </div>
                )}

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