

// import React, { useState } from 'react';
// import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
// import { Dumbbell, Calendar, Target, Clock, Activity, Brain } from 'lucide-react';

// const WorkoutForm = ({ workoutData, setWorkoutData, fetchRecommendedSplits, isLoading, recommendedSplits, onSelectSplit }) => {
//     const [step, setStep] = useState(1);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setWorkoutData(prevData => ({
//             ...prevData,
//             [name]: value
//         }));
//     };

//     const handleNextStep = (e) => {
//         e.preventDefault();
//         setStep(prevStep => prevStep + 1);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         await fetchRecommendedSplits();
//         setStep(4); // Pasamos al nuevo paso para mostrar los splits
//     };

//     const renderStep = () => {
//         switch (step) {
//             case 1:
//                 return (
//                     <>
//                         <FormGroup>
//                             <Label htmlFor="goal" className="text-white">
//                                 <Target className="me-2" size={18} />Objetivo
//                             </Label>
//                             <Input type="select" name="goal" id="goal" value={workoutData.goal} onChange={handleChange} className="form-control-dark">
//                                 <option value="weight_loss">Pérdida de Peso</option>
//                                 <option value="muscle_gain">Ganancia Muscular</option>
//                                 <option value="strength">Aumento de Fuerza</option>
//                             </Input>
//                         </FormGroup>
//                         <FormGroup>
//                             <Label htmlFor="level" className="text-white">
//                                 <Activity className="me-2" size={18} />Nivel de Actividad
//                             </Label>
//                             <Input type="select" name="level" id="level" value={workoutData.level} onChange={handleChange} className="form-control-dark">
//                                 <option value="beginner">Principiante</option>
//                                 <option value="intermediate">Intermedio</option>
//                                 <option value="advanced">Avanzado</option>
//                             </Input>
//                         </FormGroup>
//                         <Button color="primary" className="w-100 fw-bold py-2 mt-4" onClick={handleNextStep}>
//                             Siguiente
//                         </Button>
//                     </>
//                 );
//             case 2:
//                 return (
//                     <>
//                         <FormGroup>
//                             <Label htmlFor="days" className="text-white">
//                                 <Calendar className="me-2" size={18} />Días por Semana
//                             </Label>
//                             <Input type="number" name="days" id="days" value={workoutData.days} onChange={handleChange} min="1" max="7" className="form-control-dark" />
//                         </FormGroup>
//                         <FormGroup>
//                             <Label htmlFor="availableTime" className="text-white">
//                                 <Clock className="me-2" size={18} />Tiempo Disponible (min)
//                             </Label>
//                             <Input type="number" name="availableTime" id="availableTime" value={workoutData.availableTime} onChange={handleChange} min="15" className="form-control-dark" />
//                         </FormGroup>
//                         <Button color="primary" className="w-100 fw-bold py-2 mt-4" onClick={handleNextStep}>
//                             Siguiente
//                         </Button>
//                     </>
//                 );
//             case 3:
//                 return (
//                     <>
//                         <FormGroup>
//                             <Label htmlFor="age" className="text-white">
//                                 Edad
//                             </Label>
//                             <Input type="number" name="age" id="age" value={workoutData.age} onChange={handleChange} min="10" max="100" className="form-control-dark" />
//                         </FormGroup>
//                         <FormGroup>
//                             <Label htmlFor="weight" className="text-white">
//                                 Peso (kg)
//                             </Label>
//                             <Input type="number" name="weight" id="weight" value={workoutData.weight} onChange={handleChange} min="30" max="300" className="form-control-dark" />
//                         </FormGroup>
//                         <FormGroup>
//                             <Label htmlFor="height" className="text-white">
//                                 Altura (cm)
//                             </Label>
//                             <Input type="number" name="height" id="height" value={workoutData.height} onChange={handleChange} min="100" max="250" className="form-control-dark" />
//                         </FormGroup>
//                         <Button
//                             color="primary"
//                             className="w-100 fw-bold py-2 mt-4"
//                             type="submit"
//                             disabled={isLoading}
//                         >
//                             {isLoading ? 'Analizando...' :
//                                 <>
//                                     <Brain className="me-2" size={18} />
//                                     Obtener Recomendaciones
//                                 </>
//                             }
//                         </Button>
//                     </>
//                 );
//             case 4:
//                 return (
//                     <>
//                         <h4 className="text-center text-white mb-4">Elige tu rutina ideal:</h4>
//                         {recommendedSplits && recommendedSplits.map((split, index) => (
//                             <div key={index} className="card bg-dark text-white mb-3" style={{ cursor: 'pointer' }} onClick={() => onSelectSplit(split.name)}>
//                                 <div className="card-body">
//                                     <h5 className="card-title text-primary">{split.name}</h5>
//                                     <p className="card-text">{split.reason}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </>
//                 );
//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className="p-4 rounded shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
//             <Form onSubmit={handleSubmit}>
//                 {renderStep()}
//             </Form>
//         </div>
//     );
// };

// export default WorkoutForm;

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