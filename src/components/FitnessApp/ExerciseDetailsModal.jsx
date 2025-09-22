import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const ExerciseDetailsModal = ({ exercise, onClose }) => {
    if (!exercise) {
        return null;
    }
    
    // Función para obtener el ID de un video de YouTube
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(exercise.video);

    return (
        <Modal isOpen={true} toggle={onClose} centered>
            <ModalHeader toggle={onClose} className="text-dark">
                {exercise.nombre}
            </ModalHeader>
            <ModalBody className="text-dark">
                {/* Mostramos la imagen si existe */}
                {exercise.imagen && (
                    <div className="mb-3">
                        <img 
                            src={exercise.imagen} 
                            alt={exercise.nombre} 
                            className="img-fluid rounded" 
                        />
                    </div>
                )}
                <p><strong>Descripción:</strong> {exercise.descripcion}</p>
                <p><strong>Región del Cuerpo:</strong> {exercise.region_cuerpo}</p>
                <p><strong>Grupo Muscular Objetivo:</strong> {exercise.grupo_muscular}</p>
                <p><strong>Equipo Principal:</strong> {exercise.equipo_principal}</p>

                {/* Mostramos el video si existe y es válido */}
                {videoId && (
                    <div className="mt-4">
                        <h6><strong>Video Explicativo:</strong></h6>
                        <div className="ratio ratio-16x9">
                            <iframe 
                                src={`https://www.youtube.com/embed/${videoId}`} 
                                title="YouTube video player" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                style={{ border: 'none' }}
                            ></iframe>
                        </div>
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={onClose}>Cerrar</Button>
            </ModalFooter>
        </Modal>
    );
};

export default ExerciseDetailsModal;