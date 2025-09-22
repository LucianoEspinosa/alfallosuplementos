import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Soup, Pill, X, UtensilsCrossed, HeartCrack, Leaf, Beef, Fish, Egg, Download} from 'lucide-react';
import './PersonalizedNutritionPlan.css';

// --- CAMBIOS AGREGADOS PARA EL PDF ---
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const PersonalizedNutritionPlan = () => {
  // --- Estados del componente ---
  const [userData, setUserData] = useState({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    activityLevel: '1.2',
    goal: 'maintain',
  });

  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [selectedDislikedFoods, setSelectedDislikedFoods] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedSupplements, setSelectedSupplements] = useState([]);
  const [newCustomPreference, setNewCustomPreference] = useState('');
  const [newCustomDislikedFood, setNewCustomDislikedFood] = useState('');
  const [newCustomAllergy, setNewCustomAllergy] = useState('');

  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Datos estáticos para las selecciones ---
  const commonPreferences = [
    { name: 'Vegetariano', icon: <Leaf size={20} />, value: 'vegetariano', img: 'https://via.placeholder.com/100x70?text=Veg' },
    { name: 'Vegano', icon: <Leaf size={20} />, value: 'vegano', img: 'https://via.placeholder.com/100x70?text=Vegan' },
    { name: 'Keto', icon: <Beef size={20} />, value: 'keto', img: 'https://via.placeholder.com/100x70?text=Keto' },
    { name: 'Mediterránea', icon: <Fish size={20} />, value: 'mediterranea', img: 'https://via.placeholder.com/100x70?text=Med' },
  ];

  const commonDislikedFoods = [
    { name: 'Brócoli', icon: <UtensilsCrossed size={20} />, value: 'brocoli', img: 'https://via.placeholder.com/100x70?text=Brocoli' },
    { name: 'Pescado', icon: <Fish size={20} />, value: 'pescado', img: 'https://via.placeholder.com/100x70?text=Pescado' },
    { name: 'Huevos', icon: <Egg size={20} />, value: 'huevos', img: 'https://via.placeholder.com/100x70?text=Huevos' },
  ];

  const commonAllergies = [
    { name: 'Lactosa', icon: <HeartCrack size={20} />, value: 'lactosa', img: 'https://via.placeholder.com/100x70?text=Lactosa' },
    { name: 'Gluten', icon: <HeartCrack size={20} />, value: 'gluten', img: 'https://via.placeholder.com/100x70?text=Gluten' },
    { name: 'Maní', icon: <HeartCrack size={20} />, value: 'mani', img: 'https://via.placeholder.com/100x70?text=Mani' },
  ];

  const availableSupplements = [
    { id: 'whey', name: "Proteína de Suero (Whey Protein)", benefit: "Ideal para la recuperación muscular post-entrenamiento, esencial para ganar masa.", when: "Después de entrenar o entre comidas.", img: '' },
    { id: 'creatine', name: "Creatina Monohidratada", benefit: "Mejora la fuerza y el rendimiento en ejercicios de alta intensidad, ayuda al crecimiento muscular.", when: "Cualquier momento del día.", img: 'https://via.placeholder.com/100x70?text=Creatina' },
    { id: 'multi', name: "Multivitamínico", benefit: "Asegura la ingesta de vitaminas y minerales esenciales, apoyando la salud general.", when: "Con el desayuno.", img: 'https://via.placeholder.com/100x70?text=Multi' },
    { id: 'bcaa', name: "BCAA's", benefit: "Ayuda a prevenir el catabolismo muscular y reduce la fatiga durante entrenamientos prolongados.", when: "Durante el entrenamiento.", img: 'https://via.placeholder.com/100x70?text=BCAA' },
    { id: 'omega3', name: "Omega-3", benefit: "Apoya la salud cardiovascular, cerebral y reduce la inflamación.", when: "Con las comidas.", img: 'https://via.placeholder.com/100x70?text=Omega3' },
  ];

  // --- Manejadores de eventos ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleToggleSelection = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddCustomItem = (e, list, setList, setCustomInput) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      const newItem = e.target.value.trim();
      if (!list.includes(newItem)) {
        setList([...list, newItem]);
      }
      setCustomInput('');
      e.preventDefault();
    }
  };

  const handleRemoveCustomItem = (list, setList, itemToRemove) => {
    setList(list.filter(item => item !== itemToRemove));
  };

  const generatePlan = async () => {
    if (!userData.age || !userData.weight || !userData.height) {
      setError('Por favor, completa los campos de edad, peso y altura.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setPlan(null);

    const preferencesText = selectedPreferences.length > 0 ? selectedPreferences.join(', ') : 'Ninguna';
    const dislikedFoodsText = selectedDislikedFoods.length > 0 ? selectedDislikedFoods.join(', ') : 'Ninguno';
    const allergiesText = selectedAllergies.length > 0 ? selectedAllergies.join(', ') : 'Ninguna';
    const userSupplementsText = selectedSupplements.length > 0 ? selectedSupplements.map(s => s.name).join(', ') : 'Ninguno';
    
    const prompt = `
      Basado en el siguiente perfil, genera un plan de dieta diario. El plan debe incluir las calorías totales, la distribución de macronutrientes (proteínas, carbohidratos, grasas) y un plan de comidas detallado para un día (Desayuno, Almuerzo, Cena, y 1-2 Snacks).
      
      **Reglas clave para la generación:**
      - Considera las preferencias alimentarias, aversiones y alergias del usuario al diseñar las comidas.
      - Ajusta las proporciones de macronutrientes (especialmente proteína) según el objetivo del usuario.
      - Para cada comida (Desayuno, Almuerzo, Cena, Snacks), proporciona **tres opciones distintas**. Cada opción debe ser muy específica e incluir las **raciones exactas** (ej. en gramos, tazas, unidades) y el desglose de macronutrientes: **Proteínas, Carbohidratos y Grasas**. Haz que las recetas sean con un estilo culinario más **argentino**. Incluye opciones que incorporen proteína en polvo.
      - Incluye una sección de "Recomendaciones de Suplementos". Selecciona 1 o 2 de los suplementos disponibles que sean **MÁS ADECUADOS** para el objetivo y nivel de actividad del usuario, y que **NO** estén ya seleccionados por él. Justifica la elección y especifica cuándo tomarlo. Si el usuario ya toma lo óptimo, sugiere otro beneficio o una alternativa.
      
      Perfil del usuario:
      - Género: ${userData.gender}
      - Edad: ${userData.age} años
      - Peso: ${userData.weight} kg
      - Altura: ${userData.height} cm
      - Nivel de Actividad: ${userData.activityLevel}
      - Objetivo: ${userData.goal}
      - Preferencias alimentarias: ${preferencesText}
      - Alimentos que no le gustan: ${dislikedFoodsText}
      - Alergias/Restricciones: ${allergiesText}
      - Suplementos que ya toma o le interesan: ${userSupplementsText}
      
      Suplementos disponibles para recomendar (con sus IDs y beneficios): ${JSON.stringify(availableSupplements)}.
      
      Por favor, genera un objeto JSON con las siguientes propiedades:
      - calories (número entero)
      - protein (número entero)
      - carbs (número entero)
      - fat (número entero)
      - mealPlan (array de objetos con 'meal' (string) y 'options' (array de strings con descripciones detalladas de raciones y macronutrientes))
      - supplementRecommendations (array de objetos con 'name' (string), 'reason' (string) y 'whenToTake' (string))
      
      Asegúrate de que la respuesta sea un JSON válido y nada más.
    `;
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: "gpt-4-turbo-preview",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const aiResponse = JSON.parse(response.data.choices[0].message.content);
      setPlan(aiResponse);
    } catch (err) {
      console.error("Error al generar el plan con IA:", err.response?.data || err.message);
      setError("Ocurrió un error. Por favor, verifica tu clave API y vuelve a intentarlo.");
    } finally {
      setIsLoading(false);
    }
  };
    

 // --- CAMBIOS AGREGADOS PARA EL PDF ---
  const handleDownloadPDF = () => {
    const input = document.getElementById('results-section-to-print');
    if (input) {
      // Ocultamos el botón de descarga temporalmente para que no aparezca en el PDF
      const downloadButton = document.querySelector('.btn-success');
      if (downloadButton) downloadButton.style.display = 'none';

      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // Ancho de una página A4 en mm
        const pageHeight = 297; // Altura de una página A4 en mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Agrega la primera página
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Recorre y agrega más páginas si es necesario
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("plan-nutricional.pdf");

        // Mostramos el botón de nuevo
        if (downloadButton) downloadButton.style.display = 'inline-flex';
      });
    }
  };


  const resetForm = () => {
    setUserData({
      gender: 'male', age: '', weight: '', height: '',
      activityLevel: '1.2', goal: 'maintain',
    });
    setSelectedPreferences([]);
    setSelectedDislikedFoods([]);
    setSelectedAllergies([]);
    setSelectedSupplements([]);
    setNewCustomPreference('');
    setNewCustomDislikedFood('');
    setNewCustomAllergy('');
    setPlan(null);
    setError(null);
  };

  return (
    <div className="nutrition-plan-container">
      <h2 className="nutrition-plan-title">Tu Plan de Nutrición con IA <Sparkles className="icon-sparkles" /></h2>
      <p className="nutrition-plan-subtitle">Personaliza tu dieta y descubre los suplementos ideales para tus objetivos.</p>
      
      <div className="input-section">
        <h3 className="section-title">Tu Perfil Básico</h3>
        <div className="form-group">
          <label>Género:</label>
          <div className="radio-group">
            <label><input type="radio" name="gender" value="male" checked={userData.gender === 'male'} onChange={handleInputChange} /> Hombre</label>
            <label><input type="radio" name="gender" value="female" checked={userData.gender === 'female'} onChange={handleInputChange} /> Mujer</label>
          </div>
        </div>
        <div className="form-group">
          <label>Edad:</label>
          <input type="number" name="age" value={userData.age} onChange={handleInputChange} className="form-control" />
        </div>
        <div className="form-group">
          <label>Peso (kg):</label>
          <input type="number" name="weight" value={userData.weight} onChange={handleInputChange} className="form-control" />
        </div>
        <div className="form-group">
          <label>Altura (cm):</label>
          <input type="number" name="height" value={userData.height} onChange={handleInputChange} className="form-control" />
        </div>
        <div className="form-group">
          <label>Nivel de actividad:</label>
          <select name="activityLevel" value={userData.activityLevel} onChange={handleInputChange} className="form-control">
            <option value="1.2">Sedentaria (poco o ningún ejercicio)</option>
            <option value="1.375">Ligera (ejercicio ligero 1-3 días/semana)</option>
            <option value="1.55">Moderada (ejercicio moderado 3-5 días/semana)</option>
            <option value="1.725">Activa (ejercicio duro 6-7 días/semana)</option>
            <option value="1.9">Muy activa (ejercicio muy duro y trabajo físico)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Objetivo:</label>
          <select name="goal" value={userData.goal} onChange={handleInputChange} className="form-control">
            <option value="lose">Perder peso</option>
            <option value="maintain">Mantener peso</option>
            <option value="gain">Ganar peso/músculo</option>
          </select>
        </div>

        <h3 className="section-title mt-5">Preferencias Alimentarias</h3>
        <p className="section-description">Selecciona los tipos de dieta o alimentos que prefieres.</p>
        <div className="chips-container">
          {commonPreferences.map(pref => (
            <div
              key={pref.value}
              className={`chip ${selectedPreferences.includes(pref.value) ? 'selected' : ''}`}
              onClick={() => handleToggleSelection(selectedPreferences, setSelectedPreferences, pref.value)}
            >
              {pref.icon} {pref.name}
            </div>
          ))}
          {selectedPreferences.filter(pref => !commonPreferences.map(cp => cp.value).includes(pref)).map((pref, index) => (
            <div key={`custom-pref-${index}`} className="chip selected custom-chip">
              {pref} <X size={16} onClick={() => handleRemoveCustomItem(selectedPreferences, setSelectedPreferences, pref)} />
            </div>
          ))}
        </div>
        <div className="form-group add-custom-item">
          <input
            type="text"
            placeholder="¿Otra preferencia? Escribe y presiona Enter"
            value={newCustomPreference}
            onChange={(e) => setNewCustomPreference(e.target.value)}
            onKeyDown={(e) => handleAddCustomItem(e, selectedPreferences, setSelectedPreferences, setNewCustomPreference)}
            className="form-control"
          />
        </div>

        <h3 className="section-title mt-5">Alimentos que NO te gustan</h3>
        <p className="section-description">La IA los evitará en tu plan.</p>
        <div className="chips-container">
          {commonDislikedFoods.map(food => (
            <div
              key={food.value}
              className={`chip ${selectedDislikedFoods.includes(food.value) ? 'selected' : ''}`}
              onClick={() => handleToggleSelection(selectedDislikedFoods, setSelectedDislikedFoods, food.value)}
            >
              {food.icon} {food.name}
            </div>
          ))}
          {selectedDislikedFoods.filter(food => !commonDislikedFoods.map(cf => cf.value).includes(food)).map((food, index) => (
            <div key={`custom-disliked-${index}`} className="chip selected custom-chip">
              {food} <X size={16} onClick={() => handleRemoveCustomItem(selectedDislikedFoods, setSelectedDislikedFoods, food)} />
            </div>
          ))}
        </div>
        <div className="form-group add-custom-item">
          <input
            type="text"
            placeholder="¿Otro alimento que no te gusta? Escribe y presiona Enter"
            value={newCustomDislikedFood}
            onChange={(e) => setNewCustomDislikedFood(e.target.value)}
            onKeyDown={(e) => handleAddCustomItem(e, selectedDislikedFoods, setSelectedDislikedFoods, setNewCustomDislikedFood)}
            className="form-control"
          />
        </div>

        <h3 className="section-title mt-5">Alergias o Restricciones</h3>
        <p className="section-description">Muy importante para tu seguridad.</p>
        <div className="chips-container">
          {commonAllergies.map(allergy => (
            <div
              key={allergy.value}
              className={`chip ${selectedAllergies.includes(allergy.value) ? 'selected' : ''}`}
              onClick={() => handleToggleSelection(selectedAllergies, setSelectedAllergies, allergy.value)}
            >
              {allergy.icon} {allergy.name}
            </div>
          ))}
          {selectedAllergies.filter(allergy => !commonAllergies.map(ca => ca.value).includes(allergy)).map((allergy, index) => (
            <div key={`custom-allergy-${index}`} className="chip selected custom-chip">
              {allergy} <X size={16} onClick={() => handleRemoveCustomItem(selectedAllergies, setSelectedAllergies, allergy)} />
            </div>
          ))}
        </div>
        <div className="form-group add-custom-item">
          <input
            type="text"
            placeholder="¿Otra alergia o restricción? Escribe y presiona Enter"
            value={newCustomAllergy}
            onChange={(e) => setNewCustomAllergy(e.target.value)}
            onKeyDown={(e) => handleAddCustomItem(e, selectedAllergies, setSelectedAllergies, setNewCustomAllergy)}
            className="form-control"
          />
        </div>

        <h3 className="section-title mt-5">Suplementos que ya utilizas o te interesan</h3>
        <p className="section-description">La IA tendrá esto en cuenta al hacer sus recomendaciones.</p>
        <div className="supplement-cards-container">
          {availableSupplements.map(sup => (
            <div
              key={sup.id}
              className={`supplement-card ${selectedSupplements.some(s => s.id === sup.id) ? 'selected' : ''}`}
              onClick={() => handleToggleSelection(selectedSupplements, setSelectedSupplements, sup)}
            >
              <img src={sup.img} alt={sup.name} className="supplement-img" />
              <h5 className="supplement-name">{sup.name}</h5>
              <p className="supplement-benefit">{sup.benefit}</p>
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}
        <div className="button-group">
          <button onClick={generatePlan} className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Generando Plan...' : 'Generar Plan Personalizado con IA'} <Sparkles />
          </button>
          <button onClick={resetForm} className="btn-secondary">Reiniciar <X /></button>
           {/* --- CAMBIOS AGREGADOS: BOTÓN DE DESCARGA --- */}
          {plan && (
            <button onClick={handleDownloadPDF} className="btn-success">
              Descargar PDF <Download />
            </button>
          )}
          {/* --- FIN DE CAMBIOS AGREGADOS --- */}
        </div>
      </div>
      
      {plan && (
        <div className="results-section" id="results-section-to-print">
          <h3 className="section-title">Tu Plan Nutricional Sugerido</h3>
          
          <div className="macros-summary">
            <div className="macro-card primary-bg">
              <h4>Calorías</h4>
              <p className="macro-value">{plan.calories}</p>
              <span className="macro-unit">kcal diarias</span>
            </div>
            <div className="macro-card danger-bg">
              <h4>Proteínas</h4>
              <p className="macro-value">{plan.protein}g</p>
              <span className="macro-unit">gramos diarios</span>
            </div>
            <div className="macro-card success-bg">
              <h4>Carbohidratos</h4>
              <p className="macro-value">{plan.carbs}g</p>
              <span className="macro-unit">gramos diarios</span>
            </div>
            <div className="macro-card warning-bg">
              <h4>Grasas</h4>
              <p className="macro-value">{plan.fat}g</p>
              <span className="macro-unit">gramos diarios</span>
            </div>
          </div>
          
          <div className="meal-plan-section">
            <h4 className="section-subtitle"><Soup className="icon-meal" /> Plan de Comidas Diario</h4>
            {plan.mealPlan.map((meal, index) => (
              <div key={index} className="meal-card">
                <h5 className="meal-title">{meal.meal}</h5>
                <ul className="meal-options-list">
                  {meal.options.map((option, optIndex) => (
                    <li key={optIndex} className="meal-option-item">
                      <strong>Opción {optIndex + 1}:</strong> {option}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="supplements-recommendation-section">
            <h4 className="section-subtitle"><Pill className="icon-pill" /> Suplementos Recomendados</h4>
            {plan.supplementRecommendations.map((supplement, index) => (
              <div key={index} className="recommended-supplement-card">
                <h5 className="recommended-supplement-name">{supplement.name}</h5>
                <p className="recommended-supplement-reason">**Por qué:** {supplement.reason}</p>
                <p className="recommended-supplement-when">**Cuándo tomarlo:** {supplement.whenToTake}</p>
              </div>
            ))}
          </div>
          
          <p className="disclaimer">
            Nota: Estos valores y recomendaciones son una estimación generada por IA. Consulta con un profesional de la salud o nutricionista para un plan completamente personalizado y adaptado a tus necesidades específicas.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalizedNutritionPlan;