import React from 'react';
import { Dumbbell, Calendar, Target, Clock, Activity, Brain } from 'lucide-react';
import Loading from '../Loading'; // Asumiendo que ya tienes este componente

const WorkoutForm = ({ 
    workoutData, 
    setWorkoutData, 
    fetchRecommendedSplits, 
    isLoading, 
    recommendedSplits, 
    onSelectSplit 
}) => {
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setWorkoutData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        fetchRecommendedSplits();
    };

    // Esta es la parte de la lógica clave
    if (recommendedSplits) {
        return (
            <div className="card shadow-sm p-4 mb-4" style={{ backgroundColor: 'var(--card-bg)' }}>
                <h4 className="card-title fw-bold text-center mb-3">
                    <Brain size={24} className="me-2" />
                    Splits de rutina recomendados
                </h4>
                <p className="text-center text-muted">
                    Elige el tipo de rutina que mejor se adapte a tus objetivos.
                </p>
                <div className="d-grid gap-3">
                    {recommendedSplits.map((split) => (
                        <button
                            key={split.name}
                            className="btn btn-outline-primary py-3"
                            onClick={() => onSelectSplit(split.name)}
                        >
                            <h5 className="fw-bold mb-1">{split.name}</h5>
                            <p className="mb-0" style={{ fontSize: '0.9rem' }}>{split.reason}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="card shadow-sm p-4 mb-4" style={{ backgroundColor: 'var(--card-bg)' }}>
            <h4 className="card-title fw-bold text-center mb-3">
                <Dumbbell size={24} className="me-2" />
                Crea tu rutina
            </h4>
            <p className="text-center text-muted">
                Dinos un poco sobre ti y tus objetivos.
            </p>
            <form onSubmit={handleFormSubmit}>
                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <label className="form-label d-flex align-items-center"><Target size={16} className="me-2" /> Objetivo</label>
                        <select name="goal" className="form-select" value={workoutData.goal} onChange={handleInputChange}>
                            <option value="weight_loss">Pérdida de peso</option>
                            <option value="muscle_gain">Ganancia muscular</option>
                            <option value="endurance">Resistencia</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label d-flex align-items-center"><Activity size={16} className="me-2" /> Nivel de actividad</label>
                        <select name="level" className="form-select" value={workoutData.level} onChange={handleInputChange}>
                            <option value="beginner">Principiante</option>
                            <option value="intermediate">Intermedio</option>
                            <option value="advanced">Avanzado</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label d-flex align-items-center"><Calendar size={16} className="me-2" /> Días por semana</label>
                        <input type="number" name="days" className="form-control" value={workoutData.days} onChange={handleInputChange} min="1" max="7" />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label d-flex align-items-center"><Clock size={16} className="me-2" /> Tiempo disponible (min)</label>
                        <input type="number" name="availableTime" className="form-control" value={workoutData.availableTime} onChange={handleInputChange} min="15" />
                    </div>
                </div>
                
                <div className="text-center">
                    <button type="submit" className="btn btn-primary btn-lg">Generar splits</button>
                </div>
            </form>
        </div>
    );
};

export default WorkoutForm;