

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
// import { Dumbbell, Calendar, Target, Clock, Plus, Trash2, Save, Brain, Activity } from 'lucide-react';

// // Componentes importados
// import WorkoutForm from './WorkoutForm';
// import RoutineDisplay from './RoutineDisplay';
// import RoutineBuilder from './RoutineBuilder';
// import ExerciseList from './ExerciseList';
// import ExerciseDetailsModal from './ExerciseDetailsModal';
// import Loading from './Loading'; // <-- NUEVA IMPORTACIÓN

// // Hooks y bases de datos
// import useAuth from '../hooks/useAuth';
// import { db } from '../index.js';

// const useFitnessRoutine = () => {
//     const [workoutData, setWorkoutData] = useState({
//         goal: 'weight_loss',
//         level: 'beginner',
//         days: 3,
//         availableTime: 45,
//         gender: '',
//         age: '',
//         weight: '',
//         height: '',
//         location: '',
//         equipment: ''
//     });

//     const [selectedSplit, setSelectedSplit] = useState(null);
//     const [recommendedSplits, setRecommendedSplits] = useState(null);
//     const [generatedRoutine, setGeneratedRoutine] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [customRoutine, setCustomRoutine] = useState([]);
//     const [showExerciseList, setShowExerciseList] = useState(false);
//     const [selectedExercise, setSelectedExercise] = useState(null);
//     const [allExercises, setAllExercises] = useState([]);
//     const [filteredExercises, setFilteredExercises] = useState([]);
//     const [selectedRegion, setSelectedRegion] = useState('');
//     const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
//     const [availableRegions, setAvailableRegions] = useState([]);
//     const [availableMuscleGroups, setAvailableMuscleGroups] = useState([]);
//     const [addedExercisesFromAI, setAddedExercisesFromAI] = useState([]); // <-- NUEVO ESTADO

//     useEffect(() => {
//         const fetchExercisesFromFirestore = async () => {
//             try {
//                 const querySnapshot = await getDocs(collection(db, "ejercicios"));
//                 const exercises = querySnapshot.docs.map(doc => {
//                     const data = doc.data();
//                     return {
//                         id: doc.id,
//                         nombre: data.nombre,
//                         descripcion: data.descripcion,
//                         grupo_muscular: data.grupo_muscular,
//                         region_cuerpo: data.region_cuerpo,
//                         imagen: data.imagen,
//                         videoUrl: data.video
//                     };
//                 });
//                 if (exercises.length > 0) {
//                     setAllExercises(exercises);
//                     setAvailableRegions(getUniqueValues(exercises, 'region_cuerpo'));
//                     setAvailableMuscleGroups(getUniqueValues(exercises, 'grupo_muscular'));
//                 }
//             } catch (error) {
//                 console.error("Error al obtener ejercicios de Firestore:", error);
//             }
//         };
//         fetchExercisesFromFirestore();
//     }, []);

//     const getUniqueValues = (data, key) => {
//         if (!data || data.length === 0) return [];
//         const values = data.map(item => item[key]).filter(Boolean);
//         return [...new Set(values)];
//     };

//     useEffect(() => {
//         let currentExercises = [...allExercises];
//         if (selectedRegion) {
//             currentExercises = currentExercises.filter(ex => ex.region_cuerpo === selectedRegion);
//         }
//         if (selectedMuscleGroup) {
//             currentExercises = currentExercises.filter(ex => ex.grupo_muscular === selectedMuscleGroup);
//         }
//         setFilteredExercises(currentExercises);
//     }, [selectedRegion, selectedMuscleGroup, allExercises]);

//     const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
//     const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

//     const searchExercises = () => {
//         setShowExerciseList(true);
//     };

//     const enrichRoutineWithDetails = (aiRoutine, allExercises) => {
//         const enrichedRoutine = {
//             days: aiRoutine.days.map(day => ({
//                 ...day,
//                 exercises: day.exercises.map(exerciseFromAI => {
//                     const fullExerciseDetails = allExercises.find(
//                         ex => ex.nombre.toLowerCase() === exerciseFromAI.name.toLowerCase()
//                     );
//                     return {
//                         ...exerciseFromAI,
//                         ...fullExerciseDetails,
//                         id: fullExerciseDetails ? fullExerciseDetails.id : Date.now() + Math.random()
//                     };
//                 })
//             }))
//         };
//         return enrichedRoutine;
//     };

//     const fetchRecommendedSplits = async () => {
//         setIsLoading(true);
//         const prompt = `
//             Basado en los siguientes datos de usuario, recomienda 2 o 3 tipos de rutina de entrenamiento (split) que sean los más adecuados.
//             Tu respuesta debe ser un objeto JSON con una propiedad "recommendedSplits" que contenga un array de objetos.
//             Cada objeto en el array debe tener las propiedades: "name" (string con el nombre del split) y "reason" (string con una breve explicación de por qué se recomienda).
//             Los nombres de los splits deben ser uno de estos: "Full Body", "Torso / Pierna", "Push / Pull / Legs" o "Arnold Split".

//             --- Datos del usuario ---
//             Días por semana: ${workoutData.days}
//             Nivel de actividad: ${workoutData.level}
//             Tiempo disponible: ${workoutData.availableTime} minutos

//             **Reglas para la recomendación:**
//             - Si los días son 1 o 2, la mejor opción es "Full Body".
//             - Si los días son 3, las mejores opciones son "Full Body" (para principiantes/intermedios) y "Torso / Pierna" o "Push / Pull / Legs" (para avanzados).
//             - Si los días son 4, las mejores opciones son "Torso / Pierna" y "Push / Pull / Legs".
//             - Si los días son 5 o 6, las mejores opciones son "Push / Pull / Legs" o "Arnold Split".
//             - Si los días son 7, la mejor opción es "Arnold Split" o una variante de "Push / Pull / Legs".

//             Elige las 2 o 3 opciones más adecuadas y proporciona una breve razón para cada una.
//             Retorna solo el objeto JSON.
//         `;
//         try {
//             const response = await axios.post(
//                 OPENAI_API_URL,
//                 {
//                     model: "gpt-4o-mini",
//                     messages: [{ role: "user", content: prompt }],
//                     response_format: { type: "json_object" }
//                 },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${OPENAI_API_KEY}`
//                     }
//                 }
//             );
//             const aiResponse = JSON.parse(response.data.choices[0].message.content);
//             setRecommendedSplits(aiResponse.recommendedSplits);
//         } catch (error) {
//             console.error("Error al obtener las recomendaciones de splits:", error.response?.data || error.message);
//             setRecommendedSplits([
//                 { name: "Full Body", reason: "Opción recomendada para la mayoría de los niveles y tiempos." },
//                 { name: "Torso / Pierna", reason: "Excelente para 4 días a la semana, optimizando el volumen." }
//             ]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const onSelectSplit = async (splitName) => {
//         setIsLoading(true);
//         setSelectedSplit(splitName);
//         setRecommendedSplits(null);
//         setGeneratedRoutine(null); // Resetear rutina generada para mostrar el estado de carga
//         const restTimes = {
//             weight_loss: 45,
//             muscle_gain: 90,
//             default: 60
//         };
//         const recommendedRest = restTimes[workoutData.goal] || restTimes.default;
//         const getSplitLogic = (split) => {
//             switch (split) {
//                 case "Full Body":
//                     return `- El 'focus' de todos los días debe ser "Cuerpo Completo".
//                              - Incluye ejercicios que trabajen la mayoría de los grupos musculares grandes (piernas, pecho, espalda, hombros, brazos).
//                              - Reparte los ejercicios para que cada día se trabaje todo el cuerpo.`;
//                 case "Torso / Pierna":
//                     return `- Los días de Torso deben incluir ejercicios para Pecho, Espalda, Hombros y Brazos.
//                              - Los días de Pierna deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 case "Push / Pull / Legs":
//                     return `- Los días de Empuje (Push) deben incluir ejercicios para Pecho, Hombros y Tríceps.
//                              - Los días de Tirón (Pull) deben incluir ejercicios para Espalda y Bíceps.
//                              - Los días de Piernas (Legs) deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 case "Arnold Split":
//                     return `- Los días de Pecho y Espalda deben incluir ejercicios de ambos grupos musculares.
//                              - Los días de Hombros y Brazos deben incluir ejercicios de Hombros, Bíceps y Tríceps.
//                              - Los días de Piernas deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 default:
//                     return "";
//             }
//         };
//         const getLevelLogic = (level) => {
//             switch (level) {
//                 case "beginner":
//                     return `- Número de series: 2-3 por ejercicio.
//                              - Rango de repeticiones: 10-15.
//                              - Ejercicios: Simples, con técnica fácil de aprender.
//                              - Número de ejercicios por día: 4-6.`;
//                 case "intermediate":
//                     return `- Número de series: 3-4 por ejercicio.
//                              - Rango de repeticiones: 8-12.
//                              - Ejercicios: Una mezcla de básicos y compuestos.
//                              - Número de ejercicios por día: 5-8.`;
//                 case "advanced":
//                     return `- Número de series: 4-5 por ejercicio.
//                              - Rango de repeticiones: 6-10.
//                              - Ejercicios: Principalmente compuestos, con ejercicios de aislamiento si el tiempo lo permite.
//                              - Número de ejercicios por día: 7-10.`;
//                 default:
//                     return "";
//             }
//         };
//         const prompt = `
//             Genera una rutina de fitness en español para una persona con los siguientes datos.
//             El formato de la respuesta debe ser un objeto JSON con una propiedad "days", que es un array de objetos.
//             Cada objeto de "days" debe tener dos propiedades: "focus" (un string) y "exercises" (un array de objetos).
//             Cada objeto de "exercises" debe tener "name" (string), "sets" (número), "reps" (número), y "rest" (número, en segundos).

//             --- Datos del usuario ---
//             Objetivo: ${workoutData.goal}
//             Nivel de actividad: ${workoutData.level}
//             Días por semana: ${workoutData.days}
//             División de rutina (Split): ${splitName}
//             Tiempo disponible: ${workoutData.availableTime} minutos
//             Edad: ${workoutData.age} años
//             Peso: ${workoutData.weight} kg
//             Altura: ${workoutData.height} cm

//             **INSTRUCCIONES CLAVE PARA LA GENERACIÓN DE LA RUTINA:**

//             1. **TIEMPO DE DESCANSO:** Para cada ejercicio, usa un tiempo de descanso de ${recommendedRest} segundos, ya que es el tiempo recomendado para el objetivo de ${workoutData.goal}.

//             2. **REGLAS PARA LA DIVISIÓN DE RUTINA (SPLIT):**
//             ${getSplitLogic(splitName)}

//             3. **REGLAS PARA CADA NIVEL:**
//             ${getLevelLogic(workoutData.level)}

//             4. **NÚMERO DE EJERCICIOS POR DÍA:**
//             - El número total de ejercicios por día debe ser suficiente para completar la rutina en ${workoutData.availableTime} minutos.
//             - Usa un cálculo aproximado de 5-7 minutos por ejercicio (incluyendo sets y descanso) para determinar la cantidad de ejercicios adecuada.
//             - Prioriza el volumen de ejercicios más alto dentro del rango permitido por el tiempo y el nivel del usuario.

//             Basándote en estos datos y en las reglas anteriores, genera una rutina que sea estrictamente adecuada para el nivel, edad, peso, altura, tiempo disponible y el split elegido por el usuario.
//             Elige los nombres de los ejercicios de una lista conocida por ti, como "Sentadillas", "Dominadas", "Flexiones", "Plancha", etc.

//             Ejemplo del formato JSON:
//             {
//                 "days": [
//                     {
//                         "focus": "Tren Superior",
//                         "exercises": [
//                             { "name": "Flexiones de pecho", "sets": 3, "reps": 10, "rest": 60 },
//                             { "name": "Fondos de tríceps", "sets": 3, "reps": 12, "rest": 60 }
//                         ]
//                     }
//                 ]
//             }
//         `;
//         try {
//             const response = await axios.post(
//                 OPENAI_API_URL,
//                 {
//                     model: "gpt-4o-mini",
//                     messages: [{ role: "user", content: prompt }],
//                     response_format: { type: "json_object" }
//                 },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${OPENAI_API_KEY}`
//                     }
//                 }
//             );
//             const aiResponse = JSON.parse(response.data.choices[0].message.content);
//             const enrichedRoutine = enrichRoutineWithDetails(aiResponse, allExercises);
//             setGeneratedRoutine(enrichedRoutine);
//         } catch (error) {
//             console.error("Error al generar la rutina con IA:", error.response?.data || error.message);
//             setGeneratedRoutine(generateSampleRoutine(workoutData, splitName));
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Función para añadir un ejercicio a la rutina personalizada desde la IA
//     const handleAddToCustomFromAI = (exercise, dayIndex) => {
//         addToCustomRoutine(exercise, dayIndex);
//         setAddedExercisesFromAI(prev => [...prev, exercise.id]);
//     };

//     const addToCustomRoutine = (items, dayIndex) => {
//         if (Array.isArray(items)) {
//             const exercisesWithDay = items.map(item => ({
//                 ...item,
//                 sets: item.sets || 3,
//                 reps: item.reps || 12,
//                 rest: item.rest || 60,
//                 day: dayIndex
//             }));
//             setCustomRoutine(prev => [...prev, ...exercisesWithDay]);
//         } else {
//             setCustomRoutine(prev => [...prev, {
//                 ...items,
//                 sets: items.sets || 3,
//                 reps: items.reps || 12,
//                 rest: items.rest || 60,
//                 day: dayIndex || 0
//             }]);
//         }
//     };

//     const removeFromRoutine = (index) => {
//         setCustomRoutine(prev => prev.filter((_, i) => i !== index));
//     };

//     const updateRoutineItem = (index, key, value) => {
//         setCustomRoutine(prev => {
//             const newRoutine = [...prev];
//             newRoutine[index][key] = value;
//             return newRoutine;
//         });
//     };

//     const saveRoutine = async (user) => {
//         if (!user) {
//             alert("Debes iniciar sesión para guardar tu rutina.");
//             return;
//         }

//         const routineData = {
//             routine: customRoutine,
//             metadata: workoutData,
//             createdAt: new Date().toISOString()
//         };

//         try {
//             const userRoutinesRef = doc(db, 'users', user.uid);
//             const routineDocRef = doc(collection(userRoutinesRef, 'routines'));

//             await setDoc(routineDocRef, routineData);

//             alert('¡Rutina guardada en la nube exitosamente!');
//         } catch (error) {
//             console.error("Error al guardar la rutina en Firestore:", error);
//             alert("Ocurrió un error al guardar la rutina. Por favor, inténtalo de nuevo.");
//         }
//     };

//     const handleExerciseClick = (exercise) => {
//         setSelectedExercise(exercise);
//     };

//     return {
//         workoutData,
//         setWorkoutData,
//         generatedRoutine,
//         fetchRecommendedSplits,
//         onSelectSplit,
//         exercises: filteredExercises,
//         searchExercises,
//         isLoading,
//         showExerciseList,
//         setShowExerciseList,
//         customRoutine,
//         addToCustomRoutine,
//         removeFromRoutine,
//         updateRoutineItem,
//         saveRoutine,
//         selectedExercise,
//         setSelectedExercise,
//         handleExerciseClick,
//         selectedRegion,
//         setSelectedRegion,
//         selectedMuscleGroup,
//         setSelectedMuscleGroup,
//         availableRegions,
//         availableMuscleGroups,
//         recommendedSplits,
//         addedExercisesFromAI, // <-- NUEVO RETORNO
//         handleAddToCustomFromAI // <-- NUEVO RETORNO
//     };
// };

