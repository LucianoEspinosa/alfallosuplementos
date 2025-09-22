import React, { useState, useEffect } from 'react';
import Footer from './components/Footer';
import Cart from './components/Cart';
import ItemListContainer from './components/ItemListContainer';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ItemDetailContainer from './components/ItemDetailContainer';
import Error404 from './components/Error404';
import CartContextProvider from './components/context/CartContext';
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';
import ScrollToTop from './components/ScrollToTop';
import NavBar from './components/NavBar';
import Administrator from './components/Adminstrator';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import UploadProducts from './components/UploadProducts';
import NormalizadorCategorias from './components/NormalizadorCategorias';
import LoadingScreen from './components/LoadingScreen';
import OrdersList from './components/OrdersList';
import BulkSaborManager from './components/BulkSaborManager';
import DiscountCodeManager from './components/DiscountCodeManager';
import ExcelManager from './components/ExcelManager.jsx';
import RecommendedProductSelector from './components/RecommendedProductSelector.jsx';
import RecommendedProductModal from './components/RecommendedProductModal.jsx';
import FitnessApp from './components/FitnessApp/FitnessApp.jsx';
import ExcelToJsonConverter from './components/ExcelToJsonConverter.jsx';
import AdminExercises from './components/FitnessApp/AdminExercises.jsx';
import MacronutrientCalculator from './components/MacronutrientCalculator.jsx';
import PersonalizedNutritionPlan from './components/PersonalizedNutritionPlan.jsx';
import AddEjercicio from './components/FitnessApp/AddEjercicio.jsx';
import EditEjercicio from './components/FitnessApp/EditEjercicio.jsx';




function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular tiempo de carga de recursos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 segundos

    return () => clearTimeout(timer);
  }, []);

  return (

    <div>
      <CartContextProvider>
        {/* Renderiza el modal aquí, fuera del BrowserRouter */}
        <RecommendedProductModal />

        <BrowserRouter>
          {/* Pantalla de carga */}
          {isLoading && <LoadingScreen />}

          {/* Contenido principal */}
          <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
            <NavBar />
            <ScrollToTop />
            <Routes>
              <Route path={"/"} element={<ItemListContainer />} />
              <Route path={'/masvendidos'} element={<ItemListContainer top={true} titulo={"Top en Ventas"} />} />
              <Route path={'/ofertas'} element={<ItemListContainer oferta={true} titulo={"Aprovecha los descuentos"} />} />
              <Route path={'/category/:id'} element={<ItemListContainer />} />
              <Route path={'/brand/:id'} element={<ItemListContainer titulo={"Marcas"} />} />
              <Route path={'/item/:id'} element={<ItemDetailContainer />} />
              <Route path={'/cart'} element={<Cart />} />
              <Route path={'/checkout'} element={<Checkout />} />
              <Route path={'/thankyou/:orderId'} element={<ThankYou />} />
              <Route path={'*'} element={<Error404 />} />
              <Route path={'/admin'} element={<Administrator />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/edit/:id" element={<EditProduct />} />
              <Route path="/upload-products" element={<UploadProducts />} />
              <Route path="/normalizar-categorias" element={<NormalizadorCategorias />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/sabores" element={<BulkSaborManager />} />
              <Route path="/discount" element={<DiscountCodeManager />} />
              <Route path="/excel" element={<ExcelManager />} />
              <Route path="/recomendado" element={<RecommendedProductSelector />} />
              <Route path="/fitness-app" element={<FitnessApp />} />
              <Route path="/convert" element={<ExcelToJsonConverter />} />
              <Route path="/admin-ejercicios" element={<AdminExercises />} />
              <Route path="/agregar-ejercicio" element={<AddEjercicio />} />
              <Route path="/editar-ejercicio/:id" element={<EditEjercicio />} />
              <Route path="/calculadora" element={<MacronutrientCalculator />} />
              <Route path="/plan" element={<PersonalizedNutritionPlan />} />


              

            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </CartContextProvider>
    </div>
  );
}

export default App;


