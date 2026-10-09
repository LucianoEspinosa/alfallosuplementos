import React from 'react';
import { X, Search, Plus } from 'lucide-react';
import { Card, CardBody, CardTitle, CardSubtitle, Button, Row, Col } from 'reactstrap';

const ExerciseList = ({
    exercises,
    addToCustomRoutine,
    onClose,
    onExerciseClick,
    selectedRegion,
    setSelectedRegion,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    availableRegions,
    availableMuscleGroups
}) => {
    const handleRegionChange = (e) => {
        setSelectedRegion(e.target.value);
        // Si la región cambia, reseteamos el grupo muscular
        setSelectedMuscleGroup('');
    };

    const handleMuscleChange = (e) => {
        setSelectedMuscleGroup(e.target.value);
    };

    const handleResetFilters = () => {
        setSelectedRegion('');
        setSelectedMuscleGroup('');
    };

    return (
        <div className="mt-5 p-4 bg-light rounded shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 text-dark">
                    <Search className="me-2" />
                    Lista de Ejercicios
                </h3>
                <button className="btn btn-secondary-outline" onClick={onClose}>
                    <X size={24} color="#6c757d" />
                </button>
            </div>

            {/* --- Contenedor de filtros --- */}
            <div className="mb-4 d-flex flex-wrap align-items-center">
                <div className="me-3 mb-2">
                    <label htmlFor="regionFilter" className="form-label d-block text-dark">
                        Región:
                    </label>
                    <select
                        id="regionFilter"
                        className="form-select"
                        value={selectedRegion}
                        onChange={handleRegionChange}
                    >
                        <option value="">Todas las regiones</option>
                        {availableRegions.map(region => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                </div>

                <div className="me-3 mb-2">
                    <label htmlFor="muscleFilter" className="form-label d-block text-dark">
                        Grupo Muscular:
                    </label>
                    <select
                        id="muscleFilter"
                        className="form-select"
                        value={selectedMuscleGroup}
                        onChange={handleMuscleChange}
                    >
                        <option value="">Todos los grupos</option>
                        {availableMuscleGroups
                            .filter(muscle => {
                                // Filtra los músculos disponibles según la región seleccionada
                                if (selectedRegion) {
                                    const allMusclesInRegion = exercises
                                        .filter(ex => ex.region_cuerpo === selectedRegion)
                                        .map(ex => ex.grupo_muscular);
                                    return allMusclesInRegion.includes(muscle);
                                }
                                return true;
                            })
                            .map(muscle => (
                                <option key={muscle} value={muscle}>{muscle}</option>
                            ))}
                    </select>
                </div>

                <Button color="link" onClick={handleResetFilters} className="mt-4 text-decoration-underline text-dark">
                    Limpiar Filtros
                </Button>
            </div>
            {/* --- Fin de contenedor de filtros --- */}

            <Row xs="1" sm="2" md="3" lg="4" className="g-3">
                {exercises.length > 0 ? (
                    exercises.map((exercise, index) => (
                        <Col key={index}>
                            <Card className="h-100 bg-white shadow-sm border-0 cursor-pointer" onClick={() => onExerciseClick(exercise)}>
                                {exercise.imagen ? (
                                    <img
                                        src={exercise.imagen}
                                        alt={exercise.nombre}
                                        className="card-img-top"
                                        style={{ height: '150px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div className="text-center text-muted d-flex align-items-center justify-content-center" style={{ height: '150px', backgroundColor: '#e9ecef', fontSize: '0.85rem' }}>
                                        Sin Imagen
                                    </div>
                                )}
                                <CardBody className="d-flex flex-column">
                                    <CardTitle tag="h5" className="mb-2 fw-bold text-dark">
                                        {exercise.nombre}
                                    </CardTitle>
                                    <CardSubtitle tag="h6" className="mb-2 text-muted">
                                        {exercise.grupo_muscular}
                                    </CardSubtitle>
                                    <p className="card-text text-muted mb-3">
                                        Región: {exercise.region_cuerpo}
                                    </p>
                                    <Button
                                        color="primary"
                                        className="mt-auto w-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCustomRoutine(exercise);
                                        }}
                                    >
                                        Añadir
                                        <Plus className="ms-2" size={16} />
                                    </Button>
                                </CardBody>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <p className="w-100 text-center text-muted">No se encontraron ejercicios con los filtros seleccionados.</p>
                )}
            </Row>
        </div>
    );
};

export default ExerciseList;