import React from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';
import ejerciciosData from '../../data/ejercicios.json'; 

const UploadExercises = () => {
    // Asegúrate de que esta configuración coincida exactamente con la de tu proyecto de Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDzq1YMmk1KGBAVB6JU7Yl9T2OJUE1XDd4",
        authDomain: "fragancesnet.firebaseapp.com",
        projectId: "fragancesnet",
        storageBucket: "fragancesnet.appspot.com",
        messagingSenderId: "10863367691",
        appId: "1:10863367691:web:16d834616cdc2b996a190e"
    };

    const uploadExercises = async () => {
        try {
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const exercisesCollection = collection(db, 'ejercicios');
            
            const batch = writeBatch(db);
            let count = 0;

            // El JSON tiene un objeto principal llamado "ejercicios"
            const categories = ejerciciosData.ejercicios;

            // Iteramos sobre cada categoría (espalda, pecho, etc.)
            for (const categoria in categories) {
                const exercises = categories[categoria];
                
                // Iteramos sobre cada ejercicio dentro de la categoría
                exercises.forEach(ejercicio => {
                    const newExercise = {
                        ...ejercicio,
                        grupo_muscular: categoria,
                        region_cuerpo: ''
                    };

                    // Asignamos la región del cuerpo basada en la categoría para los filtros
                    if (['espalda', 'pecho', 'hombros', 'biceps', 'triceps', 'antebrazos'].includes(categoria)) {
                        newExercise.region_cuerpo = 'Tren superior';
                    } else if (categoria === 'piernas') {
                        newExercise.region_cuerpo = 'Tren inferior';
                    } else if (categoria === 'zona media') {
                        newExercise.region_cuerpo = 'Core';
                    }
                    
                    const docRef = doc(exercisesCollection);
                    batch.set(docRef, newExercise);
                    count++;
                });
            }

            await batch.commit();
            alert(`${count} ejercicios subidos exitosamente a la colección 'ejercicios' en Firebase!`);
        } catch (error) {
            console.error('Error al subir los ejercicios:', error);
            alert('Error al subir los ejercicios: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>Subir Ejercicios a Firestore</h2>
            <button
                onClick={uploadExercises}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Subir Ejercicios
            </button>
            <p style={{ marginTop: '15px', color: '#666' }}>
                Se subirán todos los ejercicios del archivo JSON a la colección "ejercicios".
            </p>
        </div>
    );
};

export default UploadExercises;