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
import AdminRoute from './components/AdminRoute.jsx';




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
              <Route path={'/admin'} element={<AdminRoute><Administrator /></AdminRoute>} />
              <Route path="/add-product" element={<AdminRoute><AddProduct /></AdminRoute>} />
              <Route path="/edit/:id" element={<AdminRoute><EditProduct /></AdminRoute>} />
              <Route path="/upload-products" element={<AdminRoute><UploadProducts /></AdminRoute>} />
              <Route path="/normalizar-categorias" element={<AdminRoute><NormalizadorCategorias /></AdminRoute>} />
              <Route path="/orders" element={<AdminRoute><OrdersList /></AdminRoute>} />
              <Route path="/sabores" element={<AdminRoute><BulkSaborManager /></AdminRoute>} />
              <Route path="/discount" element={<AdminRoute><DiscountCodeManager /></AdminRoute>} />
              <Route path="/excel" element={<AdminRoute><ExcelManager /></AdminRoute>} />
              <Route path="/recomendado" element={<AdminRoute><RecommendedProductSelector /></AdminRoute>} />
              <Route path="/fitness-app" element={<FitnessApp />} />
              <Route path="/convert" element={<AdminRoute><ExcelToJsonConverter /></AdminRoute>} />
              <Route path="/admin-ejercicios" element={<AdminRoute><AdminExercises /></AdminRoute>} />
              <Route path="/agregar-ejercicio" element={<AdminRoute><AddEjercicio /></AdminRoute>} />
              <Route path="/editar-ejercicio/:id" element={<AdminRoute><EditEjercicio /></AdminRoute>} />
              <Route path="/calculadora" element={<MacronutrientCalculator />} />
              <Route path="/plan" element={<PersonalizedNutritionPlan />} />
              <Route path={'*'} element={<Error404 />} />


              

            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </CartContextProvider>
    </div>
  );
}

export default App;