// const FitnessApp = () => {
//     const { user } = useAuth();
//     const {
//         workoutData,
//         setWorkoutData,
//         generatedRoutine,
//         fetchRecommendedSplits,
//         onSelectSplit,
//         exercises,
//         searchExercises,
//         isLoading,
//         showExerciseList,
//         setShowExerciseList,
//         customRoutine,
//         addToCustomRoutine,
//         removeFromRoutine,
//         updateRoutineItem,
//         saveRoutine,
//         selectedExercise,
//         setSelectedExercise,
//         handleExerciseClick,
//         selectedRegion,
//         setSelectedRegion,
//         selectedMuscleGroup,
//         setSelectedMuscleGroup,
//         availableRegions,
//         availableMuscleGroups,
//         recommendedSplits,
//         addedExercisesFromAI,
//         handleAddToCustomFromAI
//     } = useFitnessRoutine();

//     return (
//         <div className="container py-5" style={{ color: 'var(--text-primary)' }}>
//             <div className="text-center mb-5">
//                 <h1 className="display-4 fw-bold mb-3">
//                     <Dumbbell className="me-3" size={48} />
//                     FitnessAI Coach
//                 </h1>
//                 <p className="lead text-muted">
//                     Crea rutinas personalizadas con inteligencia artificial
//                 </p>
//             </div>

//             <hr className="my-4" />

//             {isLoading ? ( // <-- NUEVO RENDERIZADO CONDICIONAL
//                 <Loading />
//             ) : !generatedRoutine ? (
//                 <WorkoutForm
//                     workoutData={workoutData}
//                     setWorkoutData={setWorkoutData}
//                     fetchRecommendedSplits={fetchRecommendedSplits}
//                     isLoading={isLoading}
//                     recommendedSplits={recommendedSplits}
//                     onSelectSplit={onSelectSplit}
//                 />
//             ) : (
//                 <>
//                     <RoutineDisplay
//                         routine={generatedRoutine}
//                         addToCustomRoutine={handleAddToCustomFromAI} // <-- Cambiado
//                         addedExercisesFromAI={addedExercisesFromAI} // <-- Pasamos el nuevo estado
//                     />

//                     <RoutineBuilder
//                         customRoutine={customRoutine}
//                         addToCustomRoutine={addToCustomRoutine}
//                         removeFromRoutine={removeFromRoutine}
//                         updateRoutineItem={updateRoutineItem}
//                         saveRoutine={saveRoutine}
//                         searchExercises={searchExercises}
//                         showExerciseList={showExerciseList}
//                         setShowExerciseList={setShowExerciseList}
//                         exercises={exercises}
//                         onExerciseClick={handleExerciseClick}
//                         selectedExercise={selectedExercise}
//                         setSelectedExercise={setSelectedExercise}
//                         selectedRegion={selectedRegion}
//                         setSelectedRegion={setSelectedRegion}
//                         selectedMuscleGroup={selectedMuscleGroup}
//                         setSelectedMuscleGroup={setSelectedMuscleGroup}
//                         availableRegions={availableRegions}
//                         availableMuscleGroups={availableMuscleGroups}
//                         user={user}
//                         workoutData={workoutData}
//                     />
//                 </>
//             )}
//         </div>
//     );
// };
// const generateSampleRoutine = (data, split) => {
//     const routines = {
//         "Full Body": {
//             days: [
//                 {
//                     focus: "Cuerpo Completo",
//                     exercises: [
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "remo-con-mancuerna", "name": "Remo con mancuerna", "sets": 3, "reps": 12, "rest": 60 },
//                         { "id": "plancha", "name": "Plancha", "sets": 3, "reps": 30, "rest": 30 }
//                     ]
//                 }
//             ]
//         },
//         "Torso / Pierna": {
//             days: [
//                 {
//                     focus: "Torso",
//                     exercises: [
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 4, "reps": 8, "rest": 90 },
//                         { "id": "dominadas", "name": "Dominadas", "sets": 4, "reps": 6, "rest": 120 }
//                     ]
//                 },
//                 {
//                     focus: "Pierna",
//                     exercises: [
//                         { "id": "sentadillas", "name": "Sentadillas", "sets": 5, "reps": 8, "rest": 120 },
//                         { "id": "peso-muerto", "name": "Peso muerto", "sets": 4, "reps": 6, "rest": 150 }
//                     ]
//                 }
//             ]
//         },
//         "Push / Pull / Legs": {
//             days: [
//                 {
//                     focus: "Empuje (Push)",
//                     exercises: [
//                         { "id": "press-de-hombros", "name": "Press de hombros", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "press-de-banca-inclinado", "name": "Press de banca inclinado", "sets": 3, "reps": 10, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Tirón (Pull)",
//                     exercises: [
//                         { "id": "remo-con-barra", "name": "Remo con barra", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "jalon-al-pecho", "name": "Jalón al pecho", "sets": 3, "reps": 12, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Piernas (Legs)",
//                     exercises: [
//                         { "id": "prensa-de-piernas", "name": "Prensa de piernas", "sets": 4, "reps": 12, "rest": 90 },
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 4, "reps": 10, "rest": 90 }
//                     ]
//                 }
//             ]
//         },
//         "Arnold Split": {
//             days: [
//                 {
//                     focus: "Pecho & Espalda",
//                     exercises: [
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 5, "reps": 8, "rest": 90 },
//                         { "id": "remo-con-barra", "name": "Remo con barra", "sets": 5, "reps": 8, "rest": 90 }
//                     ]
//                 },
//                 {
//                     focus: "Hombros & Brazos",
//                     exercises: [
//                         { "id": "press-de-hombros-con-mancuerna", "name": "Press de hombros con mancuerna", "sets": 4, "reps": 10, "rest": 60 },
//                         { "id": "curl-de-biceps", "name": "Curl de bíceps", "sets": 4, "reps": 10, "rest": 60 },
//                         { "id": "extensiones-de-triceps", "name": "Extensiones de tríceps", "sets": 4, "reps": 10, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Piernas",
//                     exercises: [
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 5, "reps": 10, "rest": 120 },
//                         { "id": "peso-muerto-rumano", "name": "Peso muerto rumano", "sets": 4, "reps": 12, "rest": 90 }
//                     ]
//                 }
//             ]
//         }
//     };
//     return routines[split] || routines["Full Body"];
// };

// export default FitnessApp;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
// import { Dumbbell, Calendar, Target, Clock, Plus, Trash2, Save, Brain, Activity } from 'lucide-react';

// // Componentes importados
// import WorkoutForm from './WorkoutForm';
// import RoutineDisplay from './RoutineDisplay';
// import RoutineBuilder from './RoutineBuilder';
// import ExerciseList from './ExerciseList';
// import ExerciseDetailsModal from './ExerciseDetailsModal';
// import Loading from './Loading'; 
// import SavedRoutineDisplay from './SavedRoutineDisplay'; // <-- NUEVA IMPORTACIÓN

// // Hooks y bases de datos
// import useAuth from '../hooks/useAuth';
// import { db } from '../index.js';

// const useFitnessRoutine = () => {
//     // ... Tu estado existente
//     const [workoutData, setWorkoutData] = useState({
//         goal: 'weight_loss',
//         level: 'beginner',
//         days: 3,
//         availableTime: 45,
//         gender: '',
//         age: '',
//         weight: '',
//         height: '',
//         location: '',
//         equipment: ''
//     });

//     const [selectedSplit, setSelectedSplit] = useState(null);
//     const [recommendedSplits, setRecommendedSplits] = useState(null);
//     const [generatedRoutine, setGeneratedRoutine] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [customRoutine, setCustomRoutine] = useState([]);
//     const [showExerciseList, setShowExerciseList] = useState(false);
//     const [selectedExercise, setSelectedExercise] = useState(null);
//     const [allExercises, setAllExercises] = useState([]);
//     const [filteredExercises, setFilteredExercises] = useState([]);
//     const [selectedRegion, setSelectedRegion] = useState('');
//     const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
//     const [availableRegions, setAvailableRegions] = useState([]);
//     const [availableMuscleGroups, setAvailableMuscleGroups] = useState([]);
//     const [addedExercisesFromAI, setAddedExercisesFromAI] = useState([]);
//     const [savedRoutine, setSavedRoutine] = useState(null); // <-- NUEVO ESTADO

//     useEffect(() => {
//         const fetchExercisesFromFirestore = async () => {
//             try {
//                 const querySnapshot = await getDocs(collection(db, "ejercicios"));
//                 const exercises = querySnapshot.docs.map(doc => {
//                     const data = doc.data();
//                     return {
//                         id: doc.id,
//                         nombre: data.nombre,
//                         descripcion: data.descripcion,
//                         grupo_muscular: data.grupo_muscular,
//                         region_cuerpo: data.region_cuerpo,
//                         imagen: data.imagen,
//                         videoUrl: data.video
//                     };
//                 });
//                 if (exercises.length > 0) {
//                     setAllExercises(exercises);
//                     setAvailableRegions(getUniqueValues(exercises, 'region_cuerpo'));
//                     setAvailableMuscleGroups(getUniqueValues(exercises, 'grupo_muscular'));
//                 }
//             } catch (error) {
//                 console.error("Error al obtener ejercicios de Firestore:", error);
//             }
//         };
//         fetchExercisesFromFirestore();
//     }, []);

//     const getUniqueValues = (data, key) => {
//         if (!data || data.length === 0) return [];
//         const values = data.map(item => item[key]).filter(Boolean);
//         return [...new Set(values)];
//     };

//     useEffect(() => {
//         let currentExercises = [...allExercises];
//         if (selectedRegion) {
//             currentExercises = currentExercises.filter(ex => ex.region_cuerpo === selectedRegion);
//         }
//         if (selectedMuscleGroup) {
//             currentExercises = currentExercises.filter(ex => ex.grupo_muscular === selectedMuscleGroup);
//         }
//         setFilteredExercises(currentExercises);
//     }, [selectedRegion, selectedMuscleGroup, allExercises]);

//     const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
//     const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

//     const searchExercises = () => {
//         setShowExerciseList(true);
//     };

//     const enrichRoutineWithDetails = (aiRoutine, allExercises) => {
//     const enrichedRoutine = {
//         days: aiRoutine.days.map(day => ({
//             ...day,
//             exercises: day.exercises.map(exerciseFromAI => {
//                 const fullExerciseDetails = allExercises.find(
//                     ex => ex.nombre.toLowerCase() === exerciseFromAI.name.toLowerCase()
//                 );

//                 // Si encontramos el ejercicio en la base de datos, usamos sus datos.
//                 // Si no, usamos los datos de la IA como respaldo.
//                 const enrichedExercise = {
//                     ...exerciseFromAI,
//                     ...fullExerciseDetails,
//                     // Aseguramos que siempre haya un nombre
//                     nombre: fullExerciseDetails ? fullExerciseDetails.nombre : exerciseFromAI.name,
//                     id: fullExerciseDetails ? fullExerciseDetails.id : Date.now() + Math.random() // Aseguramos un ID único
//                 };

//                 return enrichedExercise;
//             })
//         }))
//     };
//     return enrichedRoutine;
//     };

//     const fetchRecommendedSplits = async () => {
//         setIsLoading(true);
//         const prompt = `
//             Basado en los siguientes datos de usuario, recomienda 2 o 3 tipos de rutina de entrenamiento (split) que sean los más adecuados.
//             Tu respuesta debe ser un objeto JSON con una propiedad "recommendedSplits" que contenga un array de objetos.
//             Cada objeto en el array debe tener las propiedades: "name" (string con el nombre del split) y "reason" (string con una breve explicación de por qué se recomienda).
//             Los nombres de los splits deben ser uno de estos: "Full Body", "Torso / Pierna", "Push / Pull / Legs" o "Arnold Split".

//             --- Datos del usuario ---
//             Días por semana: ${workoutData.days}
//             Nivel de actividad: ${workoutData.level}
//             Tiempo disponible: ${workoutData.availableTime} minutos

//             **Reglas para la recomendación:**
//             - Si los días son 1 o 2, la mejor opción es "Full Body".
//             - Si los días son 3, las mejores opciones son "Full Body" (para principiantes/intermedios) y "Torso / Pierna" o "Push / Pull / Legs" (para avanzados).
//             - Si los días son 4, las mejores opciones son "Torso / Pierna" y "Push / Pull / Legs".
//             - Si los días son 5 o 6, las mejores opciones son "Push / Pull / Legs" o "Arnold Split".
//             - Si los días son 7, la mejor opción es "Arnold Split" o una variante de "Push / Pull / Legs".

//             Elige las 2 o 3 opciones más adecuadas y proporciona una breve razón para cada una.
//             Retorna solo el objeto JSON.
//         `;
//         try {
//             const response = await axios.post(
//                 OPENAI_API_URL,
//                 {
//                     model: "gpt-4o-mini",
//                     messages: [{ role: "user", content: prompt }],
//                     response_format: { type: "json_object" }
//                 },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${OPENAI_API_KEY}`
//                     }
//                 }
//             );
//             const aiResponse = JSON.parse(response.data.choices[0].message.content);
//             setRecommendedSplits(aiResponse.recommendedSplits);
//         } catch (error) {
//             console.error("Error al obtener las recomendaciones de splits:", error.response?.data || error.message);
//             setRecommendedSplits([
//                 { name: "Full Body", reason: "Opción recomendada para la mayoría de los niveles y tiempos." },
//                 { name: "Torso / Pierna", reason: "Excelente para 4 días a la semana, optimizando el volumen." }
//             ]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const onSelectSplit = async (splitName) => {
//         setIsLoading(true);
//         setSelectedSplit(splitName);
//         setRecommendedSplits(null);
//         setGeneratedRoutine(null); 
//         const restTimes = {
//             weight_loss: 45,
//             muscle_gain: 90,
//             default: 60
//         };
//         const recommendedRest = restTimes[workoutData.goal] || restTimes.default;
//         const getSplitLogic = (split) => {
//             switch (split) {
//                 case "Full Body":
//                     return `- El 'focus' de todos los días debe ser "Cuerpo Completo".
//                              - Incluye ejercicios que trabajen la mayoría de los grupos musculares grandes (piernas, pecho, espalda, hombros, brazos).
//                              - Reparte los ejercicios para que cada día se trabaje todo el cuerpo.`;
//                 case "Torso / Pierna":
//                     return `- Los días de Torso deben incluir ejercicios para Pecho, Espalda, Hombros y Brazos.
//                              - Los días de Pierna deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 case "Push / Pull / Legs":
//                     return `- Los días de Empuje (Push) deben incluir ejercicios para Pecho, Hombros y Tríceps.
//                              - Los días de Tirón (Pull) deben incluir ejercicios para Espalda y Bíceps.
//                              - Los días de Piernas (Legs) deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 case "Arnold Split":
//                     return `- Los días de Pecho y Espalda deben incluir ejercicios de ambos grupos musculares.
//                              - Los días de Hombros y Brazos deben incluir ejercicios de Hombros, Bíceps y Tríceps.
//                              - Los días de Piernas deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 default:
//                     return "";
//             }
//         };
//         const getLevelLogic = (level) => {
//             switch (level) {
//                 case "beginner":
//                     return `- Número de series: 2-3 por ejercicio.
//                              - Rango de repeticiones: 10-15.
//                              - Ejercicios: Simples, con técnica fácil de aprender.
//                              - Número de ejercicios por día: 4-6.`;
//                 case "intermediate":
//                     return `- Número de series: 3-4 por ejercicio.
//                              - Rango de repeticiones: 8-12.
//                              - Ejercicios: Una mezcla de básicos y compuestos.
//                              - Número de ejercicios por día: 5-8.`;
//                 case "advanced":
//                     return `- Número de series: 4-5 por ejercicio.
//                              - Rango de repeticiones: 6-10.
//                              - Ejercicios: Principalmente compuestos, con ejercicios de aislamiento si el tiempo lo permite.
//                              - Número de ejercicios por día: 7-10.`;
//                 default:
//                     return "";
//             }
//         };
//         const prompt = `
//             Genera una rutina de fitness en español para una persona con los siguientes datos.
//             El formato de la respuesta debe ser un objeto JSON con una propiedad "days", que es un array de objetos.
//             Cada objeto de "days" debe tener dos propiedades: "focus" (un string) y "exercises" (un array de objetos).
//             Cada objeto de "exercises" debe tener "name" (string), "sets" (número), "reps" (número), y "rest" (número, en segundos).

