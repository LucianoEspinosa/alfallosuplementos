// import React, { useState } from 'react';

// const MacronutrientCalculator = () => {
//     // Estados para los datos del usuario
//     const [userData, setUserData] = useState({
//         gender: 'male',
//         age: '',
//         weight: '',
//         height: '',
//         activityLevel: '1.2',
//         goal: 'maintain'
//     });

//     // Estados para los resultados
//     const [results, setResults] = useState(null);

//     // Manejar cambios en los inputs
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setUserData({
//             ...userData,
//             [name]: value
//         });
//     };

//     // Calcular los macronutrientes
//     const calculateMacros = () => {
//         // Validar que todos los campos estén completos
//         if (!userData.age || !userData.weight || !userData.height) {
//             alert('Por favor, completa todos los campos');
//             return;
//         }

//         // Convertir a números
//         const weight = parseFloat(userData.weight);
//         const height = parseFloat(userData.height);
//         const age = parseFloat(userData.age);
//         const activityLevel = parseFloat(userData.activityLevel);

//         // Cálculo de TMB (Tasa Metabólica Basal) usando la ecuación de Mifflin-St Jeor
//         let bmr;
//         if (userData.gender === 'male') {
//             bmr = 10 * weight + 6.25 * height - 5 * age + 5;
//         } else {
//             bmr = 10 * weight + 6.25 * height - 5 * age - 161;
//         }

//         // Calorías de mantenimiento
//         let maintenanceCalories = bmr * activityLevel;

//         // Ajustar calorías según el objetivo
//         let targetCalories;
//         switch (userData.goal) {
//             case 'lose':
//                 targetCalories = maintenanceCalories - 500;
//                 break;
//             case 'gain':
//                 targetCalories = maintenanceCalories + 500;
//                 break;
//             default:
//                 targetCalories = maintenanceCalories;
//         }

//         // Calcular macronutrientes (proporciones estándar)
//         const proteinGrams = weight * 2.2; // 2.2g de proteína por kg de peso
//         const proteinCalories = proteinGrams * 4;

//         // Las grasas serán el 25% del total de calorías
//         const fatCalories = targetCalories * 0.25;
//         const fatGrams = fatCalories / 9;

//         // Los carbohidratos completan el resto
//         const carbCalories = targetCalories - proteinCalories - fatCalories;
//         const carbGrams = carbCalories / 4;

//         // Guardar resultados
//         setResults({
//             calories: Math.round(targetCalories),
//             protein: Math.round(proteinGrams),
//             carbs: Math.round(carbGrams),
//             fat: Math.round(fatGrams)
//         });
//     };

//     // Resetear el formulario
//     const resetForm = () => {
//         setUserData({
//             gender: 'male',
//             age: '',
//             weight: '',
//             height: '',
//             activityLevel: '1.2',
//             goal: 'maintain'
//         });
//         setResults(null);
//     };

//     return (
//         <div style={{
//             maxWidth: '600px',
//             margin: '0 auto',
//             padding: '20px',
//             fontFamily: 'Arial, sans-serif',
//             backgroundColor: '#f5f7f9',
//             borderRadius: '10px',
//             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
//         }}>
//             <h2 style={{ color: '#2c3e50', textAlign: 'center' }}>Calculadora de Macronutrientes</h2>

//             <div style={{
//                 backgroundColor: 'white',
//                 padding: '20px',
//                 borderRadius: '8px',
//                 marginBottom: '20px'
//             }}>
//                 <div style={{ marginBottom: '15px' }}>
//                     <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Género:</label>
//                     <div>
//                         <label style={{ marginRight: '15px' }}>
//                             <input
//                                 type="radio"
//                                 name="gender"
//                                 value="male"
//                                 checked={userData.gender === 'male'}
//                                 onChange={handleInputChange}
//                                 style={{ marginRight: '5px' }}
//                             />
//                             Hombre
//                         </label>
//                         <label>
//                             <input
//                                 type="radio"
//                                 name="gender"
//                                 value="female"
//                                 checked={userData.gender === 'female'}
//                                 onChange={handleInputChange}
//                                 style={{ marginRight: '5px' }}
//                             />
//                             Mujer
//                         </label>
//                     </div>
//                 </div>

//                 <div style={{ marginBottom: '15px' }}>
//                     <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Edad:</label>
//                     <input
//                         type="number"
//                         name="age"
//                         value={userData.age}
//                         onChange={handleInputChange}
//                         style={{
//                             width: '100%',
//                             padding: '8px',
//                             border: '1px solid #ddd',
//                             borderRadius: '4px'
//                         }}
//                     />
//                 </div>

//                 <div style={{ marginBottom: '15px' }}>
//                     <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Peso (kg):</label>
//                     <input
//                         type="number"
//                         name="weight"
//                         value={userData.weight}
//                         onChange={handleInputChange}
//                         style={{
//                             width: '100%',
//                             padding: '8px',
//                             border: '1px solid #ddd',
//                             borderRadius: '4px'
//                         }}
//                     />
//                 </div>

//                 <div style={{ marginBottom: '15px' }}>
//                     <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Altura (cm):</label>
//                     <input
//                         type="number"
//                         name="height"
//                         value={userData.height}
//                         onChange={handleInputChange}
//                         style={{
//                             width: '100%',
//                             padding: '8px',
//                             border: '1px solid #ddd',
//                             borderRadius: '4px'
//                         }}
//                     />
//                 </div>

//                 <div style={{ marginBottom: '15px' }}>
//                     <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nivel de actividad:</label>
//                     <select
//                         name="activityLevel"
//                         value={userData.activityLevel}
//                         onChange={handleInputChange}
//                         style={{
//                             width: '100%',
//                             padding: '8px',
//                             border: '1px solid #ddd',
//                             borderRadius: '4px'
//                         }}
//                     >
//                         <option value="1.2">Sedentario (poco o ningún ejercicio)</option>
//                         <option value="1.375">Ligera (ejercicio ligero 1-3 días/semana)</option>
//                         <option value="1.55">Moderada (ejercicio moderado 3-5 días/semana)</option>
//                         <option value="1.725">Activa (ejercicio duro 6-7 días/semana)</option>
//                         <option value="1.9">Muy activa (ejercicio muy duro y trabajo físico)</option>
//                     </select>
//                 </div>

//                 <div style={{ marginBottom: '20px' }}>
//                     <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Objetivo:</label>
//                     <select
//                         name="goal"
//                         value={userData.goal}
//                         onChange={handleInputChange}
//                         style={{
//                             width: '100%',
//                             padding: '8px',
//                             border: '1px solid #ddd',
//                             borderRadius: '4px'
//                         }}
//                     >
//                         <option value="lose">Perder peso</option>
//                         <option value="maintain">Mantener peso</option>
//                         <option value="gain">Ganar peso/músculo</option>
//                     </select>
//                 </div>

//                 <div style={{ display: 'flex', gap: '10px' }}>
//                     <button
//                         onClick={calculateMacros}
//                         style={{
//                             padding: '10px 20px',
//                             backgroundColor: '#3498db',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '4px',
//                             cursor: 'pointer',
//                             flex: 1
//                         }}
//                     >
//                         Calcular
//                     </button>
//                     <button
//                         onClick={resetForm}
//                         style={{
//                             padding: '10px 20px',
//                             backgroundColor: '#e74c3c',
//                             color: 'white',
//                             border: 'none',
//                             borderRadius: '4px',
//                             cursor: 'pointer',
//                             flex: 1
//                         }}
//                     >
//                         Reiniciar
//                     </button>
//                 </div>
//             </div>

//             {results && (
//                 <div style={{
//                     backgroundColor: 'white',
//                     padding: '20px',
//                     borderRadius: '8px',
//                     textAlign: 'center'
//                 }}>
//                     <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Resultados</h3>

//                     <div style={{
//                         display: 'grid',
//                         gridTemplateColumns: 'repeat(2, 1fr)',
//                         gap: '15px',
//                         marginBottom: '20px'
//                     }}>
//                         <div style={{
//                             padding: '15px',
//                             backgroundColor: '#e8f4fc',
//                             borderRadius: '8px'
//                         }}>
//                             <h4 style={{ margin: '0', color: '#3498db' }}>Calorías</h4>
//                             <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{results.calories}</p>
//                             <p style={{ margin: '0', fontSize: '14px', color: '#7f8c8d' }}>kcal diarias</p>
//                         </div>

//                         <div style={{
//                             padding: '15px',
//                             backgroundColor: '#fce8e8',
//                             borderRadius: '8px'
//                         }}>
//                             <h4 style={{ margin: '0', color: '#e74c3c' }}>Proteínas</h4>
//                             <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{results.protein}g</p>
//                             <p style={{ margin: '0', fontSize: '14px', color: '#7f8c8d' }}>gramos diarios</p>
//                         </div>

//                         <div style={{
//                             padding: '15px',
//                             backgroundColor: '#e8fce8',
//                             borderRadius: '8px'
//                         }}>
//                             <h4 style={{ margin: '0', color: '#27ae60' }}>Carbohidratos</h4>
//                             <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{results.carbs}g</p>
//                             <p style={{ margin: '0', fontSize: '14px', color: '#7f8c8d' }}>gramos diarios</p>
//                         </div>

//                         <div style={{
//                             padding: '15px',
//                             backgroundColor: '#fcf3e8',
//                             borderRadius: '8px'
//                         }}>
//                             <h4 style={{ margin: '0', color: '#f39c12' }}>Grasas</h4>
//                             <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{results.fat}g</p>
//                             <p style={{ margin: '0', fontSize: '14px', color: '#7f8c8d' }}>gramos diarios</p>
//                         </div>
//                     </div>

//                     <p style={{ fontSize: '14px', color: '#7f8c8d', fontStyle: 'italic' }}>
//                         Nota: Estos valores son una estimación. Consulta con un profesional de la salud para un plan personalizado.
//                     </p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default MacronutrientCalculator;

import React, { useState } from 'react';

const MacronutrientCalculator = () => {
  // Estados para los datos del usuario
  const [userData, setUserData] = useState({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    activityLevel: '1.2',
    goal: 'maintain'
  });
  
  // Estados para los resultados
  const [results, setResults] = useState(null);
  
  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  // Calcular los macronutrientes
  const calculateMacros = () => {
    // Validar que todos los campos estén completos
    if (!userData.age || !userData.weight || !userData.height) {
      alert('Por favor, completa todos los campos');
      return;
    }
    
    // Convertir a números
    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.height);
    const age = parseFloat(userData.age);
    const activityLevel = parseFloat(userData.activityLevel);
    
    // Cálculo de TMB (Tasa Metabólica Basal) usando la ecuación de Mifflin-St Jeor
    let bmr;
    if (userData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Calorías de mantenimiento
    let maintenanceCalories = bmr * activityLevel;
    
    // Ajustar calorías según el objetivo
    let targetCalories;
    switch(userData.goal) {
      case 'lose':
        targetCalories = maintenanceCalories - 500;
        break;
      case 'gain':
        targetCalories = maintenanceCalories + 500;
        break;
      default:
        targetCalories = maintenanceCalories;
    }
    
    // Calcular macronutrientes (proporciones estándar)
    const proteinGrams = weight * 2.2; // 2.2g de proteína por kg de peso
    const proteinCalories = proteinGrams * 4;
    
    // Las grasas serán el 25% del total de calorías
    const fatCalories = targetCalories * 0.25;
    const fatGrams = fatCalories / 9;
    
    // Los carbohidratos completan el resto
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbGrams = carbCalories / 4;
    
    // Guardar resultados
    setResults({
      calories: Math.round(targetCalories),
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbGrams),
      fat: Math.round(fatGrams)
    });
  };
  
  // Resetear el formulario
  const resetForm = () => {
    setUserData({
      gender: 'male',
      age: '',
      weight: '',
      height: '',
      activityLevel: '1.2',
      goal: 'maintain'
    });
    setResults(null);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#2c3e50',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      color: '#ecf0f1'
    }}>
      <h2 style={{color: '#3498db', textAlign: 'center', marginBottom: '30px'}}>Calculadora de Macronutrientes</h2>
      
      <div style={{
        backgroundColor: '#34495e',
        padding: '25px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ecf0f1'}}>Género:</label>
          <div>
            <label style={{marginRight: '15px', color: '#ecf0f1'}}>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={userData.gender === 'male'}
                onChange={handleInputChange}
                style={{marginRight: '5px'}}
              />
              Hombre
            </label>
            <label style={{color: '#ecf0f1'}}>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={userData.gender === 'female'}
                onChange={handleInputChange}
                style={{marginRight: '5px'}}
              />
              Mujer
            </label>
          </div>
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ecf0f1'}}>Edad:</label>
          <input
            type="number"
            name="age"
            value={userData.age}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #2c3e50',
              borderRadius: '4px',
              backgroundColor: '#ecf0f1',
              color: '#2c3e50'
            }}
          />
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ecf0f1'}}>Peso (kg):</label>
          <input
            type="number"
            name="weight"
            value={userData.weight}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #2c3e50',
              borderRadius: '4px',
              backgroundColor: '#ecf0f1',
              color: '#2c3e50'
            }}
          />
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ecf0f1'}}>Altura (cm):</label>
          <input
            type="number"
            name="height"
            value={userData.height}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #2c3e50',
              borderRadius: '4px',
              backgroundColor: '#ecf0f1',
              color: '#2c3e50'
            }}
          />
        </div>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ecf0f1'}}>Nivel de actividad:</label>
          <select
            name="activityLevel"
            value={userData.activityLevel}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #2c3e50',
              borderRadius: '4px',
              backgroundColor: '#ecf0f1',
              color: '#2c3e50'
            }}
          >
            <option value="1.2">Sedentario (poco o ningún ejercicio)</option>
            <option value="1.375">Ligera (ejercicio ligero 1-3 días/semana)</option>
            <option value="1.55">Moderada (ejercicio moderado 3-5 días/semana)</option>
            <option value="1.725">Activa (ejercicio duro 6-7 días/semana)</option>
            <option value="1.9">Muy activa (ejercicio muy duro y trabajo físico)</option>
          </select>
        </div>
        
        <div style={{marginBottom: '20px'}}>
          <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ecf0f1'}}>Objetivo:</label>
          <select
            name="goal"
            value={userData.goal}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #2c3e50',
              borderRadius: '4px',
              backgroundColor: '#ecf0f1',
              color: '#2c3e50'
            }}
          >
            <option value="lose">Perder peso</option>
            <option value="maintain">Mantener peso</option>
            <option value="gain">Ganar peso/músculo</option>
          </select>
        </div>
        
        <div style={{display: 'flex', gap: '10px'}}>
          <button
            onClick={calculateMacros}
            style={{
              padding: '12px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1,
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Calcular
          </button>
          <button
            onClick={resetForm}
            style={{
              padding: '12px 20px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1,
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Reiniciar
          </button>
        </div>
      </div>
      
      {results && (
        <div style={{
          backgroundColor: '#34495e',
          padding: '25px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{color: '#3498db', marginBottom: '20px', borderBottom: '2px solid #3498db', paddingBottom: '10px'}}>Resultados</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '15px',
              backgroundColor: '#2980b9',
              borderRadius: '8px',
              color: 'white'
            }}>
              <h4 style={{margin: '0', color: '#ecf0f1'}}>Calorías</h4>
              <p style={{fontSize: '24px', fontWeight: 'bold', margin: '10px 0'}}>{results.calories}</p>
              <p style={{margin: '0', fontSize: '14px', color: '#ecf0f1'}}>kcal diarias</p>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: '#c0392b',
              borderRadius: '8px',
              color: 'white'
            }}>
              <h4 style={{margin: '0', color: '#ecf0f1'}}>Proteínas</h4>
              <p style={{fontSize: '24px', fontWeight: 'bold', margin: '10px 0'}}>{results.protein}g</p>
              <p style={{margin: '0', fontSize: '14px', color: '#ecf0f1'}}>gramos diarios</p>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: '#27ae60',
              borderRadius: '8px',
              color: 'white'
            }}>
              <h4 style={{margin: '0', color: '#ecf0f1'}}>Carbohidratos</h4>
              <p style={{fontSize: '24px', fontWeight: 'bold', margin: '10px 0'}}>{results.carbs}g</p>
              <p style={{margin: '0', fontSize: '14px', color: '#ecf0f1'}}>gramos diarios</p>
            </div>
            
            <div style={{
              padding: '15px',
              backgroundColor: '#f39c12',
              borderRadius: '8px',
              color: 'white'
            }}>
              <h4 style={{margin: '0', color: '#ecf0f1'}}>Grasas</h4>
              <p style={{fontSize: '24px', fontWeight: 'bold', margin: '10px 0'}}>{results.fat}g</p>
              <p style={{margin: '0', fontSize: '14px', color: '#ecf0f1'}}>gramos diarios</p>
            </div>
          </div>
          
          <p style={{fontSize: '14px', color: '#bdc3c7', fontStyle: 'italic', borderTop: '1px solid #7f8c8d', paddingTop: '15px'}}>
            Nota: Estos valores son una estimación. Consulta con un profesional de la salud para un plan personalizado.
          </p>
        </div>
      )}
    </div>
  );
};

export default MacronutrientCalculator;