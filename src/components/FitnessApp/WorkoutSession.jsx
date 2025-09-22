import React, { useState, useEffect } from 'react';
import { Play, Pause, FastForward, Check, Clock, Edit, Plus } from 'lucide-react';

const WorkoutSession = ({
    activeSession,
    updateSessionItem,
    saveWorkoutSession,
    addExerciseToSession,
    searchExercises,
    setShowExerciseList,
    selectedRegion,
    setSelectedRegion,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    availableRegions,
    availableMuscleGroups,
    onClose
}) => {
    const [restTimer, setRestTimer] = useState(null);
    const [totalTime, setTotalTime] = useState(0);

    // Cronómetro total del entrenamiento
    useEffect(() => {
        const timerId = setInterval(() => {
            setTotalTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    // Cronómetro de descanso entre series
    useEffect(() => {
        if (restTimer > 0) {
            const timerId = setInterval(() => {
                setRestTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [restTimer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSetChange = (exerciseIndex, seriesIndex, key, value) => {
        updateSessionItem(exerciseIndex, seriesIndex, key, value);
    };

    return (
        <div className="container my-5 text-center">
            <h2 className="fw-bold mb-3 d-flex align-items-center justify-content-center">
                <Play className="me-2" />
                Sesión de Entrenamiento
            </h2>
            <p className="text-muted">Día {activeSession.dayIndex + 1}</p>

            <div className="d-flex justify-content-center mb-4">
                <div className="me-4 text-center">
                    <h5 className="mb-0">Tiempo Total</h5>
                    <p className="lead fw-bold">{formatTime(totalTime)}</p>
                </div>
                <div className="text-center">
                    <h5 className="mb-0">Descanso</h5>
                    <p className="lead fw-bold text-danger">{restTimer > 0 ? formatTime(restTimer) : '00:00'}</p>
                </div>
            </div>

            <div className="row g-4 justify-content-center">
                {activeSession.exercises.map((exercise, exerciseIndex) => (
                    <div key={exercise.id} className="col-md-6">
                        <div className="card shadow-sm h-100" style={{ backgroundColor: 'var(--card-bg)' }}>
                            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                <h5 className="fw-bold mb-0">{exercise.nombre}</h5>
                                <button className="btn btn-sm btn-outline-secondary">
                                    <Edit size={16} />
                                </button>
                            </div>
                            <div className="card-body text-start">
                                {exercise.series.map((series, seriesIndex) => (
                                    <div key={seriesIndex} className="d-flex align-items-center mb-2">
                                        <h6 className="me-3 mb-0">Serie {seriesIndex + 1}</h6>
                                        <input
                                            type="number"
                                            placeholder="Peso (kg)"
                                            className="form-control me-2"
                                            value={series.carga}
                                            onChange={(e) => handleSetChange(exerciseIndex, seriesIndex, 'carga', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Reps"
                                            className="form-control me-2"
                                            value={series.reps}
                                            onChange={(e) => handleSetChange(exerciseIndex, seriesIndex, 'reps', e.target.value)}
                                        />
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setRestTimer(exercise.rest || 60)}>
                                            <Clock size={16} />
                                        </button>
                                    </div>
                                ))}

                                <div className="mt-3">
                                    <label className="form-label">Sensación de Esfuerzo (1-10)</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={exercise.sensation || 5}
                                        onChange={(e) => updateSessionItem(exerciseIndex, null, 'sensation', parseInt(e.target.value))}
                                        className="form-range"
                                    />
                                    <div className="d-flex justify-content-between">
                                        <small className="text-muted">Fácil (1)</small>
                                        <small className="text-muted">Extremo (10)</small>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="form-label">Descanso (segundos)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={exercise.rest || ''} // Usamos un fallback a string vacío para evitar NaN en el input
                                        onChange={(e) => updateSessionItem(exerciseIndex, null, 'rest', parseInt(e.target.value) || 0)} // Convertimos a número
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 text-center">
                <button
                    className="btn btn-primary btn-lg me-3"
                    onClick={saveWorkoutSession}
                >
                    <Check size={20} /> Finalizar Día
                </button>
                <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => {
                        searchExercises();
                        setShowExerciseList({ show: true, dayIndex: activeSession.dayIndex });
                    }}
                >
                    <Plus size={20} /> Agregar Ejercicio
                </button>
            </div>
        </div>
    );
};

export default WorkoutSession;