//             --- Datos del usuario ---
//             Objetivo: ${workoutData.goal}
//             Nivel de actividad: ${workoutData.level}
//             Días por semana: ${workoutData.days}
//             División de rutina (Split): ${splitName}
//             Tiempo disponible: ${workoutData.availableTime} minutos
//             Edad: ${workoutData.age} años
//             Peso: ${workoutData.weight} kg
//             Altura: ${workoutData.height} cm

//             **INSTRUCCIONES CLAVE PARA LA GENERACIÓN DE LA RUTINA:**

//             1. **TIEMPO DE DESCANSO:** Para cada ejercicio, usa un tiempo de descanso de ${recommendedRest} segundos, ya que es el tiempo recomendado para el objetivo de ${workoutData.goal}.

//             2. **REGLAS PARA LA DIVISIÓN DE RUTINA (SPLIT):**
//             ${getSplitLogic(splitName)}

//             3. **REGLAS PARA CADA NIVEL:**
//             ${getLevelLogic(workoutData.level)}

//             4. **NÚMERO DE EJERCICIOS POR DÍA:**
//             - El número total de ejercicios por día debe ser suficiente para completar la rutina en ${workoutData.availableTime} minutos.
//             - Usa un cálculo aproximado de 5-7 minutos por ejercicio (incluyendo sets y descanso) para determinar la cantidad de ejercicios adecuada.
//             - Prioriza el volumen de ejercicios más alto dentro del rango permitido por el tiempo y el nivel del usuario.

//             Basándote en estos datos y en las reglas anteriores, genera una rutina que sea estrictamente adecuada para el nivel, edad, peso, altura, tiempo disponible y el split elegido por el usuario.
//             Elige los nombres de los ejercicios de una lista conocida por ti, como "Sentadillas", "Dominadas", "Flexiones", "Plancha", etc.

//             Ejemplo del formato JSON:
//             {
//                 "days": [
//                     {
//                         "focus": "Tren Superior",
//                         "exercises": [
//                             { "name": "Flexiones de pecho", "sets": 3, "reps": 10, "rest": 60 },
//                             { "name": "Fondos de tríceps", "sets": 3, "reps": 12, "rest": 60 }
//                         ]
//                     }
//                 ]
//             }
//         `;
//         try {
//             const response = await axios.post(
//                 OPENAI_API_URL,
//                 {
//                     model: "gpt-4o-mini",
//                     messages: [{ role: "user", content: prompt }],
//                     response_format: { type: "json_object" }
//                 },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${OPENAI_API_KEY}`
//                     }
//                 }
//             );
//             const aiResponse = JSON.parse(response.data.choices[0].message.content);
//             const enrichedRoutine = enrichRoutineWithDetails(aiResponse, allExercises);
//             setGeneratedRoutine(enrichedRoutine);
//         } catch (error) {
//             console.error("Error al generar la rutina con IA:", error.response?.data || error.message);
//             setGeneratedRoutine(generateSampleRoutine(workoutData, splitName));
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleAddToCustomFromAI = (exercise, dayIndex) => {
//         addToCustomRoutine(exercise, dayIndex);
//         setAddedExercisesFromAI(prev => [...prev, exercise.id]);
//     };

//     const addToCustomRoutine = (items, dayIndex) => {
//         if (Array.isArray(items)) {
//             const exercisesWithDay = items.map(item => ({
//                 ...item,
//                 sets: item.sets || 3,
//                 reps: item.reps || 12,
//                 rest: item.rest || 60,
//                 day: dayIndex
//             }));
//             setCustomRoutine(prev => [...prev, ...exercisesWithDay]);
//         } else {
//             setCustomRoutine(prev => [...prev, {
//                 ...items,
//                 sets: items.sets || 3,
//                 reps: items.reps || 12,
//                 rest: items.rest || 60,
//                 day: dayIndex || 0
//             }]);
//         }
//     };

//     const removeFromRoutine = (index) => {
//         setCustomRoutine(prev => prev.filter((_, i) => i !== index));
//     };

//     const updateRoutineItem = (index, key, value) => {
//         setCustomRoutine(prev => {
//             const newRoutine = [...prev];
//             newRoutine[index][key] = value;
//             return newRoutine;
//         });
//     };

//     const saveRoutine = async (user) => {
//         if (!user) {
//             alert("Debes iniciar sesión para guardar tu rutina.");
//             return;
//         }

//         const routineData = {
//             routine: customRoutine,
//             metadata: workoutData,
//             createdAt: new Date().toISOString()
//         };

//         try {
//             const userRoutinesRef = doc(db, 'users', user.uid);
//             const routineDocRef = doc(collection(userRoutinesRef, 'routines'));

//             await setDoc(routineDocRef, routineData);
//             setSavedRoutine(customRoutine); // <-- NUEVO: Guarda la rutina en el estado
//             setCustomRoutine([]); // Limpiar la rutina personalizada
//             alert('¡Rutina guardada en la nube exitosamente!');
//         } catch (error) {
//             console.error("Error al guardar la rutina en Firestore:", error);
//             alert("Ocurrió un error al guardar la rutina. Por favor, inténtalo de nuevo.");
//         }
//     };

//     const handleExerciseClick = (exercise) => {
//         setSelectedExercise(exercise);
//     };

//     return {
//         workoutData,
//         setWorkoutData,
//         generatedRoutine,
//         fetchRecommendedSplits,
//         onSelectSplit,
//         exercises: filteredExercises,
//         searchExercises,
//         isLoading,
//         showExerciseList,
//         setShowExerciseList,
//         customRoutine,
//         addToCustomRoutine,
//         removeFromRoutine,
//         updateRoutineItem,
//         saveRoutine,
//         selectedExercise,
//         setSelectedExercise,
//         handleExerciseClick,
//         selectedRegion,
//         setSelectedRegion,
//         selectedMuscleGroup,
//         setSelectedMuscleGroup,
//         availableRegions,
//         availableMuscleGroups,
//         recommendedSplits,
//         addedExercisesFromAI,
//         handleAddToCustomFromAI,
//         savedRoutine // <-- NUEVO RETORNO
//     };
// };

// const FitnessApp = () => {
//     const { user } = useAuth();
//     const {
//         workoutData,
//         setWorkoutData,
//         generatedRoutine,
//         fetchRecommendedSplits,
//         onSelectSplit,
//         exercises,
//         searchExercises,
//         isLoading,
//         showExerciseList,
//         setShowExerciseList,
//         customRoutine,
//         addToCustomRoutine,
//         removeFromRoutine,
//         updateRoutineItem,
//         saveRoutine,
//         selectedExercise,
//         setSelectedExercise,
//         handleExerciseClick,
//         selectedRegion,
//         setSelectedRegion,
//         selectedMuscleGroup,
//         setSelectedMuscleGroup,
//         availableRegions,
//         availableMuscleGroups,
//         recommendedSplits,
//         addedExercisesFromAI,
//         handleAddToCustomFromAI,
//         savedRoutine // <-- NUEVO
//     } = useFitnessRoutine();

//     // Función para manejar el "Volver al inicio"
//     const handleReset = () => {
//         // Recargar la página o reiniciar todos los estados
//         window.location.reload();
//     };

//     // Lógica de renderizado principal
//     const renderContent = () => {
//         if (isLoading) {
//             return <Loading />;
//         }

//         if (savedRoutine) {
//             return <SavedRoutineDisplay routine={savedRoutine} onReset={handleReset} />;
//         }

//         if (generatedRoutine) {
//             return (
//                 <>
//                     <RoutineDisplay
//                         routine={generatedRoutine}
//                         addToCustomRoutine={handleAddToCustomFromAI}
//                         addedExercisesFromAI={addedExercisesFromAI}
//                     />

//                     <RoutineBuilder
//                         customRoutine={customRoutine}
//                         addToCustomRoutine={addToCustomRoutine}
//                         removeFromRoutine={removeFromRoutine}
//                         updateRoutineItem={updateRoutineItem}
//                         saveRoutine={saveRoutine}
//                         searchExercises={searchExercises}
//                         showExerciseList={showExerciseList}
//                         setShowExerciseList={setShowExerciseList}
//                         exercises={exercises}
//                         onExerciseClick={handleExerciseClick}
//                         selectedExercise={selectedExercise}
//                         setSelectedExercise={setSelectedExercise}
//                         selectedRegion={selectedRegion}
//                         setSelectedRegion={setSelectedRegion}
//                         selectedMuscleGroup={selectedMuscleGroup}
//                         setSelectedMuscleGroup={setSelectedMuscleGroup}
//                         availableRegions={availableRegions}
//                         availableMuscleGroups={availableMuscleGroups}
//                         user={user}
//                         workoutData={workoutData}
//                     />
//                 </>
//             );
//         }

//         return (
//             <WorkoutForm
//                 workoutData={workoutData}
//                 setWorkoutData={setWorkoutData}
//                 fetchRecommendedSplits={fetchRecommendedSplits}
//                 isLoading={isLoading}
//                 recommendedSplits={recommendedSplits}
//                 onSelectSplit={onSelectSplit}
//             />
//         );
//     };

//     return (
//         <div className="container py-5" style={{ color: 'var(--text-primary)' }}>
//             <div className="text-center mb-5">
//                 <h1 className="display-4 fw-bold mb-3">
//                     <Dumbbell className="me-3" size={48} />
//                     FitnessAI Coach
//                 </h1>
//                 <p className="lead text-muted">
//                     Crea rutinas personalizadas con inteligencia artificial
//                 </p>
//             </div>

//             <hr className="my-4" />

//             {renderContent()}
//         </div>
//     );
// };
// const generateSampleRoutine = (data, split) => {
//     const routines = {
//         "Full Body": {
//             days: [
//                 {
//                     focus: "Cuerpo Completo",
//                     exercises: [
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "remo-con-mancuerna", "name": "Remo con mancuerna", "sets": 3, "reps": 12, "rest": 60 },
//                         { "id": "plancha", "name": "Plancha", "sets": 3, "reps": 30, "rest": 30 }
//                     ]
//                 }
//             ]
//         },
//         "Torso / Pierna": {
//             days: [
//                 {
//                     focus: "Torso",
//                     exercises: [
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 4, "reps": 8, "rest": 90 },
//                         { "id": "dominadas", "name": "Dominadas", "sets": 4, "reps": 6, "rest": 120 }
//                     ]
//                 },
//                 {
//                     focus: "Pierna",
//                     exercises: [
//                         { "id": "sentadillas", "name": "Sentadillas", "sets": 5, "reps": 8, "rest": 120 },
//                         { "id": "peso-muerto", "name": "Peso muerto", "sets": 4, "reps": 6, "rest": 150 }
//                     ]
//                 }
//             ]
//         },
//         "Push / Pull / Legs": {
//             days: [
//                 {
//                     focus: "Empuje (Push)",
//                     exercises: [
//                         { "id": "press-de-hombros", "name": "Press de hombros", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "press-de-banca-inclinado", "name": "Press de banca inclinado", "sets": 3, "reps": 10, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Tirón (Pull)",
//                     exercises: [
//                         { "id": "remo-con-barra", "name": "Remo con barra", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "jalon-al-pecho", "name": "Jalón al pecho", "sets": 3, "reps": 12, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Piernas (Legs)",
//                     exercises: [
//                         { "id": "prensa-de-piernas", "name": "Prensa de piernas", "sets": 4, "reps": 12, "rest": 90 },
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 4, "reps": 10, "rest": 90 }
//                     ]
//                 }
//             ]
//         },
//         "Arnold Split": {
//             days: [
//                 {
//                     focus: "Pecho & Espalda",
//                     exercises: [
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 5, "reps": 8, "rest": 90 },
//                         { "id": "remo-con-barra", "name": "Remo con barra", "sets": 5, "reps": 8, "rest": 90 }
//                     ]
//                 },
//                 {
//                     focus: "Hombros & Brazos",
//                     exercises: [
//                         { "id": "press-de-hombros-con-mancuerna", "name": "Press de hombros con mancuerna", "sets": 4, "reps": 10, "rest": 60 },
//                         { "id": "curl-de-biceps", "name": "Curl de bíceps", "sets": 4, "reps": 10, "rest": 60 },
//                         { "id": "extensiones-de-triceps", "name": "Extensiones de tríceps", "sets": 4, "reps": 10, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Piernas",
//                     exercises: [
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 5, "reps": 10, "rest": 120 },
//                         { "id": "peso-muerto-rumano", "name": "Peso muerto rumano", "sets": 4, "reps": 12, "rest": 90 }
//                     ]
//                 }
//             ]
//         }
//     };
//     return routines[split] || routines["Full Body"];
// };

// export default FitnessApp;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { getFirestore, collection, getDocs, doc, setDoc, query, orderBy, limit } from "firebase/firestore";
// import { Dumbbell } from 'lucide-react';

// // Componentes importados
// import WorkoutForm from './WorkoutForm';
// import RoutineDisplay from './RoutineDisplay';
// import UserDashboard from './UserDashboard';
// import Loading from './Loading'; 
// import RoutineBuilder from './RoutineBuilder';

// // Hooks y bases de datos
// import useAuth from '../hooks/useAuth';
// import { db } from '../index.js';

// const useFitnessRoutine = () => {
//     const [workoutData, setWorkoutData] = useState({
//         goal: 'weight_loss',
//         level: 'beginner',
//         days: 3,
//         availableTime: 45,
//         gender: '',
//         age: '',
//         weight: '',
//         height: '',
//         location: '',
//         equipment: ''
//     });

//     const [selectedSplit, setSelectedSplit] = useState(null);
//     const [recommendedSplits, setRecommendedSplits] = useState(null);
//     const [generatedRoutine, setGeneratedRoutine] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [customRoutine, setCustomRoutine] = useState([]);
//     const [showExerciseList, setShowExerciseList] = useState(false);
//     const [selectedExercise, setSelectedExercise] = useState(null);
//     const [allExercises, setAllExercises] = useState([]);
//     const [filteredExercises, setFilteredExercises] = useState([]);
//     const [selectedRegion, setSelectedRegion] = useState('');
//     const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
//     const [availableRegions, setAvailableRegions] = useState([]);
//     const [availableMuscleGroups, setAvailableMuscleGroups] = useState([]);
//     const [addedExercisesFromAI, setAddedExercisesFromAI] = useState([]);

