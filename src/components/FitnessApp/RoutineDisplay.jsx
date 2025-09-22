// import React from 'react';
// import { Plus } from 'lucide-react';

// const RoutineDisplay = ({ routine, addToCustomRoutine }) => {
//     return (
//         <div className="mt-5">
//             <h2 className="text-center mb-4 fw-bold">Rutina Sugerida por IA</h2>
//             <div className="row g-4 justify-content-center">
//                 {routine.days.map((day, dayIndex) => (
//                     <div className="col-md-6 col-lg-4" key={dayIndex}>
//                         <div className="card h-100 shadow-sm bg-dark text-white">
//                             <div className="card-body">
//                                 <h5 className="card-title text-center fw-bold" style={{ color: 'var(--accent-color)' }}>
//                                     Día {dayIndex + 1} - {day.focus}
//                                 </h5>
//                                 <hr className="my-3 border-secondary" />
//                                 <ul className="list-group list-group-flush">
//                                     {day.exercises.map((exercise, exIndex) => (
//                                         <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-white" key={exIndex}>
//                                             <div>
//                                                 <h6 className="mb-0">{exercise.name}</h6>
//                                                 <small className="text-muted">
//                                                     {exercise.sets} series de {exercise.reps} repeticiones | Descanso: {exercise.rest}s
//                                                 </small>
//                                             </div>
//                                         </li>
//                                     ))}
//                                 </ul>
//                                 <div className="text-center mt-3">
//                                     <button
//                                         className="btn btn-outline-primary"
//                                         onClick={() => addToCustomRoutine(day.exercises, dayIndex)}
//                                     >
//                                         <Plus size={16} /> Agregar Día Completo
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default RoutineDisplay;

import React from 'react';
import { Plus } from 'lucide-react';

const RoutineDisplay = ({ routine, addToCustomRoutine, addedExercisesFromAI }) => {
    return (
        <div className="container my-5">
            <h2 className="text-center fw-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
                RUTINA SUGERIDA POR IA
            </h2>
            
            <div className="row g-4 justify-content-center">
                {routine.days.map((day, dayIndex) => {
                    const exercisesToDisplay = day.exercises.filter(ex => !addedExercisesFromAI.includes(ex.id));
                    const allExercisesAdded = day.exercises.every(ex => addedExercisesFromAI.includes(ex.id));

                    if (allExercisesAdded) {
                        return null;
                    }

                    const handleAddDay = () => {
                        addToCustomRoutine(day.exercises, dayIndex);
                    };

                    return (
                        <div key={dayIndex} className="col-md-4">
                            <div className="card shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
                                <div className="card-header text-center fw-bold" style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                    DÍA {dayIndex + 1} - {day.focus.toUpperCase()}
                                </div>
                                <div className="card-body">
                                    <div className="list-group list-group-flush">
                                        {exercisesToDisplay.map((exercise) => (
                                            <div key={exercise.id} className="list-group-item d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--card-bg)', border: 'none' }}>
                                                <div>
                                                    <h6 className="mb-1 fw-bold">{exercise.name}</h6>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                                                        {exercise.sets} series de {exercise.reps} repeticiones | Descanso: {exercise.rest}s
                                                    </p>
                                                </div>
                                                <button 
                                                    className="btn btn-sm btn-outline-success rounded-circle d-flex align-items-center justify-content-center" 
                                                    style={{ width: '32px', height: '32px' }}
                                                    onClick={() => addToCustomRoutine(exercise, dayIndex)}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="card-footer" style={{ backgroundColor: 'transparent', borderTop: 'none' }}>
                                    <button 
                                        className="btn btn-primary w-100"
                                        onClick={handleAddDay}
                                    >
                                        <Plus size={16} className="me-2" /> Agregar Día Completo
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RoutineDisplay;
