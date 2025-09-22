import React, { useEffect, useState } from 'react';
import logo from './img/alfallonegro.png';

const LoadingScreen = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simular progreso de carga
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + (Math.random() * 15 + 5); // Incremento variable
            });
        }, 200);

        // Ocultar después de completar
        if (progress >= 100) {
            setTimeout(() => setIsVisible(false), 500);
        }

        return () => clearInterval(interval);
    }, [progress]);

    if (!isVisible) return null;

    return (
        <div className="loading-screen" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            transition: 'opacity 0.5s ease-out'
        }}>
            {/* Logo con efecto de pulso */}
            <div className="logo-container" style={{
                animation: 'pulse 2s infinite, float 3s ease-in-out infinite'
            }}>
                <img 
                    src={logo} 
                    alt="AlFallo Suplementos" 
                    style={{ 
                        width: '150px', 
                        height: '150px',
                        objectFit: 'contain',
                        filter: 'brightness(0) invert(1)' // Blanco si es negro
                    }} 
                />
            </div>

            

            {/* Efecto de partículas opcional */}
            <div className="particles" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: -1
            }}>
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        position: 'absolute',
                        width: '2px',
                        height: '2px',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '50%',
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `twinkle ${1 + Math.random() * 2}s infinite`
                    }} />
                ))}
            </div>
        </div>
    );
};

export default LoadingScreen;