//     const { user } = useAuth();

//     // Efecto 1: Cargar la rutina del usuario al iniciar sesión
//     useEffect(() => {
//         const fetchSavedRoutine = async () => {
//             if (user) {
//                 try {
//                     setIsLoading(true);
//                     const routinesRef = collection(db, 'users', user.uid, 'routines');
//                     const q = query(routinesRef, orderBy('createdAt', 'desc'), limit(1));
//                     const querySnapshot = await getDocs(q);

//                     if (!querySnapshot.empty) {
//                         const routineData = querySnapshot.docs[0].data();
//                         setCustomRoutine(routineData.routine);
//                     }
//                 } catch (error) {
//                     console.error("Error al obtener la rutina guardada:", error);
//                 } finally {
//                     setIsLoading(false);
//                 }
//             }
//         };
//         fetchSavedRoutine();
//     }, [user]);

//     // Efecto 2: Cargar la lista de ejercicios de Firestore
//     useEffect(() => {
//         const fetchExercisesFromFirestore = async () => {
//             try {
//                 const querySnapshot = await getDocs(collection(db, "ejercicios"));
//                 const exercises = querySnapshot.docs.map(doc => {
//                     const data = doc.data();
//                     return {
//                         id: doc.id,
//                         nombre: data.nombre,
//                         descripcion: data.descripcion,
//                         grupo_muscular: data.grupo_muscular,
//                         region_cuerpo: data.region_cuerpo,
//                         imagen: data.imagen,
//                         videoUrl: data.video
//                     };
//                 });
//                 if (exercises.length > 0) {
//                     setAllExercises(exercises);
//                     setAvailableRegions(getUniqueValues(exercises, 'region_cuerpo'));
//                     setAvailableMuscleGroups(getUniqueValues(exercises, 'grupo_muscular'));
//                 }
//             } catch (error) {
//                 console.error("Error al obtener ejercicios de Firestore:", error);
//             }
//         };
//         fetchExercisesFromFirestore();
//     }, []);

//     // Efecto 3: Filtrar ejercicios por región y grupo muscular
//     useEffect(() => {
//         let currentExercises = [...allExercises];
//         if (selectedRegion) {
//             currentExercises = currentExercises.filter(ex => ex.region_cuerpo === selectedRegion);
//         }
//         if (selectedMuscleGroup) {
//             currentExercises = currentExercises.filter(ex => ex.grupo_muscular === selectedMuscleGroup);
//         }
//         setFilteredExercises(currentExercises);
//     }, [selectedRegion, selectedMuscleGroup, allExercises]);

//     const getUniqueValues = (data, key) => {
//         if (!data || data.length === 0) return [];
//         const values = data.map(item => item[key]).filter(Boolean);
//         return [...new Set(values)];
//     };

//     const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
//     const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

//     const searchExercises = () => {
//         setShowExerciseList(true);
//     };

//     const enrichRoutineWithDetails = (aiRoutine, allExercises) => {
//         const enrichedRoutine = {
//             days: aiRoutine.days.map(day => ({
//                 ...day,
//                 exercises: day.exercises.map(exerciseFromAI => {
//                     const fullExerciseDetails = allExercises.find(
//                         ex => ex.nombre.toLowerCase() === exerciseFromAI.name.toLowerCase()
//                     );

//                     const enrichedExercise = {
//                         ...exerciseFromAI,
//                         ...fullExerciseDetails,
//                         nombre: fullExerciseDetails ? fullExerciseDetails.nombre : exerciseFromAI.name,
//                         id: fullExerciseDetails ? fullExerciseDetails.id : Date.now() + Math.random()
//                     };

//                     return enrichedExercise;
//                 })
//             }))
//         };
//         return enrichedRoutine;
//     };

//     const fetchRecommendedSplits = async () => {
//         setIsLoading(true);
//         const prompt = `
//             Basado en los siguientes datos de usuario, recomienda 2 o 3 tipos de rutina de entrenamiento (split) que sean los más adecuados.
//             Tu respuesta debe ser un objeto JSON con una propiedad "recommendedSplits" que contenga un array de objetos.
//             Cada objeto en el array debe tener las propiedades: "name" (string con el nombre del split) y "reason" (string con una breve explicación de por qué se recomienda).
//             Los nombres de los splits deben ser uno de estos: "Full Body", "Torso / Pierna", "Push / Pull / Legs" o "Arnold Split".
//             --- Datos del usuario ---
//             Días por semana: ${workoutData.days}
//             Nivel de actividad: ${workoutData.level}
//             Tiempo disponible: ${workoutData.availableTime} minutos

//             **Reglas para la recomendación:**
//             - Si los días son 1 o 2, la mejor opción es "Full Body".
//             - Si los días son 3, las mejores opciones son "Full Body" (para principiantes/intermedios) y "Torso / Pierna" o "Push / Pull / Legs" (para avanzados).
//             - Si los días son 4, las mejores opciones son "Torso / Pierna" y "Push / Pull / Legs".
//             - Si los días son 5 o 6, las mejores opciones son "Push / Pull / Legs" o "Arnold Split".
//             - Si los días son 7, la mejor opción es "Arnold Split" o una variante de "Push / Pull / Legs".
//             Elige las 2 o 3 opciones más adecuadas y proporciona una breve razón para cada una.
//             Retorna solo el objeto JSON.
//         `;
//         try {
//             const response = await axios.post(
//                 OPENAI_API_URL,
//                 {
//                     model: "gpt-4o-mini",
//                     messages: [{ role: "user", content: prompt }],
//                     response_format: { type: "json_object" }
//                 },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${OPENAI_API_KEY}`
//                     }
//                 }
//             );
//             const aiResponse = JSON.parse(response.data.choices[0].message.content);
//             setRecommendedSplits(aiResponse.recommendedSplits);
//         } catch (error) {
//             console.error("Error al obtener las recomendaciones de splits:", error.response?.data || error.message);
//             setRecommendedSplits([
//                 { name: "Full Body", reason: "Opción recomendada para la mayoría de los niveles y tiempos." },
//                 { name: "Torso / Pierna", reason: "Excelente para 4 días a la semana, optimizando el volumen." }
//             ]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const onSelectSplit = async (splitName) => {
//         setIsLoading(true);
//         setSelectedSplit(splitName);
//         setRecommendedSplits(null);
//         setGeneratedRoutine(null); 
//         const restTimes = {
//             weight_loss: 45,
//             muscle_gain: 90,
//             default: 60
//         };
//         const recommendedRest = restTimes[workoutData.goal] || restTimes.default;
//         const getSplitLogic = (split) => {
//             switch (split) {
//                 case "Full Body":
//                     return `- El 'focus' de todos los días debe ser "Cuerpo Completo".
//                              - Incluye ejercicios que trabajen la mayoría de los grupos musculares grandes (piernas, pecho, espalda, hombros, brazos).
//                              - Reparte los ejercicios para que cada día se trabaje todo el cuerpo.`;
//                 case "Torso / Pierna":
//                     return `- Los días de Torso deben incluir ejercicios para Pecho, Espalda, Hombros y Brazos.
//                              - Los días de Pierna deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 case "Push / Pull / Legs":
//                     return `- Los días de Empuje (Push) deben incluir ejercicios para Pecho, Hombros y Tríceps.
//                              - Los días de Tirón (Pull) deben incluir ejercicios para Espalda y Bíceps.
//                              - Los días de Piernas (Legs) deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 case "Arnold Split":
//                     return `- Los días de Pecho y Espalda deben incluir ejercicios de ambos grupos musculares.
//                              - Los días de Hombros y Brazos deben incluir ejercicios de Hombros, Bíceps y Tríceps.
//                              - Los días de Piernas deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 default:
//                     return "";
//             }
//         };
//         const getLevelLogic = (level) => {
//             switch (level) {
//                 case "beginner":
//                     return `- Número de series: 2-3 por ejercicio.
//                              - Rango de repeticiones: 10-15.
//                              - Ejercicios: Simples, con técnica fácil de aprender.
//                              - Número de ejercicios por día: 4-6.`;
//                 case "intermediate":
//                     return `- Número de series: 3-4 por ejercicio.
//                              - Rango de repeticiones: 8-12.
//                              - Ejercicios: Una mezcla de básicos y compuestos.
//                              - Número de ejercicios por día: 5-8.`;
//                 case "advanced":
//                     return `- Número de series: 4-5 por ejercicio.
//                              - Rango de repeticiones: 6-10.
//                              - Ejercicios: Principalmente compuestos, con ejercicios de aislamiento si el tiempo lo permite.
//                              - Número de ejercicios por día: 7-10.`;
//                 default:
//                     return "";
//             }
//         };
//         const prompt = `
//             Genera una rutina de fitness en español para una persona con los siguientes datos.
//             El formato de la respuesta debe ser un objeto JSON con una propiedad "days", que es un array de objetos.
//             Cada objeto de "days" debe tener dos propiedades: "focus" (un string) y "exercises" (un array de objetos).
//             Cada objeto de "exercises" debe tener "name" (string), "sets" (número), "reps" (número), y "rest" (número, en segundos).

//             --- Datos del usuario ---
//             Objetivo: ${workoutData.goal}
//             Nivel de actividad: ${workoutData.level}
//             Días por semana: ${workoutData.days}
//             División de rutina (Split): ${splitName}
//             Tiempo disponible: ${workoutData.availableTime} minutos
//             Edad: ${workoutData.age} años
//             Peso: ${workoutData.weight} kg
//             Altura: ${workoutData.height} cm

//             **INSTRUCCIONES CLAVE PARA LA GENERACIÓN DE LA RUTINA:**

//             1. **TIEMPO DE DESCANSO:** Para cada ejercicio, usa un tiempo de descanso de ${recommendedRest} segundos, ya que es el tiempo recomendado para el objetivo de ${workoutData.goal}.

//             2. **REGLAS PARA LA DIVISIÓN DE RUTINA (SPLIT):**
//             ${getSplitLogic(splitName)}

//             3. **REGLAS PARA CADA NIVEL:**
//             ${getLevelLogic(workoutData.level)}

//             4. **NÚMERO DE EJERCICIOS POR DÍA:**
//             - El número total de ejercicios por día debe ser suficiente para completar la rutina en ${workoutData.availableTime} minutos.
//             - Usa un cálculo aproximado de 5-7 minutos por ejercicio (incluyendo sets y descanso) para determinar la cantidad de ejercicios adecuada.
//             - Prioriza el volumen de ejercicios más alto dentro del rango permitido por el tiempo y el nivel del usuario.

//             Basándote en estos datos y en las reglas anteriores, genera una rutina que sea estrictamente adecuada para el nivel, edad, peso, altura, tiempo disponible y el split elegido por el usuario.
//             Elige los nombres de los ejercicios de una lista conocida por ti, como "Sentadillas", "Dominadas", "Flexiones", "Plancha", etc.

