import React from 'react';
import { CheckCircle, Dumbbell } from 'lucide-react';

// Nuevo componente para la visualización de un solo día
const DayCard = ({ dayIndex, exercises }) => {
    // Si no hay ejercicios para este día, no renderizar nada
    if (exercises.length === 0) {
        return null;
    }

    return (
        <div className="col-md-4">
            <div className="card shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="card-header text-center fw-bold" style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                    DÍA {dayIndex + 1}
                </div>
                <div className="card-body">
                    <div className="list-group list-group-flush">
                        {exercises.map((item, index) => (
                            <div key={index} className="list-group-item" style={{ backgroundColor: 'var(--card-bg)', border: 'none' }}>
                                <div>
                                    <h6 className="mb-1 fw-bold">{item.nombre}</h6>
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                                        Series: {item.sets} | Reps: {item.reps} | Descanso: {item.rest}s
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


const SavedRoutineDisplay = ({ routine, onReset }) => {
    // Función para agrupar los ejercicios por su propiedad 'day'
    const groupExercisesByDay = (exercises) => {
        return exercises.reduce((acc, exercise) => {
            const dayKey = exercise.day;
            if (!acc[dayKey]) {
                acc[dayKey] = [];
            }
            acc[dayKey].push(exercise);
            return acc;
        }, {});
    };

    const groupedRoutine = groupExercisesByDay(routine);
    const dayKeys = Object.keys(groupedRoutine).sort((a, b) => a - b);

    return (
        <div className="container my-5 text-center">
            <h2 className="fw-bold mb-3" style={{ color: 'var(--accent-color)' }}>
                ¡Rutina Guardada con Éxito!
            </h2>
            <div className="mb-4">
                <CheckCircle size={80} color="#28a745" />
            </div>

            <div className="text-start mb-4">
                <h4 className="fw-bold mb-3 d-flex align-items-center"><Dumbbell className="me-2" /> Mi Rutina</h4>
            </div>

            <div className="row g-4 justify-content-center">
                {dayKeys.map(dayKey => (
                    <DayCard
                        key={dayKey}
                        dayIndex={parseInt(dayKey, 10)}
                        exercises={groupedRoutine[dayKey]}
                    />
                ))}
            </div>

            <button className="btn btn-secondary mt-5" onClick={onReset}>Volver al inicio</button>
        </div>
    );
};

export default SavedRoutineDisplay;