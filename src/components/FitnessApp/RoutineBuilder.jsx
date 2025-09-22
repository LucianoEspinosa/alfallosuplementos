import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, Activity } from 'lucide-react';
import ExerciseList from './ExerciseList';
import ExerciseDetailsModal from './ExerciseDetailsModal';

const daysOfWeek = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];

const RoutineBuilder = ({
    customRoutine,
    addToCustomRoutine,
    removeFromRoutine,
    updateRoutineItem,
    saveRoutine,
    searchExercises,
    showExerciseList,
    setShowExerciseList,
    exercises,
    onExerciseClick,
    selectedExercise,
    setSelectedExercise,
    selectedRegion,
    setSelectedRegion,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    availableRegions,
    availableMuscleGroups,
    user,
    workoutData
}) => {
    const [activeDayIndex, setActiveDayIndex] = useState(0);

    const handleSave = () => {
        saveRoutine(user);
    };

    const handleAddExerciseToDay = (dayIndex) => {
        setActiveDayIndex(dayIndex);
        searchExercises();
    };

    const handleAddToCustomRoutine = (exercise) => {
        addToCustomRoutine(exercise, activeDayIndex);
        setShowExerciseList(false);
    };
    
    // Función para agrupar los ejercicios por día
    const groupedRoutine = customRoutine.reduce((acc, currentItem, index) => {
        const day = currentItem.day;
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push({ ...currentItem, originalIndex: index });
        return acc;
    }, {});
    
    // Función para eliminar el ejercicio usando el índice original
    const handleRemoveFromRoutine = (originalIndex) => {
        removeFromRoutine(originalIndex);
    };
    
    // Función para actualizar el ejercicio usando el índice original
    const handleUpdateRoutineItem = (originalIndex, key, value) => {
        updateRoutineItem(originalIndex, key, value);
    };
    

    return (
        <div className="container my-5">
            <div className="d-flex flex-wrap gap-2 mb-4">
                {daysOfWeek.slice(0, workoutData.days).map((day, index) => (
                    <button
                        key={index}
                        className={`btn ${activeDayIndex === index ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveDayIndex(index)}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className="card shadow-sm p-4 mb-4" style={{ backgroundColor: 'var(--card-bg)' }}>
                <h4 className="card-title fw-bold">
                    <Activity size={24} className="me-2" />
                    Rutina Personalizada - {daysOfWeek[activeDayIndex]}
                </h4>
                <p className="text-muted">
                    Aquí puedes añadir y modificar los ejercicios de tu rutina.
                </p>

                <div className="list-group mb-4">
                    {groupedRoutine[activeDayIndex]?.length > 0 ? (
                        groupedRoutine[activeDayIndex].map((item, index) => (
                            <div key={item.originalIndex} className="list-group-item d-flex align-items-center mb-2" style={{ backgroundColor: 'var(--bg-light-alt)' }}>
                                <div className="flex-grow-1">
                                    <h6 className="mb-1 fw-bold">{item.nombre}</h6>
                                    <div className="d-flex flex-wrap align-items-center">
                                        <div className="me-3">Series: <input type="number" value={item.sets} onChange={(e) => handleUpdateRoutineItem(item.originalIndex, 'sets', parseInt(e.target.value))} className="form-control-sm" style={{ width: '60px' }} /></div>
                                        <div className="me-3">Reps: <input type="number" value={item.reps} onChange={(e) => handleUpdateRoutineItem(item.originalIndex, 'reps', parseInt(e.target.value))} className="form-control-sm" style={{ width: '60px' }} /></div>
                                        <div>Descanso: <input type="number" value={item.rest} onChange={(e) => handleUpdateRoutineItem(item.originalIndex, 'rest', parseInt(e.target.value))} className="form-control-sm" style={{ width: '60px' }} />s</div>
                                    </div>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => handleRemoveFromRoutine(item.originalIndex)}><Trash2 size={16} /></button>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted text-center py-4">No hay ejercicios para este día. ¡Añade algunos!</p>
                    )}
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-secondary flex-grow-1" onClick={() => handleAddExerciseToDay(activeDayIndex)}>
                        <Plus size={16} className="me-2" /> Agregar ejercicio
                    </button>
                    <button className="btn btn-success flex-grow-1" onClick={handleSave} disabled={customRoutine.length === 0}>
                        <Save size={16} className="me-2" /> Guardar rutina
                    </button>
                </div>
            </div>

            {showExerciseList && (
                <ExerciseList
                    exercises={exercises}
                    addToCustomRoutine={handleAddToCustomRoutine}
                    onClose={() => setShowExerciseList(false)}
                    onExerciseClick={onExerciseClick}
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    selectedMuscleGroup={selectedMuscleGroup}
                    setSelectedMuscleGroup={setSelectedMuscleGroup}
                    availableRegions={availableRegions}
                    availableMuscleGroups={availableMuscleGroups}
                />
            )}
            
            {selectedExercise && (
                <ExerciseDetailsModal
                    exercise={selectedExercise}
                    onClose={() => setSelectedExercise(null)}
                />
            )}
        </div>
    );
};

export default RoutineBuilder;