//             Ejemplo del formato JSON:
//             {
//                 "days": [
//                     {
//                         "focus": "Tren Superior",
//                         "exercises": [
//                             { "name": "Flexiones de pecho", "sets": 3, "reps": 10, "rest": 60 },
//                             { "name": "Fondos de tríceps", "sets": 3, "reps": 12, "rest": 60 }
//                         ]
//                     }
//                 ]
//             }
//         `;
//         try {
//             const response = await axios.post(
//                 OPENAI_API_URL,
//                 {
//                     model: "gpt-4o-mini",
//                     messages: [{ role: "user", content: prompt }],
//                     response_format: { type: "json_object" }
//                 },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${OPENAI_API_KEY}`
//                     }
//                 }
//             );
//             const aiResponse = JSON.parse(response.data.choices[0].message.content);
//             const enrichedRoutine = enrichRoutineWithDetails(aiResponse, allExercises);
//             setGeneratedRoutine(enrichedRoutine);
//         } catch (error) {
//             console.error("Error al generar la rutina con IA:", error.response?.data || error.message);
//             setGeneratedRoutine(generateSampleRoutine(workoutData, splitName));
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleAddToCustomFromAI = (exercise, dayIndex) => {
//         addToCustomRoutine(exercise, dayIndex);
//         setAddedExercisesFromAI(prev => [...prev, exercise.id]);
//     };

//     const addToCustomRoutine = (items, dayIndex) => {
//         if (Array.isArray(items)) {
//             const exercisesWithDay = items.map(item => ({
//                 ...item,
//                 sets: item.sets || 3,
//                 reps: item.reps || 12,
//                 rest: item.rest || 60,
//                 day: dayIndex
//             }));
//             setCustomRoutine(prev => [...prev, ...exercisesWithDay]);
//         } else {
//             setCustomRoutine(prev => [...prev, {
//                 ...items,
//                 sets: items.sets || 3,
//                 reps: items.reps || 12,
//                 rest: items.rest || 60,
//                 day: dayIndex || 0
//             }]);
//         }
//     };

//     const removeFromRoutine = (index) => {
//         setCustomRoutine(prev => prev.filter((_, i) => i !== index));
//     };

//     const updateRoutineItem = (index, key, value) => {
//         setCustomRoutine(prev => {
//             const newRoutine = [...prev];
//             newRoutine[index][key] = value;
//             return newRoutine;
//         });
//     };

//     const saveRoutine = async () => {
//         if (!user) {
//             alert("Debes iniciar sesión para guardar tu rutina.");
//             return;
//         }

//         const routineData = {
//             routine: customRoutine,
//             metadata: workoutData,
//             createdAt: new Date().toISOString()
//         };

//         try {
//             const userRoutinesRef = doc(db, 'users', user.uid);
//             const routineDocRef = doc(collection(userRoutinesRef, 'routines'));

//             await setDoc(routineDocRef, routineData);
//             alert('¡Rutina guardada en la nube exitosamente!');
//         } catch (error) {
//             console.error("Error al guardar la rutina en Firestore:", error);
//             alert("Ocurrió un error al guardar la rutina. Por favor, inténtalo de nuevo.");
//         }
//     };

//     const handleExerciseClick = (exercise) => {
//         setSelectedExercise(exercise);
//     };

//     // Funciones para gestionar días completos en el dashboard
//     const addDayToCustomRoutine = (newDayIndex) => {
//         setCustomRoutine(prev => [...prev, {
//             nombre: 'Nuevo Ejercicio',
//             id: `new-${Date.now()}`,
//             sets: 3,
//             reps: 12,
//             rest: 60,
//             day: newDayIndex
//         }]);
//     };

//     const removeDayFromCustomRoutine = (dayIndex) => {
//         setCustomRoutine(prev => prev.filter(item => item.day !== dayIndex));
//     };

//     return {
//         workoutData,
//         setWorkoutData,
//         generatedRoutine,
//         fetchRecommendedSplits,
//         onSelectSplit,
//         exercises: filteredExercises,
//         searchExercises,
//         isLoading,
//         showExerciseList,
//         setShowExerciseList,
//         customRoutine,
//         addToCustomRoutine,
//         removeFromRoutine,
//         updateRoutineItem,
//         saveRoutine,
//         selectedExercise,
//         setSelectedExercise,
//         handleExerciseClick,
//         selectedRegion,
//         setSelectedRegion,
//         selectedMuscleGroup,
//         setSelectedMuscleGroup,
//         availableRegions,
//         availableMuscleGroups,
//         recommendedSplits,
//         addedExercisesFromAI,
//         handleAddToCustomFromAI,
//         addDayToCustomRoutine,
//         removeDayFromCustomRoutine
//     };
// };

// const FitnessApp = () => {
//     const { user } = useAuth();
//     const {
//         workoutData,
//         setWorkoutData,
//         generatedRoutine,
//         fetchRecommendedSplits,
//         onSelectSplit,
//         exercises,
//         searchExercises,
//         isLoading,
//         showExerciseList,
//         setShowExerciseList,
//         customRoutine,
//         addToCustomRoutine,
//         removeFromRoutine,
//         updateRoutineItem,
//         saveRoutine,
//         selectedExercise,
//         setSelectedExercise,
//         handleExerciseClick,
//         selectedRegion,
//         setSelectedRegion,
//         selectedMuscleGroup,
//         setSelectedMuscleGroup,
//         availableRegions,
//         availableMuscleGroups,
//         recommendedSplits,
//         addedExercisesFromAI,
//         handleAddToCustomFromAI,
//         addDayToCustomRoutine,
//         removeDayFromCustomRoutine
//     } = useFitnessRoutine();

//     const renderContent = () => {
//         if (isLoading) {
//             return <Loading />;
//         }

//         // Si hay una rutina personalizada, muestra el dashboard de usuario
//         if (customRoutine.length > 0) {
//             return (
//                 <UserDashboard
//                     customRoutine={customRoutine}
//                     saveRoutine={saveRoutine}
//                     addDayToRoutine={addDayToCustomRoutine}
//                     removeDayFromRoutine={removeDayFromCustomRoutine}
//                     removeFromRoutine={removeFromRoutine}
//                     updateRoutineItem={updateRoutineItem}
//                     searchExercises={searchExercises}
//                     showExerciseList={showExerciseList}
//                     setShowExerciseList={setShowExerciseList}
//                     exercises={exercises}
//                     onExerciseClick={handleExerciseClick}
//                     selectedExercise={selectedExercise}
//                     setSelectedExercise={setSelectedExercise}
//                     selectedRegion={selectedRegion}
//                     setSelectedRegion={setSelectedRegion}
//                     selectedMuscleGroup={selectedMuscleGroup}
//                     setSelectedMuscleGroup={selectedMuscleGroup}
//                     availableRegions={availableRegions}
//                     availableMuscleGroups={availableMuscleGroups}
//                     addToCustomRoutine={addToCustomRoutine}
//                 />
//             );
//         }

//         // Si la IA generó una rutina, muestra la sugerencia y el constructor de rutina
//         if (generatedRoutine) {
//             return (
//                 <>
//                     <RoutineDisplay
//                         routine={generatedRoutine}
//                         addToCustomRoutine={handleAddToCustomFromAI}
//                         addedExercisesFromAI={addedExercisesFromAI}
//                     />

//                     <RoutineBuilder
//                         customRoutine={customRoutine}
//                         removeFromRoutine={removeFromRoutine}
//                         updateRoutineItem={updateRoutineItem}
//                         saveRoutine={saveRoutine}
//                         user={user}
//                         searchExercises={searchExercises}
//                         showExerciseList={showExerciseList}
//                         setShowExerciseList={setShowExerciseList}
//                         exercises={exercises}
//                         onExerciseClick={handleExerciseClick}
//                         selectedExercise={selectedExercise}
//                         setSelectedExercise={setSelectedExercise}
//                         selectedRegion={selectedRegion}
//                         setSelectedRegion={setSelectedRegion}
//                         selectedMuscleGroup={selectedMuscleGroup}
//                         setSelectedMuscleGroup={setSelectedMuscleGroup}
//                         availableRegions={availableRegions}
//                         availableMuscleGroups={availableMuscleGroups}
//                         addToCustomRoutine={addToCustomRoutine}
//                     />
//                 </>
//             );
//         }

//         // Por defecto, muestra el formulario inicial
//         return (
//             <WorkoutForm
//                 workoutData={workoutData}
//                 setWorkoutData={setWorkoutData}
//                 fetchRecommendedSplits={fetchRecommendedSplits}
//                 isLoading={isLoading}
//                 recommendedSplits={recommendedSplits}
//                 onSelectSplit={onSelectSplit}
//             />
//         );
//     };

//     return (
//         <div className="container py-5" style={{ color: 'var(--text-primary)' }}>
//             <div className="text-center mb-5">
//                 <h1 className="display-4 fw-bold mb-3">
//                     <Dumbbell className="me-3" size={48} />
//                     FitnessAI Coach
//                 </h1>
//                 <p className="lead text-muted">
//                     Crea rutinas personalizadas con inteligencia artificial
//                 </p>
//             </div>

//             <hr className="my-4" />

//             {renderContent()}
//         </div>
//     );
// };
// const generateSampleRoutine = (data, split) => {
//     const routines = {
//         "Full Body": {
//             days: [
//                 {
//                     focus: "Cuerpo Completo",
//                     exercises: [
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "remo-con-mancuerna", "name": "Remo con mancuerna", "sets": 3, "reps": 12, "rest": 60 },
//                         { "id": "plancha", "name": "Plancha", "sets": 3, "reps": 30, "rest": 30 }
//                     ]
//                 }
//             ]
//         },
//         "Torso / Pierna": {
//             days: [
//                 {
//                     focus: "Torso",
//                     exercises: [
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 4, "reps": 8, "rest": 90 },
//                         { "id": "dominadas", "name": "Dominadas", "sets": 4, "reps": 6, "rest": 120 }
//                     ]
//                 },
//                 {
//                     focus: "Pierna",
//                     exercises: [
//                         { "id": "sentadillas", "name": "Sentadillas", "sets": 5, "reps": 8, "rest": 120 },
//                         { "id": "peso-muerto", "name": "Peso muerto", "sets": 4, "reps": 6, "rest": 150 }
//                     ]
//                 }
//             ]
//         },
//         "Push / Pull / Legs": {
//             days: [
//                 {
//                     focus: "Empuje (Push)",
//                     exercises: [
//                         { "id": "press-de-hombros", "name": "Press de hombros", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "press-de-banca-inclinado", "name": "Press de banca inclinado", "sets": 3, "reps": 10, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Tirón (Pull)",
//                     exercises: [
//                         { "id": "remo-con-barra", "name": "Remo con barra", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "jalon-al-pecho", "name": "Jalón al pecho", "sets": 3, "reps": 12, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Piernas (Legs)",
//                     exercises: [
//                         { "id": "prensa-de-piernas", "name": "Prensa de piernas", "sets": 4, "reps": 12, "rest": 90 },
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 4, "reps": 10, "rest": 90 }
//                     ]
//                 }
//             ]
//         },
//         "Arnold Split": {
//             days: [
//                 {
//                     focus: "Pecho & Espalda",
//                     exercises: [
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 5, "reps": 8, "rest": 90 },
//                         { "id": "remo-con-barra", "name": "Remo con barra", "sets": 5, "reps": 8, "rest": 90 }
//                     ]
//                 },
//                 {
//                     focus: "Hombros & Brazos",
//                     exercises: [
//                         { "id": "press-de-hombros-con-mancuerna", "name": "Press de hombros con mancuerna", "sets": 4, "reps": 10, "rest": 60 },
//                         { "id": "curl-de-biceps", "name": "Curl de bíceps", "sets": 4, "reps": 10, "rest": 60 },
//                         { "id": "extensiones-de-triceps", "name": "Extensiones de tríceps", "sets": 4, "reps": 10, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Piernas",
//                     exercises: [
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 5, "reps": 10, "rest": 120 },
//                         { "id": "peso-muerto-rumano", "name": "Peso muerto rumano", "sets": 4, "reps": 12, "rest": 90 }
//                     ]
//                 }
//             ]
//         }
//     };
//     return routines[split] || routines["Full Body"];
// };

// export default FitnessApp;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { getFirestore, collection, getDocs, doc, setDoc, query, orderBy, limit } from "firebase/firestore";
// import { Dumbbell } from 'lucide-react';

// // Componentes importados
// import WorkoutForm from './WorkoutForm';
// import RoutineDisplay from './RoutineDisplay';
// import UserDashboard from './UserDashboard';
// import Loading from './Loading';
// import RoutineBuilder from './RoutineBuilder';
// import WorkoutSession from './WorkoutSession'; // <-- NUEVO

// // Hooks y bases de datos
// import useAuth from '../hooks/useAuth';
// import { db } from '../index.js';

// const useFitnessRoutine = () => {
//     const [workoutData, setWorkoutData] = useState({
//         goal: 'weight_loss',
//         level: 'beginner',
//         days: 3,
//         availableTime: 45,
//         gender: '',
//         age: '',
//         weight: '',
//         height: '',
//         location: '',
//         equipment: ''
//     });

//     const [selectedSplit, setSelectedSplit] = useState(null);
//     const [recommendedSplits, setRecommendedSplits] = useState(null);
//     const [generatedRoutine, setGeneratedRoutine] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [customRoutine, setCustomRoutine] = useState([]);
//     const [showExerciseList, setShowExerciseList] = useState(false);
//     const [selectedExercise, setSelectedExercise] = useState(null);
//     const [allExercises, setAllExercises] = useState([]);
//     const [filteredExercises, setFilteredExercises] = useState([]);
//     const [selectedRegion, setSelectedRegion] = useState('');
//     const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
//     const [availableRegions, setAvailableRegions] = useState([]);
//     const [availableMuscleGroups, setAvailableMuscleGroups] = useState([]);
//     const [addedExercisesFromAI, setAddedExercisesFromAI] = useState([]);
//     const [activeSession, setActiveSession] = useState(null); // <-- NUEVO ESTADO

//     const { user } = useAuth();

//     // Efecto 1: Cargar la rutina del usuario al iniciar sesión
//     useEffect(() => {
//         const fetchSavedRoutine = async () => {
//             if (user) {
//                 try {
//                     setIsLoading(true);
//                     const routinesRef = collection(db, 'users', user.uid, 'routines');
//                     const q = query(routinesRef, orderBy('createdAt', 'desc'), limit(1));
//                     const querySnapshot = await getDocs(q);

//                     if (!querySnapshot.empty) {
//                         const routineData = querySnapshot.docs[0].data();
//                         setCustomRoutine(routineData.routine);
//                     }
//                 } catch (error) {
//                     console.error("Error al obtener la rutina guardada:", error);
//                 } finally {
//                     setIsLoading(false);
//                 }
//             }
//         };
//         fetchSavedRoutine();
//     }, [user]);

//     // Efecto 2: Cargar la lista de ejercicios de Firestore
//     useEffect(() => {
//         const fetchExercisesFromFirestore = async () => {
//             try {
//                 const querySnapshot = await getDocs(collection(db, "ejercicios"));
//                 const exercises = querySnapshot.docs.map(doc => {
//                     const data = doc.data();
//                     return {
//                         id: doc.id,
//                         nombre: data.nombre,
//                         descripcion: data.descripcion,
//                         grupo_muscular: data.grupo_muscular,
//                         region_cuerpo: data.region_cuerpo,
//                         imagen: data.imagen,
//                         videoUrl: data.video
//                     };
//                 });
//                 if (exercises.length > 0) {
//                     setAllExercises(exercises);
//                     setAvailableRegions(getUniqueValues(exercises, 'region_cuerpo'));
//                     setAvailableMuscleGroups(getUniqueValues(exercises, 'grupo_muscular'));
//                 }
//             } catch (error) {
//                 console.error("Error al obtener ejercicios de Firestore:", error);
//             }
//         };
//         fetchExercisesFromFirestore();
//     }, []);

//     // Efecto 3: Filtrar ejercicios por región y grupo muscular
//     useEffect(() => {
//         let currentExercises = [...allExercises];
//         if (selectedRegion) {
//             currentExercises = currentExercises.filter(ex => ex.region_cuerpo === selectedRegion);
//         }
//         if (selectedMuscleGroup) {
//             currentExercises = currentExercises.filter(ex => ex.grupo_muscular === selectedMuscleGroup);
//         }
//         setFilteredExercises(currentExercises);
//     }, [selectedRegion, selectedMuscleGroup, allExercises]);

//     const getUniqueValues = (data, key) => {
//         if (!data || data.length === 0) return [];
//         const values = data.map(item => item[key]).filter(Boolean);
//         return [...new Set(values)];
//     };

//     const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
//     const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

//     const searchExercises = () => {
//         setShowExerciseList(true);
//     };

//     const enrichRoutineWithDetails = (aiRoutine, allExercises) => {
//         const enrichedRoutine = {
//             days: aiRoutine.days.map(day => ({
//                 ...day,
//                 exercises: day.exercises.map(exerciseFromAI => {
//                     const fullExerciseDetails = allExercises.find(
//                         ex => ex.nombre.toLowerCase() === exerciseFromAI.name.toLowerCase()
//                     );

//                     const enrichedExercise = {
//                         ...exerciseFromAI,
//                         ...fullExerciseDetails,
//                         nombre: fullExerciseDetails ? fullExerciseDetails.nombre : exerciseFromAI.name,
//                         id: fullExerciseDetails ? fullExerciseDetails.id : Date.now() + Math.random()
//                     };

//                     return enrichedExercise;
//                 })
//             }))
//         };
//         return enrichedRoutine;
//     };

//     const fetchRecommendedSplits = async () => {
//         setIsLoading(true);
//         const prompt = `
//             Basado en los siguientes datos de usuario, recomienda 2 o 3 tipos de rutina de entrenamiento (split) que sean los más adecuados.
//             Tu respuesta debe ser un objeto JSON con una propiedad "recommendedSplits" que contenga un array de objetos.
//             Cada objeto en el array debe tener las propiedades: "name" (string con el nombre del split) y "reason" (string con una breve explicación de por qué se recomienda).
//             Los nombres de los splits deben ser uno de estos: "Full Body", "Torso / Pierna", "Push / Pull / Legs" o "Arnold Split".
//             --- Datos del usuario ---
//             Días por semana: ${workoutData.days}
//             Nivel de actividad: ${workoutData.level}
//             Tiempo disponible: ${workoutData.availableTime} minutos

