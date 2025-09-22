import React, { useState } from 'react';
import { Dumbbell, Plus, Trash2, Edit2, Play, ChevronDown, ChevronUp } from 'lucide-react';
import ExerciseList from './ExerciseList';
import ExerciseDetailsModal from './ExerciseDetailsModal';

const UserDashboard = ({
    customRoutine,
    saveRoutine,
    addDayToRoutine,
    removeDayFromRoutine,
    removeFromRoutine,
    updateRoutineItem,
    addToCustomRoutine,
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
    startWorkoutSession,
    workoutHistory
}) => {
    const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);

    const groupExercisesByDay = (exercises) => {
        return exercises.reduce((acc, exercise) => {
            const dayKey = exercise.day;
            if (!acc[dayKey]) {
                acc[dayKey] = { dayIndex: dayKey, exercises: [] };
            }
            acc[dayKey].exercises.push(exercise);
            return acc;
        }, {});
    };

    const getExerciseHistory = (exerciseId) => {
        if (!workoutHistory || workoutHistory.length === 0) return [];
        
        // Buscamos el ejercicio en la sesión más reciente
        const mostRecentSession = workoutHistory[0];
        const historicalExercise = mostRecentSession.exercises.find(ex => ex.id === exerciseId);
        
        return historicalExercise ? historicalExercise.series : [];
    };

    const groupedRoutine = groupExercisesByDay(customRoutine);
    const dayKeys = Object.keys(groupedRoutine).sort((a, b) => a - b);
    const lastDayIndex = dayKeys.length > 0 ? Math.max(...dayKeys.map(Number)) : -1;

    const handleAddExercise = (dayIndex) => {
        setEditingExerciseIndex(null);
        searchExercises();
        setShowExerciseList({ show: true, dayIndex });
    };

    const handleSwapExercise = (indexToSwap, dayIndex) => {
        setEditingExerciseIndex(indexToSwap);
        searchExercises();
        setShowExerciseList({ show: true, dayIndex });
    };

    const handleExerciseSelected = (exerciseDetails) => {
        if (editingExerciseIndex !== null) {
            updateRoutineItem(editingExerciseIndex, 'nombre', exerciseDetails.nombre);
            updateRoutineItem(editingExerciseIndex, 'id', exerciseDetails.id);
        } else if (showExerciseList.show) {
            addToCustomRoutine({
                ...exerciseDetails,
                sets: 3,
                reps: 12,
                rest: 60
            }, showExerciseList.dayIndex);
        }
        setShowExerciseList(false);
        setEditingExerciseIndex(null);
    };

    return (
        <div className="container my-5 text-center">
            <h2 className="fw-bold mb-3 d-flex align-items-center justify-content-center">
                <Dumbbell className="me-2" /> Mi Rutina
            </h2>
            <p className="text-muted">Personaliza y gestiona tu rutina de entrenamiento.</p>
            
            <div className="text-end mb-4">
                <button className="btn btn-secondary me-2" onClick={() => addDayToRoutine(lastDayIndex + 1)}>
                    <Plus size={16} /> Agregar Día
                </button>
                <button className="btn btn-primary" onClick={saveRoutine}>
                    <Dumbbell size={16} /> Guardar Cambios
                </button>
            </div>
            
            <div className="row g-4 justify-content-center">
                {dayKeys.map(dayKey => (
                    <div key={dayKey} className="col-md-4">
                        <div className="card shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
                            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                <h5 className="fw-bold mb-0">DÍA {parseInt(dayKey, 10) + 1}</h5>
                                <div>
                                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => startWorkoutSession(parseInt(dayKey, 10))}>
                                        <Play size={16} /> Iniciar
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeDayFromRoutine(parseInt(dayKey, 10))}>
                                        <Trash2 size={16} /> Borrar Día
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="list-group list-group-flush">
                                    {groupedRoutine[dayKey].exercises.map((item, index) => {
                                        const exerciseHistory = getExerciseHistory(item.id);
                                        const lastSeries = exerciseHistory.length > 0 ? exerciseHistory[exerciseHistory.length - 1] : null;
                                        
                                        return (
                                            <div key={index} className="list-group-item d-flex flex-column align-items-stretch mb-2" style={{ backgroundColor: 'var(--bg-light-alt)' }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-1 fw-bold">{item.nombre}</h6>
                                                    <div className="d-flex flex-column align-items-center ms-3">
                                                        <button className="btn btn-sm btn-outline-primary mb-2" onClick={() => handleSwapExercise(customRoutine.findIndex(ex => ex.id === item.id), item.day)}>
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromRoutine(customRoutine.findIndex(ex => ex.id === item.id))}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="row g-2 mt-2">
                                                    <div className="col-4">
                                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Carga (kg)</label>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            value={item.carga || ''}
                                                            onChange={(e) => updateRoutineItem(customRoutine.findIndex(ex => ex.id === item.id), 'carga', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-4">
                                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Series</label>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            value={item.sets}
                                                            onChange={(e) => updateRoutineItem(customRoutine.findIndex(ex => ex.id === item.id), 'sets', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="col-4">
                                                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Reps</label>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            value={item.reps}
                                                            onChange={(e) => updateRoutineItem(customRoutine.findIndex(ex => ex.id === item.id), 'reps', parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Sección de historial con <details> */}
                                                {exerciseHistory.length > 0 && (
                                                    <details className="mt-3 p-2 rounded" style={{ backgroundColor: 'var(--bg-dark-alt)', border: '1px solid var(--border-color)' }}>
                                                        <summary className="d-flex align-items-center justify-content-between text-muted fw-bold" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                                                            <span>Historial del último entrenamiento</span>
                                                            <ChevronDown size={16} />
                                                        </summary>
                                                        <ul className="list-unstyled mb-0 mt-2">
                                                            {exerciseHistory.map((series, seriesIndex) => (
                                                                <li key={seriesIndex} className="d-flex justify-content-between">
                                                                    <span>Serie {seriesIndex + 1}:</span>
                                                                    <span>
                                                                        {series.carga || '--'}kg x {series.reps || '--'} reps
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </details>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <button className="btn btn-outline-secondary mt-3" onClick={() => handleAddExercise(parseInt(dayKey, 10))}>
                                        <Plus size={16} className="me-2" /> Agregar Ejercicio
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showExerciseList.show && (
                <div className="modal-backdrop">
                    <ExerciseList
                        exercises={exercises}
                        onExerciseClick={handleExerciseSelected}
                        onClose={() => setShowExerciseList(false)}
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        selectedMuscleGroup={selectedMuscleGroup}
                        setSelectedMuscleGroup={setSelectedMuscleGroup}
                        availableRegions={availableRegions}
                        availableMuscleGroups={availableMuscleGroups}
                    />
                </div>
            )}
            
            {selectedExercise && (
                <div className="modal-backdrop">
                    <ExerciseDetailsModal
                        exercise={selectedExercise}
                        onClose={() => setSelectedExercise(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default UserDashboard;