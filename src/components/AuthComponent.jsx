// import React from 'react';
// import useAuth from '../hooks/useAuth';

// const AuthComponent = () => {
//     const { user, loading, signInWithGoogle, logOut } = useAuth();

//     if (loading) {
//         return <div className="nav-link">Cargando...</div>;
//     }

//     return (
//         <>
//             {user ? (
//                 <div>
//                     {/* Al hacer clic en el nombre del usuario, se cerrará la sesión */}
//                     <div className="nav-link cursor-pointer" onClick={logOut}>
//                         Cerrar sesión
//                     </div>
//                 </div>
//             ) : (
//                 <div className="nav-link cursor-pointer" onClick={signInWithGoogle}>
//                     Iniciar sesión
//                 </div>
//             )}
//         </>
//     );
// };

// export default AuthComponent;

import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { FaChevronDown } from 'react-icons/fa';

const AuthComponent = () => {
    const { user, loading, signInWithGoogle, logOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleMenu = (event) => {
        event.stopPropagation();
        setIsMenuOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    // Lógica para obtener solo el primer nombre
    const getFirstName = () => {
        if (user && user.displayName) {
            return user.displayName.split(' ')[0];
        }
        return '';
    };

    if (loading) {
        return <div className="nav-link">Cargando...</div>;
    }

    return (
        <>
            {user ? (
                <div 
                    className="dropdown" 
                    onClick={toggleMenu} 
                    ref={dropdownRef}
                >
                    <div className="nav-link d-flex align-items-center cursor-pointer">
                        {getFirstName()} <FaChevronDown className="ms-1" size={12} />
                    </div>
                    <ul 
                        className={`dropdown-menu dropdown-menu-end ${isMenuOpen ? 'show' : ''}`}
                    >
                        <li>
                            <div className="dropdown-item cursor-pointer" onClick={logOut}>
                                Cerrar sesión
                            </div>
                        </li>
                    </ul>
                </div>
            ) : (
                <div className="nav-link cursor-pointer" onClick={signInWithGoogle}>
                    Iniciar sesión
                </div>
            )}
        </>
    );
};

export default AuthComponent;