//             **Reglas para la recomendación:**
//             - Si los días son 1 o 2, la mejor opción es "Full Body".
//             - Si los días son 3, las mejores opciones son "Full Body" (para principiantes/intermedios) y "Torso / Pierna" o "Push / Pull / Legs" (para avanzados).
//             - Si los días son 4, las mejores opciones son "Torso / Pierna" y "Push / Pull / Legs".
//             - Si los días son 5 o 6, las mejores opciones son "Push / Pull / Legs" o "Arnold Split".
//             - Si los días son 7, la mejor opción es "Arnold Split" o una variante de "Push / Pull / Legs".
//             Elige las 2 o 3 opciones más adecuadas y proporciona una breve razón para cada una.
//             Retorna solo el objeto JSON.
//         `;
//         try {
//             const response = await axios.post(
//                 OPENAI_API_URL,
//                 {
//                     model: "gpt-4o-mini",
//                     messages: [{ role: "user", content: prompt }],
//                     response_format: { type: "json_object" }
//                 },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${OPENAI_API_KEY}`
//                     }
//                 }
//             );
//             const aiResponse = JSON.parse(response.data.choices[0].message.content);
//             setRecommendedSplits(aiResponse.recommendedSplits);
//         } catch (error) {
//             console.error("Error al obtener las recomendaciones de splits:", error.response?.data || error.message);
//             setRecommendedSplits([
//                 { name: "Full Body", reason: "Opción recomendada para la mayoría de los niveles y tiempos." },
//                 { name: "Torso / Pierna", reason: "Excelente para 4 días a la semana, optimizando el volumen." }
//             ]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const onSelectSplit = async (splitName) => {
//         setIsLoading(true);
//         setSelectedSplit(splitName);
//         setRecommendedSplits(null);
//         setGeneratedRoutine(null); 
//         const restTimes = {
//             weight_loss: 45,
//             muscle_gain: 90,
//             default: 60
//         };
//         const recommendedRest = restTimes[workoutData.goal] || restTimes.default;
//         const getSplitLogic = (split) => {
//             switch (split) {
//                 case "Full Body":
//                     return `- El 'focus' de todos los días debe ser "Cuerpo Completo".
//                              - Incluye ejercicios que trabajen la mayoría de los grupos musculares grandes (piernas, pecho, espalda, hombros, brazos).
//                              - Reparte los ejercicios para que cada día se trabaje todo el cuerpo.`;
//                 case "Torso / Pierna":
//                     return `- Los días de Torso deben incluir ejercicios para Pecho, Espalda, Hombros y Brazos.
//                              - Los días de Pierna deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 case "Push / Pull / Legs":
//                     return `- Los días de Empuje (Push) deben incluir ejercicios para Pecho, Hombros y Tríceps.
//                              - Los días de Tirón (Pull) deben incluir ejercicios para Espalda y Bíceps.
//                              - Los días de Piernas (Legs) deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 case "Arnold Split":
//                     return `- Los días de Pecho y Espalda deben incluir ejercicios de ambos grupos musculares.
//                              - Los días de Hombros y Brazos deben incluir ejercicios de Hombros, Bíceps y Tríceps.
//                              - Los días de Piernas deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
//                 default:
//                     return "";
//             }
//         };
//         const getLevelLogic = (level) => {
//             switch (level) {
//                 case "beginner":
//                     return `- Número de series: 2-3 por ejercicio.
//                              - Rango de repeticiones: 10-15.
//                              - Ejercicios: Simples, con técnica fácil de aprender.
//                              - Número de ejercicios por día: 4-6.`;
//                 case "intermediate":
//                     return `- Número de series: 3-4 por ejercicio.
//                              - Rango de repeticiones: 8-12.
//                              - Ejercicios: Una mezcla de básicos y compuestos.
//                              - Número de ejercicios por día: 5-8.`;
//                 case "advanced":
//                     return `- Número de series: 4-5 por ejercicio.
//                              - Rango de repeticiones: 6-10.
//                              - Ejercicios: Principalmente compuestos, con ejercicios de aislamiento si el tiempo lo permite.
//                              - Número de ejercicios por día: 7-10.`;
//                 default:
//                     return "";
//             }
//         };
//         const prompt = `
//             Genera una rutina de fitness en español para una persona con los siguientes datos.
//             El formato de la respuesta debe ser un objeto JSON con una propiedad "days", que es un array de objetos.
//             Cada objeto de "days" debe tener dos propiedades: "focus" (un string) y "exercises" (un array de objetos).
//             Cada objeto de "exercises" debe tener "name" (string), "sets" (número), "reps" (número), y "rest" (número, en segundos).

//             --- Datos del usuario ---
//             Objetivo: ${workoutData.goal}
//             Nivel de actividad: ${workoutData.level}
//             Días por semana: ${workoutData.days}
//             División de rutina (Split): ${splitName}
//             Tiempo disponible: ${workoutData.availableTime} minutos
//             Edad: ${workoutData.age} años
//             Peso: ${workoutData.weight} kg
//             Altura: ${workoutData.height} cm

//             **INSTRUCCIONES CLAVE PARA LA GENERACIÓN DE LA RUTINA:**

//             1. **TIEMPO DE DESCANSO:** Para cada ejercicio, usa un tiempo de descanso de ${recommendedRest} segundos, ya que es el tiempo recomendado para el objetivo de ${workoutData.goal}.

//             2. **REGLAS PARA LA DIVISIÓN DE RUTINA (SPLIT):**
//             ${getSplitLogic(splitName)}

//             3. **REGLAS PARA CADA NIVEL:**
//             ${getLevelLogic(workoutData.level)}

//             4. **NÚMERO DE EJERCICIOS POR DÍA:**
//             - El número total de ejercicios por día debe ser suficiente para completar la rutina en ${workoutData.availableTime} minutos.
//             - Usa un cálculo aproximado de 5-7 minutos por ejercicio (incluyendo sets y descanso) para determinar la cantidad de ejercicios adecuada.
//             - Prioriza el volumen de ejercicios más alto dentro del rango permitido por el tiempo y el nivel del usuario.

//             Basándote en estos datos y en las reglas anteriores, genera una rutina que sea estrictamente adecuada para el nivel, edad, peso, altura, tiempo disponible y el split elegido por el usuario.
//             Elige los nombres de los ejercicios de una lista conocida por ti, como "Sentadillas", "Dominadas", "Flexiones", "Plancha", etc.

//             Ejemplo del formato JSON:
//             {
//                 "days": [
//                     {
//                         "focus": "Tren Superior",
//                         "exercises": [
//                             { "name": "Flexiones de pecho", "sets": 3, "reps": 10, "rest": 60 },
//                             { "name": "Fondos de tríceps", "sets": 3, "reps": 12, "rest": 60 }
//                         ]
//                     }
//                 ]
//             }
//         `;
//         try {
//             const response = await axios.post(
//                 OPENAI_API_URL,
//                 {
//                     model: "gpt-4o-mini",
//                     messages: [{ role: "user", content: prompt }],
//                     response_format: { type: "json_object" }
//                 },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${OPENAI_API_KEY}`
//                     }
//                 }
//             );
//             const aiResponse = JSON.parse(response.data.choices[0].message.content);
//             const enrichedRoutine = enrichRoutineWithDetails(aiResponse, allExercises);
//             setGeneratedRoutine(enrichedRoutine);
//         } catch (error) {
//             console.error("Error al generar la rutina con IA:", error.response?.data || error.message);
//             setGeneratedRoutine(generateSampleRoutine(workoutData, splitName));
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleAddToCustomFromAI = (exercise, dayIndex) => {
//         addToCustomRoutine(exercise, dayIndex);
//         setAddedExercisesFromAI(prev => [...prev, exercise.id]);
//     };

//     const addToCustomRoutine = (items, dayIndex) => {
//         if (Array.isArray(items)) {
//             const exercisesWithDay = items.map(item => ({
//                 ...item,
//                 sets: item.sets || 3,
//                 reps: item.reps || 12,
//                 rest: item.rest || 60,
//                 day: dayIndex
//             }));
//             setCustomRoutine(prev => [...prev, ...exercisesWithDay]);
//         } else {
//             setCustomRoutine(prev => [...prev, {
//                 ...items,
//                 sets: items.sets || 3,
//                 reps: items.reps || 12,
//                 rest: items.rest || 60,
//                 day: dayIndex || 0
//             }]);
//         }
//     };

//     const removeFromRoutine = (index) => {
//         setCustomRoutine(prev => prev.filter((_, i) => i !== index));
//     };

//     const updateRoutineItem = (index, key, value) => {
//         setCustomRoutine(prev => {
//             const newRoutine = [...prev];
//             newRoutine[index][key] = value;
//             return newRoutine;
//         });
//     };

//     const saveRoutine = async () => {
//         if (!user) {
//             alert("Debes iniciar sesión para guardar tu rutina.");
//             return;
//         }

//         const routineData = {
//             routine: customRoutine,
//             metadata: workoutData,
//             createdAt: new Date().toISOString()
//         };

//         try {
//             const userRoutinesRef = doc(db, 'users', user.uid);
//             const routineDocRef = doc(collection(userRoutinesRef, 'routines'));

//             await setDoc(routineDocRef, routineData);
//             alert('¡Rutina guardada en la nube exitosamente!');
//         } catch (error) {
//             console.error("Error al guardar la rutina en Firestore:", error);
//             alert("Ocurrió un error al guardar la rutina. Por favor, inténtalo de nuevo.");
//         }
//     };

//     const handleExerciseClick = (exercise) => {
//         setSelectedExercise(exercise);
//     };

//     const addDayToCustomRoutine = (newDayIndex) => {
//         setCustomRoutine(prev => [...prev, {
//             nombre: 'Nuevo Ejercicio',
//             id: `new-${Date.now()}`,
//             sets: 3,
//             reps: 12,
//             rest: 60,
//             day: newDayIndex
//         }]);
//     };

//     const removeDayFromCustomRoutine = (dayIndex) => {
//         setCustomRoutine(prev => prev.filter(item => item.day !== dayIndex));
//     };

//     // Nuevas funciones para la sesión de entrenamiento
//     const startWorkoutSession = (dayIndex) => {
//         const exercisesForDay = customRoutine.filter(ex => ex.day === dayIndex);

//         const sessionData = {
//             dayIndex,
//             date: new Date().toISOString(),
//             exercises: exercisesForDay.map(ex => ({
//                 ...ex,
//                 series: Array.from({ length: ex.sets }).map(() => ({ reps: '', carga: '' })),
//                 sensation: 5
//             }))
//         };
//         setActiveSession(sessionData);
//     };

//     const updateSessionItem = (exerciseIndex, seriesIndex, key, value) => {
//         setActiveSession(prev => {
//             if (!prev) return prev;
//             const newSession = { ...prev };
//             if (key === 'sensation') {
//                 newSession.exercises[exerciseIndex][key] = value;
//             } else {
//                 newSession.exercises[exerciseIndex].series[seriesIndex][key] = value;
//             }
//             return newSession;
//         });
//     };

//     const saveWorkoutSession = async () => {
//         if (!user || !activeSession) {
//             alert("No hay una sesión activa para guardar.");
//             return;
//         }

//         try {
//             const historyRef = collection(db, 'users', user.uid, 'history');
//             await setDoc(doc(historyRef), activeSession);
//             alert('¡Sesión de entrenamiento guardada!');
//             setActiveSession(null);
//         } catch (error) {
//             console.error("Error al guardar la sesión en Firestore:", error);
//             alert("Ocurrió un error al guardar la sesión.");
//         }
//     };

//     const addExerciseToSession = (exerciseDetails) => {
//         if (!activeSession) return;

//         setActiveSession(prev => ({
//             ...prev,
//             exercises: [...prev.exercises, {
//                 ...exerciseDetails,
//                 sets: 3,
//                 reps: 12,
//                 rest: 60,
//                 series: Array.from({ length: 3 }).map(() => ({ reps: '', carga: '' })),
//                 sensation: 5
//             }]
//         }));
//     };

//     return {
//         workoutData,
//         setWorkoutData,
//         generatedRoutine,
//         fetchRecommendedSplits,
//         onSelectSplit,
//         exercises: filteredExercises,
//         searchExercises,
//         isLoading,
//         showExerciseList,
//         setShowExerciseList,
//         customRoutine,
//         addToCustomRoutine,
//         removeFromRoutine,
//         updateRoutineItem,
//         saveRoutine,
//         selectedExercise,
//         setSelectedExercise,
//         handleExerciseClick,
//         selectedRegion,
//         setSelectedRegion,
//         selectedMuscleGroup,
//         setSelectedMuscleGroup,
//         availableRegions,
//         availableMuscleGroups,
//         recommendedSplits,
//         addedExercisesFromAI,
//         handleAddToCustomFromAI,
//         addDayToCustomRoutine,
//         removeDayFromCustomRoutine,
//         activeSession,
//         startWorkoutSession,
//         updateSessionItem,
//         saveWorkoutSession,
//         addExerciseToSession
//     };
// };

// const FitnessApp = () => {
//     const { user } = useAuth();
//     const {
//         workoutData,
//         setWorkoutData,
//         generatedRoutine,
//         fetchRecommendedSplits,
//         onSelectSplit,
//         exercises,
//         searchExercises,
//         isLoading,
//         showExerciseList,
//         setShowExerciseList,
//         customRoutine,
//         addToCustomRoutine,
//         removeFromRoutine,
//         updateRoutineItem,
//         saveRoutine,
//         selectedExercise,
//         setSelectedExercise,
//         handleExerciseClick,
//         selectedRegion,
//         setSelectedRegion,
//         selectedMuscleGroup,
//         setSelectedMuscleGroup,
//         availableRegions,
//         availableMuscleGroups,
//         recommendedSplits,
//         addedExercisesFromAI,
//         handleAddToCustomFromAI,
//         addDayToCustomRoutine,
//         removeDayFromCustomRoutine,
//         activeSession,
//         startWorkoutSession,
//         updateSessionItem,
//         saveWorkoutSession,
//         addExerciseToSession
//     } = useFitnessRoutine();

//     const renderContent = () => {
//         if (isLoading) {
//             return <Loading />;
//         }

//         if (activeSession) {
//             return (
//                 <WorkoutSession
//                     activeSession={activeSession}
//                     updateSessionItem={updateSessionItem}
//                     saveWorkoutSession={saveWorkoutSession}
//                     addExerciseToSession={addExerciseToSession}
//                     searchExercises={searchExercises}
//                     setShowExerciseList={setShowExerciseList}
//                     exercises={exercises}
//                     onExerciseClick={handleExerciseClick}
//                     selectedRegion={selectedRegion}
//                     setSelectedRegion={setSelectedRegion}
//                     selectedMuscleGroup={selectedMuscleGroup}
//                     setSelectedMuscleGroup={setSelectedMuscleGroup}
//                     availableRegions={availableRegions}
//                     availableMuscleGroups={availableMuscleGroups}
//                 />
//             );
//         }

//         if (customRoutine.length > 0) {
//             return (
//                 <UserDashboard
//                     customRoutine={customRoutine}
//                     saveRoutine={saveRoutine}
//                     addDayToRoutine={addDayToCustomRoutine}
//                     removeDayFromRoutine={removeDayFromCustomRoutine}
//                     removeFromRoutine={removeFromRoutine}
//                     updateRoutineItem={updateRoutineItem}
//                     addToCustomRoutine={addToCustomRoutine}
//                     searchExercises={searchExercises}
//                     showExerciseList={showExerciseList}
//                     setShowExerciseList={setShowExerciseList}
//                     exercises={exercises}
//                     onExerciseClick={handleExerciseClick}
//                     selectedExercise={selectedExercise}
//                     setSelectedExercise={setSelectedExercise}
//                     selectedRegion={selectedRegion}
//                     setSelectedRegion={setSelectedRegion}
//                     selectedMuscleGroup={selectedMuscleGroup}
//                     setSelectedMuscleGroup={setSelectedMuscleGroup}
//                     availableRegions={availableRegions}
//                     availableMuscleGroups={availableMuscleGroups}
//                     startWorkoutSession={startWorkoutSession}
//                 />
//             );
//         }

//         if (generatedRoutine) {
//             return (
//                 <>
//                     <RoutineDisplay
//                         routine={generatedRoutine}
//                         addToCustomRoutine={handleAddToCustomFromAI}
//                         addedExercisesFromAI={addedExercisesFromAI}
//                     />

//                     <RoutineBuilder
//                         customRoutine={customRoutine}
//                         removeFromRoutine={removeFromRoutine}
//                         updateRoutineItem={updateRoutineItem}
//                         saveRoutine={saveRoutine}
//                         user={user}
//                         searchExercises={searchExercises}
//                         showExerciseList={showExerciseList}
//                         setShowExerciseList={setShowExerciseList}
//                         exercises={exercises}
//                         onExerciseClick={handleExerciseClick}
//                         selectedExercise={selectedExercise}
//                         setSelectedExercise={setSelectedExercise}
//                         selectedRegion={selectedRegion}
//                         setSelectedRegion={setSelectedRegion}
//                         selectedMuscleGroup={selectedMuscleGroup}
//                         setSelectedMuscleGroup={setSelectedMuscleGroup}
//                         availableRegions={availableRegions}
//                         availableMuscleGroups={availableMuscleGroups}
//                         addToCustomRoutine={addToCustomRoutine}
//                     />
//                 </>
//             );
//         }

//         return (
//             <WorkoutForm
//                 workoutData={workoutData}
//                 setWorkoutData={setWorkoutData}
//                 fetchRecommendedSplits={fetchRecommendedSplits}
//                 isLoading={isLoading}
//                 recommendedSplits={recommendedSplits}
//                 onSelectSplit={onSelectSplit}
//             />
//         );
//     };

//     return (
//         <div className="container py-5" style={{ color: 'var(--text-primary)' }}>
//             <div className="text-center mb-5">
//                 <h1 className="display-4 fw-bold mb-3">
//                     <Dumbbell className="me-3" size={48} />
//                     FitnessAI Coach
//                 </h1>
//                 <p className="lead text-muted">
//                     Crea rutinas personalizadas con inteligencia artificial
//                 </p>
//             </div>

//             <hr className="my-4" />

//             {renderContent()}
//         </div>
//     );
// };
// const generateSampleRoutine = (data, split) => {
//     const routines = {
//         "Full Body": {
//             days: [
//                 {
//                     focus: "Cuerpo Completo",
//                     exercises: [
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "remo-con-mancuerna", "name": "Remo con mancuerna", "sets": 3, "reps": 12, "rest": 60 },
//                         { "id": "plancha", "name": "Plancha", "sets": 3, "reps": 30, "rest": 30 }
//                     ]
//                 }
//             ]
//         },
//         "Torso / Pierna": {
//             days: [
//                 {
//                     focus: "Torso",
//                     exercises: [
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 4, "reps": 8, "rest": 90 },
//                         { "id": "dominadas", "name": "Dominadas", "sets": 4, "reps": 6, "rest": 120 }
//                     ]
//                 },
//                 {
//                     focus: "Pierna",
//                     exercises: [
//                         { "id": "sentadillas", "name": "Sentadillas", "sets": 5, "reps": 8, "rest": 120 },
//                         { "id": "peso-muerto", "name": "Peso muerto", "sets": 4, "reps": 6, "rest": 150 }
//                     ]
//                 }
//             ]
//         },
//         "Push / Pull / Legs": {
//             days: [
//                 {
//                     focus: "Empuje (Push)",
//                     exercises: [
//                         { "id": "press-de-hombros", "name": "Press de hombros", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "press-de-banca-inclinado", "name": "Press de banca inclinado", "sets": 3, "reps": 10, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Tirón (Pull)",
//                     exercises: [
//                         { "id": "remo-con-barra", "name": "Remo con barra", "sets": 3, "reps": 10, "rest": 60 },
//                         { "id": "jalon-al-pecho", "name": "Jalón al pecho", "sets": 3, "reps": 12, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Piernas (Legs)",
//                     exercises: [
//                         { "id": "prensa-de-piernas", "name": "Prensa de piernas", "sets": 4, "reps": 12, "rest": 90 },
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 4, "reps": 10, "rest": 90 }
//                     ]
//                 }
//             ]
//         },
//         "Arnold Split": {
//             days: [
//                 {
//                     focus: "Pecho & Espalda",
//                     exercises: [
//                         { "id": "press-de-banca", "name": "Press de banca", "sets": 5, "reps": 8, "rest": 90 },
//                         { "id": "remo-con-barra", "name": "Remo con barra", "sets": 5, "reps": 8, "rest": 90 }
//                     ]
//                 },
//                 {
//                     focus: "Hombros & Brazos",
//                     exercises: [
//                         { "id": "press-de-hombros-con-mancuerna", "name": "Press de hombros con mancuerna", "sets": 4, "reps": 10, "rest": 60 },
//                         { "id": "curl-de-biceps", "name": "Curl de bíceps", "sets": 4, "reps": 10, "rest": 60 },
//                         { "id": "extensiones-de-triceps", "name": "Extensiones de tríceps", "sets": 4, "reps": 10, "rest": 60 }
//                     ]
//                 },
//                 {
//                     focus: "Piernas",
//                     exercises: [
//                         { "id": "sentadilla", "name": "Sentadilla", "sets": 5, "reps": 10, "rest": 120 },
//                         { "id": "peso-muerto-rumano", "name": "Peso muerto rumano", "sets": 4, "reps": 12, "rest": 90 }
//                     ]
//                 }
//             ]
//         }
//     };
//     return routines[split] || routines["Full Body"];
// };

