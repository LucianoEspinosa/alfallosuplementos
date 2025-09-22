import { useState, useEffect } from 'react';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut 
} from 'firebase/auth';
import { auth } from '../index.js'; // La importación correcta

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        // Limpiar el listener cuando el componente se desmonte
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return {
        user,
        loading,
        signInWithGoogle,
        logOut
    };
};

export default useAuth;