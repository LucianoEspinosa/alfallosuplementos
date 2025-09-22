import { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../index.js';
import { doc, setDoc, collection } from 'firebase/firestore';

const useFitnessRoutine = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [customRoutine, setCustomRoutine] = useState([]);
    const [workoutData, setWorkoutData] = useState({
        name: '',
        duration: '',
        difficulty: ''
    });

    useEffect(() => {
        const savedRoutine = JSON.parse(localStorage.getItem('customRoutine'));
        if (savedRoutine) {
            setCustomRoutine(savedRoutine);
        }
    }, []);

    const searchExercises = async () => {
        if (!searchTerm.trim()) return;
        try {
            const response = await axios.get(
                `https://api.api-ninjas.com/v1/exercises?muscle=${searchTerm}`,
                {
                    headers: { 'X-Api-Key': 'TU_API_KEY' },
                }
            );
            setSearchResults(response.data);
        } catch (error) {
            console.error("Error al buscar ejercicios:", error);
            setSearchResults([]);
        }
    };

    const addExerciseToRoutine = (exercise) => {
        setCustomRoutine([...customRoutine, { ...exercise, sets: 1, reps: 10 }]);
        localStorage.setItem('customRoutine', JSON.stringify([...customRoutine, { ...exercise, sets: 1, reps: 10 }]));
    };

    const removeFromRoutine = (exerciseName) => {
        const newRoutine = customRoutine.filter(item => item.name !== exerciseName);
        setCustomRoutine(newRoutine);
        localStorage.setItem('customRoutine', JSON.stringify(newRoutine));
    };

    const updateRoutineItem = (exerciseName, field, value) => {
        const updatedRoutine = customRoutine.map(item =>
            item.name === exerciseName ? { ...item, [field]: value } : item
        );
        setCustomRoutine(updatedRoutine);
        localStorage.setItem('customRoutine', JSON.stringify(updatedRoutine));
    };

    const saveRoutine = async (user) => {
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

    return {
        searchTerm,
        setSearchTerm,
        searchResults,
        customRoutine,
        workoutData,
        setWorkoutData,
        searchExercises,
        addExerciseToRoutine,
        removeFromRoutine,
        updateRoutineItem,
        saveRoutine
    };
};

export default useFitnessRoutine;