// export default FitnessApp;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getFirestore, collection, getDocs, doc, setDoc, query, orderBy, limit } from "firebase/firestore";
import { Dumbbell } from 'lucide-react';

// Componentes importados
import WorkoutForm from './WorkoutForm';
import RoutineDisplay from './RoutineDisplay';
import UserDashboard from './UserDashboard';
import Loading from '../Loading.jsx';
import RoutineBuilder from './RoutineBuilder';
import WorkoutSession from './WorkoutSession';

// Hooks y bases de datos
import useAuth from '../../hooks/useAuth.js';
import { db } from '../../index.js';

const useFitnessRoutine = () => {
    const [workoutData, setWorkoutData] = useState({
        goal: 'weight_loss',
        level: 'beginner',
        days: 3,
        availableTime: 45,
        gender: '',
        age: '',
        weight: '',
        height: '',
        location: '',
        equipment: ''
    });

    const [selectedSplit, setSelectedSplit] = useState(null);
    const [recommendedSplits, setRecommendedSplits] = useState(null);
    const [generatedRoutine, setGeneratedRoutine] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [customRoutine, setCustomRoutine] = useState([]);
    const [showExerciseList, setShowExerciseList] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [allExercises, setAllExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
    const [availableRegions, setAvailableRegions] = useState([]);
    const [availableMuscleGroups, setAvailableMuscleGroups] = useState([]);
    const [addedExercisesFromAI, setAddedExercisesFromAI] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    // Nuevo estado para guardar el historial de entrenamientos
    const [workoutHistory, setWorkoutHistory] = useState([]);

    const { user } = useAuth();

    // Efecto para cargar la rutina guardada y el historial
    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    setIsLoading(true);

                    // Cargar la última rutina guardada
                    const routinesRef = collection(db, 'users', user.uid, 'routines');
                    const qRoutines = query(routinesRef, orderBy('createdAt', 'desc'), limit(1));
                    const routineSnapshot = await getDocs(qRoutines);

                    if (!routineSnapshot.empty) {
                        const routineData = routineSnapshot.docs[0].data();
                        setCustomRoutine(routineData.routine);
                    }

                    // Cargar el historial de entrenamientos
                    const historyRef = collection(db, 'users', user.uid, 'history');
                    const qHistory = query(historyRef, orderBy('date', 'desc'), limit(5)); // Carga las últimas 5 sesiones
                    const historySnapshot = await getDocs(qHistory);
                    const historyData = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setWorkoutHistory(historyData);

                } catch (error) {
                    console.error("Error al obtener datos:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        const fetchExercisesFromFirestore = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "ejercicios"));
                const exercises = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        nombre: data.nombre,
                        descripcion: data.descripcion,
                        grupo_muscular: data.grupo_muscular,
                        region_cuerpo: data.region_cuerpo,
                        imagen: data.imagen,
                        videoUrl: data.video
                    };
                });
                if (exercises.length > 0) {
                    setAllExercises(exercises);
                    setAvailableRegions(getUniqueValues(exercises, 'region_cuerpo'));
                    setAvailableMuscleGroups(getUniqueValues(exercises, 'grupo_muscular'));
                }
            } catch (error) {
                console.error("Error al obtener ejercicios de Firestore:", error);
            }
        };
        fetchExercisesFromFirestore();
    }, []);

    useEffect(() => {
        let currentExercises = [...allExercises];
        if (selectedRegion) {
            currentExercises = currentExercises.filter(ex => ex.region_cuerpo === selectedRegion);
        }
        if (selectedMuscleGroup) {
            currentExercises = currentExercises.filter(ex => ex.grupo_muscular === selectedMuscleGroup);
        }
        setFilteredExercises(currentExercises);
    }, [selectedRegion, selectedMuscleGroup, allExercises]);

    const getUniqueValues = (data, key) => {
        if (!data || data.length === 0) return [];
        const values = data.map(item => item[key]).filter(Boolean);
        return [...new Set(values)];
    };

    const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
    const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

    const searchExercises = () => {
        setShowExerciseList(true);
    };

    const enrichRoutineWithDetails = (aiRoutine, allExercises) => {
        const enrichedRoutine = {
            days: aiRoutine.days.map(day => ({
                ...day,
                exercises: day.exercises.map(exerciseFromAI => {
                    const fullExerciseDetails = allExercises.find(
                        ex => ex.nombre.toLowerCase() === exerciseFromAI.name.toLowerCase()
                    );

                    const enrichedExercise = {
                        ...exerciseFromAI,
                        ...fullExerciseDetails,
                        nombre: fullExerciseDetails ? fullExerciseDetails.nombre : exerciseFromAI.name,
                        id: fullExerciseDetails ? fullExerciseDetails.id : Date.now() + Math.random()
                    };

                    return enrichedExercise;
                })
            }))
        };
        return enrichedRoutine;
    };

    const fetchRecommendedSplits = async () => {
        setIsLoading(true);
        const prompt = `
            Basado en los siguientes datos de usuario, recomienda 2 o 3 tipos de rutina de entrenamiento (split) que sean los más adecuados.
            Tu respuesta debe ser un objeto JSON con una propiedad "recommendedSplits" que contenga un array de objetos.
            Cada objeto en el array debe tener las propiedades: "name" (string con el nombre del split) y "reason" (string con una breve explicación de por qué se recomienda).
            Los nombres de los splits deben ser uno de estos: "Full Body", "Torso / Pierna", "Push / Pull / Legs" o "Arnold Split".
            --- Datos del usuario ---
            Días por semana: ${workoutData.days}
            Nivel de actividad: ${workoutData.level}
            Tiempo disponible: ${workoutData.availableTime} minutos
            
            **Reglas para la recomendación:**
            - Si los días son 1 o 2, la mejor opción es "Full Body".
            - Si los días son 3, las mejores opciones son "Full Body" (para principiantes/intermedios) y "Torso / Pierna" o "Push / Pull / Legs" (para avanzados).
            - Si los días son 4, las mejores opciones son "Torso / Pierna" y "Push / Pull / Legs".
            - Si los días son 5 o 6, las mejores opciones son "Push / Pull / Legs" o "Arnold Split".
            - Si los días son 7, la mejor opción es "Arnold Split" o una variante de "Push / Pull / Legs".
            Elige las 2 o 3 opciones más adecuadas y proporciona una breve razón para cada una.
            Retorna solo el objeto JSON.
        `;
        try {
            const response = await axios.post(
                OPENAI_API_URL,
                {
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    }
                }
            );
            const aiResponse = JSON.parse(response.data.choices[0].message.content);
            setRecommendedSplits(aiResponse.recommendedSplits);
        } catch (error) {
            console.error("Error al obtener las recomendaciones de splits:", error.response?.data || error.message);
            setRecommendedSplits([
                { name: "Full Body", reason: "Opción recomendada para la mayoría de los niveles y tiempos." },
                { name: "Torso / Pierna", reason: "Excelente para 4 días a la semana, optimizando el volumen." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const onSelectSplit = async (splitName) => {
        setIsLoading(true);
        setSelectedSplit(splitName);
        setRecommendedSplits(null);
        setGeneratedRoutine(null);
        const restTimes = {
            weight_loss: 45,
            muscle_gain: 90,
            default: 60
        };
        const recommendedRest = restTimes[workoutData.goal] || restTimes.default;
        const getSplitLogic = (split) => {
            switch (split) {
                case "Full Body":
                    return `- El 'focus' de todos los días debe ser "Cuerpo Completo".
                             - Incluye ejercicios que trabajen la mayoría de los grupos musculares grandes (piernas, pecho, espalda, hombros, brazos).
                             - Reparte los ejercicios para que cada día se trabaje todo el cuerpo.`;
                case "Torso / Pierna":
                    return `- Los días de Torso deben incluir ejercicios para Pecho, Espalda, Hombros y Brazos.
                             - Los días de Pierna deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
                case "Push / Pull / Legs":
                    return `- Los días de Empuje (Push) deben incluir ejercicios para Pecho, Hombros y Tríceps.
                             - Los días de Tirón (Pull) deben incluir ejercicios para Espalda y Bíceps.
                             - Los días de Piernas (Legs) deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
                case "Arnold Split":
                    return `- Los días de Pecho y Espalda deben incluir ejercicios de ambos grupos musculares.
                             - Los días de Hombros y Brazos deben incluir ejercicios de Hombros, Bíceps y Tríceps.
                             - Los días de Piernas deben incluir ejercicios para Cuádriceps, Femorales, Glúteos y Pantorrillas.`;
                default:
                    return "";
            }
        };
        const getLevelLogic = (level) => {
            switch (level) {
                case "beginner":
                    return `- Número de series: 2-3 por ejercicio.
                             - Rango de repeticiones: 10-15.
                             - Ejercicios: Simples, con técnica fácil de aprender.
                             - Número de ejercicios por día: 4-6.`;
                case "intermediate":
                    return `- Número de series: 3-4 por ejercicio.
                             - Rango de repeticiones: 8-12.
                             - Ejercicios: Una mezcla de básicos y compuestos.
                             - Número de ejercicios por día: 5-8.`;
                case "advanced":
                    return `- Número de series: 4-5 por ejercicio.
                             - Rango de repeticiones: 6-10.
                             - Ejercicios: Principalmente compuestos, con ejercicios de aislamiento si el tiempo lo permite.
                             - Número de ejercicios por día: 7-10.`;
                default:
                    return "";
            }
        };
        const prompt = `
            Genera una rutina de fitness en español para una persona con los siguientes datos.
            El formato de la respuesta debe ser un objeto JSON con una propiedad "days", que es un array de objetos.
            Cada objeto de "days" debe tener dos propiedades: "focus" (un string) y "exercises" (un array de objetos).
            Cada objeto de "exercises" debe tener "name" (string), "sets" (número), "reps" (número), y "rest" (número, en segundos).
            
            --- Datos del usuario ---
            Objetivo: ${workoutData.goal}
            Nivel de actividad: ${workoutData.level}
            Días por semana: ${workoutData.days}
            División de rutina (Split): ${splitName}
            Tiempo disponible: ${workoutData.availableTime} minutos
            Edad: ${workoutData.age} años
            Peso: ${workoutData.weight} kg
            Altura: ${workoutData.height} cm

            **INSTRUCCIONES CLAVE PARA LA GENERACIÓN DE LA RUTINA:**
            
            1. **TIEMPO DE DESCANSO:** Para cada ejercicio, usa un tiempo de descanso de ${recommendedRest} segundos, ya que es el tiempo recomendado para el objetivo de ${workoutData.goal}.

            2. **REGLAS PARA LA DIVISIÓN DE RUTINA (SPLIT):**
            ${getSplitLogic(splitName)}

            3. **REGLAS PARA CADA NIVEL:**
            ${getLevelLogic(workoutData.level)}

            4. **NÚMERO DE EJERCICIOS POR DÍA:**
            - El número total de ejercicios por día debe ser suficiente para completar la rutina en ${workoutData.availableTime} minutos.
            - Usa un cálculo aproximado de 5-7 minutos por ejercicio (incluyendo sets y descanso) para determinar la cantidad de ejercicios adecuada.
            - Prioriza el volumen de ejercicios más alto dentro del rango permitido por el tiempo y el nivel del usuario.

            Basándote en estos datos y en las reglas anteriores, genera una rutina que sea estrictamente adecuada para el nivel, edad, peso, altura, tiempo disponible y el split elegido por el usuario.
            Elige los nombres de los ejercicios de una lista conocida por ti, como "Sentadillas", "Dominadas", "Flexiones", "Plancha", etc.

            Ejemplo del formato JSON:
            {
                "days": [
                    {
                        "focus": "Tren Superior",
                        "exercises": [
                            { "name": "Flexiones de pecho", "sets": 3, "reps": 10, "rest": 60 },
                            { "name": "Fondos de tríceps", "sets": 3, "reps": 12, "rest": 60 }
                        ]
                    }
                ]
            }
        `;
        try {
            const response = await axios.post(
                OPENAI_API_URL,
                {
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    }
                }
            );
            const aiResponse = JSON.parse(response.data.choices[0].message.content);
            const enrichedRoutine = enrichRoutineWithDetails(aiResponse, allExercises);
            setGeneratedRoutine(enrichedRoutine);
        } catch (error) {
            console.error("Error al generar la rutina con IA:", error.response?.data || error.message);
            setGeneratedRoutine(generateSampleRoutine(workoutData, splitName));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCustomFromAI = (exercise, dayIndex) => {
        addToCustomRoutine(exercise, dayIndex);
        setAddedExercisesFromAI(prev => [...prev, exercise.id]);
    };

    const addToCustomRoutine = (items, dayIndex) => {
        if (Array.isArray(items)) {
            const exercisesWithDay = items.map(item => ({
                ...item,
                sets: item.sets || 3,
                reps: item.reps || 12,
                rest: item.rest || 60,
                day: dayIndex
            }));
            setCustomRoutine(prev => [...prev, ...exercisesWithDay]);
        } else {
            setCustomRoutine(prev => [...prev, {
                ...items,
                sets: items.sets || 3,
                reps: items.reps || 12,
                rest: items.rest || 60,
                day: dayIndex || 0
            }]);
        }
    };

    const removeFromRoutine = (index) => {
        setCustomRoutine(prev => prev.filter((_, i) => i !== index));
    };

    const updateRoutineItem = (index, key, value) => {
        setCustomRoutine(prev => {
            const newRoutine = [...prev];
            newRoutine[index][key] = value;
            return newRoutine;
        });
    };

    const saveRoutine = async () => {
        if (!user) {
            alert("Debes iniciar sesión para guardar tu rutina.");
            return;
        }

        const routineData = {
            routine: customRoutine,
            metadata: workoutData,
            createdAt: new Date().toISOString()
        };

        try {
            const userRoutinesRef = doc(db, 'users', user.uid);
            const routineDocRef = doc(collection(userRoutinesRef, 'routines'));

            await setDoc(routineDocRef, routineData);
            alert('¡Rutina guardada en la nube exitosamente!');
        } catch (error) {
            console.error("Error al guardar la rutina en Firestore:", error);
            alert("Ocurrió un error al guardar la rutina. Por favor, inténtalo de nuevo.");
        }
    };

    const handleExerciseClick = (exercise) => {
        setSelectedExercise(exercise);
    };

    const addDayToCustomRoutine = (newDayIndex) => {
        setCustomRoutine(prev => [...prev, {
            nombre: 'Nuevo Ejercicio',
            id: `new-${Date.now()}`,
            sets: 3,
            reps: 12,
            rest: 60,
            day: newDayIndex
        }]);
    };

    const removeDayFromCustomRoutine = (dayIndex) => {
        setCustomRoutine(prev => prev.filter(item => item.day !== dayIndex));
    };

    const startWorkoutSession = (dayIndex) => {
        const exercisesForDay = customRoutine.filter(ex => ex.day === dayIndex);

        const sessionData = {
            dayIndex,
            date: new Date().toISOString(),
            exercises: exercisesForDay.map(ex => ({
                ...ex,
                rest: ex.rest,
                series: Array.from({ length: ex.sets }).map(() => ({
                    reps: ex.reps ? ex.reps.toString() : '',
                    carga: ex.carga ? ex.carga.toString() : ''
                })),
                sensation: 5
            }))
        };
        setActiveSession(sessionData);
    };

    const updateSessionItem = (exerciseIndex, seriesIndex, key, value) => {
        setActiveSession(prev => {
            if (!prev) return prev;
            const newSession = { ...prev };

            if (key === 'rest' || key === 'sensation') {
                newSession.exercises[exerciseIndex][key] = value;
            } else {
                newSession.exercises[exerciseIndex].series[seriesIndex][key] = value;
            }

            return newSession;
        });
    };

    const saveWorkoutSession = async () => {
        if (!user || !activeSession) {
            alert("No hay una sesión activa para guardar.");
            return;
        }

        try {
            const historyRef = collection(db, 'users', user.uid, 'history');
            await setDoc(doc(historyRef), activeSession);
            alert('¡Sesión de entrenamiento guardada!');
            setActiveSession(null);
        } catch (error) {
            console.error("Error al guardar la sesión en Firestore:", error);
            alert("Ocurrió un error al guardar la sesión. Por favor, inténtalo de nuevo.");
        }
    };

    const addExerciseToSession = (exerciseDetails) => {
        if (!activeSession) return;

        setActiveSession(prev => ({
            ...prev,
            exercises: [...prev.exercises, {
                ...exerciseDetails,
                sets: 3,
                reps: 12,
                rest: 60,
                series: Array.from({ length: 3 }).map(() => ({ reps: '', carga: '' })),
                sensation: 5
            }]
        }));
    };

    return {
        workoutData,
        setWorkoutData,
        generatedRoutine,
        fetchRecommendedSplits,
        onSelectSplit,
        exercises: filteredExercises,
        searchExercises,
        isLoading,
        showExerciseList,
        setShowExerciseList,
        customRoutine,
        addToCustomRoutine,
        removeFromRoutine,
        updateRoutineItem,
        saveRoutine,
        selectedExercise,
        setSelectedExercise,
        handleExerciseClick,
        selectedRegion,
        setSelectedRegion,
        selectedMuscleGroup,
        setSelectedMuscleGroup,
        availableRegions,
        availableMuscleGroups,
        recommendedSplits,
        addedExercisesFromAI,
        handleAddToCustomFromAI,
        addDayToCustomRoutine,
        removeDayFromCustomRoutine,
        activeSession,
        startWorkoutSession,
        updateSessionItem,
        saveWorkoutSession,
        addExerciseToSession,
        workoutHistory
    };
};

const FitnessApp = () => {
    const { user } = useAuth();
    const {
        workoutData,
        setWorkoutData,
        generatedRoutine,
        fetchRecommendedSplits,
        onSelectSplit,
        exercises,
        searchExercises,
        isLoading,
        showExerciseList,
        setShowExerciseList,
        customRoutine,
        addToCustomRoutine,
        removeFromRoutine,
        updateRoutineItem,
        saveRoutine,
        selectedExercise,
        setSelectedExercise,
        handleExerciseClick,
        selectedRegion,
        setSelectedRegion,
        selectedMuscleGroup,
        setSelectedMuscleGroup,
        availableRegions,
        availableMuscleGroups,
        recommendedSplits,
        addedExercisesFromAI,
        handleAddToCustomFromAI,
        addDayToCustomRoutine,
        removeDayFromCustomRoutine,
        activeSession,
        startWorkoutSession,
        updateSessionItem,
        saveWorkoutSession,
        addExerciseToSession,
        workoutHistory // Se pasa el historial como prop
    } = useFitnessRoutine();

    const renderContent = () => {
        if (isLoading) {
            return <Loading />;
        }

        if (activeSession) {
            return (
                <WorkoutSession
                    activeSession={activeSession}
                    updateSessionItem={updateSessionItem}
                    saveWorkoutSession={saveWorkoutSession}
                    addExerciseToSession={addExerciseToSession}
                    searchExercises={searchExercises}
                    setShowExerciseList={setShowExerciseList}
                    exercises={exercises}
                    onExerciseClick={handleExerciseClick}
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    selectedMuscleGroup={selectedMuscleGroup}
                    setSelectedMuscleGroup={setSelectedMuscleGroup}
                    availableRegions={availableRegions}
                    availableMuscleGroups={availableMuscleGroups}
                />
            );
        }

        if (customRoutine.length > 0) {
            return (
                <UserDashboard
                    customRoutine={customRoutine}
                    saveRoutine={saveRoutine}
                    addDayToRoutine={addDayToCustomRoutine}
                    removeDayFromRoutine={removeDayFromCustomRoutine}
                    removeFromRoutine={removeFromRoutine}
                    updateRoutineItem={updateRoutineItem}
                    addToCustomRoutine={addToCustomRoutine}
                    searchExercises={searchExercises}
                    showExerciseList={showExerciseList}
                    setShowExerciseList={setShowExerciseList}
                    exercises={exercises}
                    onExerciseClick={handleExerciseClick}
                    selectedExercise={selectedExercise}
                    setSelectedExercise={setSelectedExercise}
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    selectedMuscleGroup={selectedMuscleGroup}
                    setSelectedMuscleGroup={setSelectedMuscleGroup}
                    availableRegions={availableRegions}
                    availableMuscleGroups={availableMuscleGroups}
                    startWorkoutSession={startWorkoutSession}
                    workoutHistory={workoutHistory} // Se pasa el historial
                />
            );
        }

        if (generatedRoutine) {
            return (
                <>
                    <RoutineDisplay
                        routine={generatedRoutine}
                        addToCustomRoutine={handleAddToCustomFromAI}
                        addedExercisesFromAI={addedExercisesFromAI}
                    />

                    <RoutineBuilder
                        customRoutine={customRoutine}
                        removeFromRoutine={removeFromRoutine}
                        updateRoutineItem={updateRoutineItem}
                        saveRoutine={saveRoutine}
                        user={user}
                        searchExercises={searchExercises}
                        showExerciseList={showExerciseList}
                        setShowExerciseList={setShowExerciseList}
                        exercises={exercises}
                        onExerciseClick={handleExerciseClick}
                        selectedExercise={selectedExercise}
                        setSelectedExercise={setSelectedExercise}
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        selectedMuscleGroup={selectedMuscleGroup}
                        setSelectedMuscleGroup={setSelectedMuscleGroup}
                        availableRegions={availableRegions}
                        availableMuscleGroups={availableMuscleGroups}
                        addToCustomRoutine={addToCustomRoutine}
                    />
                </>
            );
        }

        return (
            <WorkoutForm
                workoutData={workoutData}
                setWorkoutData={setWorkoutData}
                fetchRecommendedSplits={fetchRecommendedSplits}
                isLoading={isLoading}
                recommendedSplits={recommendedSplits}
                onSelectSplit={onSelectSplit}
            />
        );
    };

    return (
        <div className="container py-5" style={{ color: 'var(--text-primary)' }}>
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold mb-3">
                    <Dumbbell className="me-3" size={48} />
                    FitnessAI Coach
                </h1>
                <p className="lead text-muted">
                    Crea rutinas personalizadas con inteligencia artificial
                </p>
            </div>

            <hr className="my-4" />

            {renderContent()}
        </div>
    );
};
const generateSampleRoutine = (data, split) => {
    const routines = {
        "Full Body": {
            days: [
                {
                    focus: "Cuerpo Completo",
                    exercises: [
                        { "id": "sentadilla", "name": "Sentadilla", "sets": 3, "reps": 10, "rest": 60 },
                        { "id": "press-de-banca", "name": "Press de banca", "sets": 3, "reps": 10, "rest": 60 },
                        { "id": "remo-con-mancuerna", "name": "Remo con mancuerna", "sets": 3, "reps": 12, "rest": 60 },
                        { "id": "plancha", "name": "Plancha", "sets": 3, "reps": 30, "rest": 30 }
                    ]
                }
            ]
        },
        "Torso / Pierna": {
            days: [
                {
                    focus: "Torso",
                    exercises: [
                        { "id": "press-de-banca", "name": "Press de banca", "sets": 4, "reps": 8, "rest": 90 },
                        { "id": "dominadas", "name": "Dominadas", "sets": 4, "reps": 6, "rest": 120 }
                    ]
                },
                {
                    focus: "Pierna",
                    exercises: [
                        { "id": "sentadillas", "name": "Sentadillas", "sets": 5, "reps": 8, "rest": 120 },
                        { "id": "peso-muerto", "name": "Peso muerto", "sets": 4, "reps": 6, "rest": 150 }
                    ]
                }
            ]
        },
        "Push / Pull / Legs": {
            days: [
                {
                    focus: "Empuje (Push)",
                    exercises: [
                        { "id": "press-de-hombros", "name": "Press de hombros", "sets": 3, "reps": 10, "rest": 60 },
                        { "id": "press-de-banca-inclinado", "name": "Press de banca inclinado", "sets": 3, "reps": 10, "rest": 60 }
                    ]
                },
                {
                    focus: "Tirón (Pull)",
                    exercises: [
                        { "id": "remo-con-barra", "name": "Remo con barra", "sets": 3, "reps": 10, "rest": 60 },
                        { "id": "jalon-al-pecho", "name": "Jalón al pecho", "sets": 3, "reps": 12, "rest": 60 }
                    ]
                },
                {
                    focus: "Piernas (Legs)",
                    exercises: [
                        { "id": "prensa-de-piernas", "name": "Prensa de piernas", "sets": 4, "reps": 12, "rest": 90 },
                        { "id": "sentadilla", "name": "Sentadilla", "sets": 4, "reps": 10, "rest": 90 }
                    ]
                }
            ]
        },
        "Arnold Split": {
            days: [
                {
                    focus: "Pecho & Espalda",
                    exercises: [
                        { "id": "press-de-banca", "name": "Press de banca", "sets": 5, "reps": 8, "rest": 90 },
                        { "id": "remo-con-barra", "name": "Remo con barra", "sets": 5, "reps": 8, "rest": 90 }
                    ]
                },
                {
                    focus: "Hombros & Brazos",
                    exercises: [
                        { "id": "press-de-hombros-con-mancuerna", "name": "Press de hombros con mancuerna", "sets": 4, "reps": 10, "rest": 60 },
                        { "id": "curl-de-biceps", "name": "Curl de bíceps", "sets": 4, "reps": 10, "rest": 60 },
                        { "id": "extensiones-de-triceps", "name": "Extensiones de tríceps", "sets": 4, "reps": 10, "rest": 60 }
                    ]
                },
                {
                    focus: "Piernas",
                    exercises: [
                        { "id": "sentadilla", "name": "Sentadilla", "sets": 5, "reps": 10, "rest": 120 },
                        { "id": "peso-muerto-rumano", "name": "Peso muerto rumano", "sets": 4, "reps": 12, "rest": 90 }
                    ]
                }
            ]
        }
    };
    return routines[split] || routines["Full Body"];
};

export default FitnessApp;