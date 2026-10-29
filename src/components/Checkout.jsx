import { useContext, useState, useEffect } from "react";
import { CartContext } from "./context/CartContext";
import { getFirestore, collection, addDoc, doc, updateDoc, Timestamp, getDoc, increment } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Navigate, useNavigate } from "react-router-dom";
import { PiCheck } from "react-icons/pi";
import { FaWhatsapp } from "react-icons/fa";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import WhatsAppConfirmation from "./WhatsAppConfirmation";
import PaymentMethodSelector from "./PaymentMethodSelector";
import CompraHeader from "./af/CompraHeader";
import ProductPhoto from "./af/ProductPhoto";
import { etiquetaCantidad } from "../utils/productos";
import { TRANSFER_SURCHARGE, DESCUENTOS_POR_CATEGORIA } from "../config";
import { normalizarTexto } from "../utils/productos";
import { leerCupon, borrarCupon } from "../utils/cuponLink";

// Montos con el mismo formato que se mostraba antes (sin redondear)
const formatoMonto = (n) => "$" + Number(n || 0).toLocaleString("es-AR");

const Checkout = () => {
  const { cart, precioTotal, clear: clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [totalFinal, setTotalFinal] = useState(0);
  const [recargo, setRecargo] = useState(0);
  const [itemsConRecargo, setItemsConRecargo] = useState([]);

  // Estados para el descuento
  // Si el cliente entró con un link con código (?cupon=XXX), viene precargado
  const [codigoDescuento, setCodigoDescuento] = useState(() => leerCupon());
  const [cuponDelLink] = useState(() => leerCupon());
  const [emailAutoProbado, setEmailAutoProbado] = useState("");
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
      ? Math.round(subtotal * (1 + TRANSFER_SURCHARGE))
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
          // Queda pendiente (no es un error): se aplica solo cuando el cliente completa el email
          setCodigoValido(null);
          setInfoDescuento("Completá tu email para aplicar este código de primera compra");
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
      const reglaCategoria = DESCUENTOS_POR_CATEGORIA[codigoDescuento.trim().toUpperCase()];
      if (reglaCategoria) {
        // Porcentaje distinto para proteínas y para el resto de la tienda
        const descuento = Math.round(cart.reduce((suma, item) => {
          const esProteina = /^prote/.test(normalizarTexto(item.categoria));
          const porcentaje = esProteina ? reglaCategoria.proteinas : reglaCategoria.resto;
          return suma + (item.precioFinal * item.cantidad * porcentaje) / 100;
        }, 0));
        setDescuentoAplicado(descuento);
        setInfoDescuento(`${reglaCategoria.proteinas}% en proteínas y ${reglaCategoria.resto}% en el resto aplicado`);
      } else if (discountData.discountType === "percentage") {
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

  // Código que vino por link: intentar aplicarlo apenas se abre el checkout
  useEffect(() => {
    if (cuponDelLink && cart.length > 0) aplicarDescuento();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si es de primera compra, se aplica solo cuando el cliente termina de escribir un email válido
  useEffect(() => {
    if (!cuponDelLink || descuentoAplicado > 0 || loadingDescuento) return;
    if (codigoDescuento.trim().toUpperCase() !== cuponDelLink) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailActual) || emailActual === emailAutoProbado) return;
    const timer = setTimeout(() => {
      setEmailAutoProbado(emailActual);
      aplicarDescuento();
    }, 900);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailActual]);

  const limpiarDescuento = () => {
    borrarCupon();
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
        ? Math.round(item.precioFinal * (1 + TRANSFER_SURCHARGE))
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
        description: DESCUENTOS_POR_CATEGORIA[codigoDescuento.trim().toUpperCase()]
          ? `${DESCUENTOS_POR_CATEGORIA[codigoDescuento.trim().toUpperCase()].proteinas}% proteínas / ${DESCUENTOS_POR_CATEGORIA[codigoDescuento.trim().toUpperCase()].resto}% resto`
          : discountData?.description || "",
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
      borrarCupon();

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

  const subtotalCompra = precioTotal();
  const cantidadTotal = cart.reduce((suma, item) => suma + item.cantidad, 0);
  const esTransferencia = metodoPago === "transferencia";
  const mensajeDescuento = infoDescuento ? infoDescuento.replace(/^❌\s*/, "") : null;
  const verificando = codigoValido === null && !!infoDescuento;

  return (
    <div className="af-compra">
      <CompraHeader paso={1} onBack={() => navigate("/cart")} />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, submitCount, handleChange }) => (
          <Form className="af-checkout" noValidate>
            <h1 className="af-compra-title af-checkout-title-m">Finalizar compra</h1>

            {/* Resumen del pedido (en desktop, columna izquierda fija) */}
            <aside className="af-checkout-side">
              <h1 className="af-compra-title af-checkout-title-d">Finalizar compra</h1>
              <div className="af-order">
                <span className="af-overline af-overline--soft">Tu pedido · {etiquetaCantidad(cantidadTotal)}</span>
                {itemsConRecargo.map((item) => (
                  <div key={item.id} className="af-order-row">
                    <div className="af-tile af-order-thumb">
                      <ProductPhoto img={item.img} marca={item.marca} nombre={item.nombre} variant="initial" alt="" />
                    </div>
                    <div className="af-order-info">
                      <span className="af-order-name">{item.marca} {item.nombre}</span>
                      <span className="af-order-meta">
                        {[item.presentacion, item.saborSeleccionado, `x${item.cantidad}`].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    <span className="af-order-sub">{formatoMonto(item.precioConRecargo * item.cantidad)}</span>
                  </div>
                ))}
              </div>
            </aside>

            <section className="af-checkout-main">
              {/* 1 · Tus datos */}
              <div className="af-form-block">
                <span className="af-form-step">1 · Tus datos</span>

                <label className="af-field">
                  <span className="af-field-label">Nombre completo *</span>
                  <Field
                    type="text"
                    name="nombre"
                    className={`af-field-input ${errors.nombre && touched.nombre ? "is-bad" : ""}`}
                    placeholder="Ej: María González"
                  />
                  <ErrorMessage name="nombre" component="span" className="af-field-error" />
                </label>

                <label className="af-field">
                  <span className="af-field-label">Email *</span>
                  <Field
                    type="email"
                    name="email"
                    className={`af-field-input ${errors.email && touched.email ? "is-bad" : ""}`}
                    placeholder="ejemplo@gmail.com"
                    onChange={(e) => {
                      // Primero dejar que Formik maneje el cambio
                      handleChange(e);
                      // Luego actualizar nuestro estado para revalidar el descuento
                      setEmailActual(e.target.value.trim());
                    }}
                  />
                  <ErrorMessage name="email" component="span" className="af-field-error" />
                </label>

                <label className="af-field">
                  <span className="af-field-label">WhatsApp *</span>
                  <Field
                    type="tel"
                    name="telefono"
                    className={`af-field-input ${errors.telefono && touched.telefono ? "is-bad" : ""}`}
                    placeholder="11 2345-6789"
                  />
                  <ErrorMessage name="telefono" component="span" className="af-field-error" />
                  {!(errors.telefono && touched.telefono) && (
                    <span className="af-field-help">Te contactamos por este número.</span>
                  )}
                </label>
              </div>

              {/* Código de descuento */}
              <div className="af-discount">
                <span className="af-field-label">¿Tenés un código de descuento?</span>
                <div className="af-discount-row">
                  <input
                    type="text"
                    className="af-discount-input"
                    placeholder="Ingresá tu código"
                    value={codigoDescuento}
                    onChange={(e) => setCodigoDescuento(e.target.value)}
                    disabled={descuentoAplicado > 0}
                    aria-label="Código de descuento"
                  />
                  {descuentoAplicado > 0 ? (
                    <button className="af-btn af-btn-secondary af-discount-btn" type="button" onClick={limpiarDescuento}>
                      Quitar
                    </button>
                  ) : (
                    <button
                      className="af-btn af-btn-secondary af-discount-btn"
                      type="button"
                      onClick={aplicarDescuento}
                      disabled={loadingDescuento || !codigoDescuento.trim()}
                    >
                      {loadingDescuento ? <span className="af-spinner" aria-label="Validando" /> : "Aplicar"}
                    </button>
                  )}
                </div>

                {mensajeDescuento && codigoValido === true && (
                  <span className="af-discount-ok">
                    <PiCheck size={14} />{mensajeDescuento}
                    {discountData?.firstPurchaseOnly && <span className="af-tag af-tag-outline">Primera compra</span>}
                  </span>
                )}
                {mensajeDescuento && codigoValido === false && <span className="af-discount-bad">{mensajeDescuento}</span>}
                {mensajeDescuento && verificando && <span className="af-discount-info">{mensajeDescuento}</span>}

                {/* Aviso cuando hay un código de primera compra aplicado */}
                {discountData?.firstPurchaseOnly && descuentoAplicado > 0 && (
                  <span className="af-discount-info">
                    Este código es válido solo para primera compra. Si cambiás el email, el descuento se vuelve a validar.
                  </span>
                )}
              </div>

              {/* 2 · Cómo pagás */}
              <div className="af-form-block af-form-block--pay">
                <span className="af-form-step">2 · Cómo pagás</span>
                <PaymentMethodSelector
                  total={subtotalCompra}
                  descuento={descuentoAplicado}
                  onPaymentMethodChange={handlePaymentMethodChange}
                />
              </div>

              {/* Resumen */}
              <div className="af-summary">
                <span className="af-form-step">Resumen</span>
                <div className="af-summary-row"><span>Subtotal</span><span>{formatoMonto(subtotalCompra)}</span></div>
                {recargo > 0 && (
                  <div className="af-summary-row"><span>Recargo por transferencia (7,5%)</span><span>+{formatoMonto(recargo)}</span></div>
                )}
                {descuentoAplicado > 0 && (
                  <div className="af-summary-row af-summary-row--discount">
                    <span>
                      Descuento ({codigoDescuento.toUpperCase()})
                      {discountData?.firstPurchaseOnly && <span className="af-tag af-tag-outline af-summary-tag">Primera compra</span>}
                    </span>
                    <span>−{formatoMonto(descuentoAplicado)}</span>
                  </div>
                )}
                <hr className="af-hr af-summary-hr" />
                <div className="af-summary-total"><span>Total</span><span className="af-summary-totalvalue">{formatoMonto(totalFinal)}</span></div>
                <span className="af-summary-note">{esTransferencia ? "Incluye 7,5% de recargo." : "Sin recargos adicionales."}</span>
              </div>

              <div className="af-wanote">
                <FaWhatsapp size={18} className="af-wanote-icon" />
                <span>Al confirmar, te mostramos el resumen y lo mandás por WhatsApp. Ahí coordinamos stock, envío y pago.</span>
              </div>

              {/* Aviso dinámico: solo si intentó enviar y hay errores */}
              {submitCount > 0 && Object.keys(errors).length > 0 && (
                <span className="af-form-error">Recordá completar todos los campos obligatorios</span>
              )}

              <span className="af-terms">Al completar aceptás nuestros términos y condiciones.</span>

              {/* BOTÓN DE CONFIRMAR: barra fija en mobile, al final del formulario en desktop */}
              <div className="af-buybar af-buybar--compra af-buybar--checkout">
                <div className="af-buybar-total">
                  <span className="af-buybar-label">{esTransferencia ? "Total transferencia" : "Total efectivo"}</span>
                  <span className="af-buybar-value">{formatoMonto(totalFinal)}</span>
                </div>
                <button
                  className="af-btn af-btn-primary af-buybar-btn af-buybar-btn--lg"
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <span className="af-spinner" aria-hidden="true" />
                      Procesando…
                    </>
                  ) : (
                    "Confirmar compra"
                  )}
                </button>
              </div>
            </section>
          </Form>
        )}
      </Formik>

      {orderId && <Navigate to={`/thankyou/${orderId}`} />}
    </div>
  );
};

export default Checkout;
