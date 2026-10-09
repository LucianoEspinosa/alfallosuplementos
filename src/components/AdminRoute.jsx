import useAuth from '../hooks/useAuth';

// Cuentas de Google autorizadas para usar el panel de administración.
// Las reglas de Firestore (firestore.rules) deben tener la misma lista.
export const ADMIN_EMAILS = ['lucianoespinosa04@gmail.com'];

const estilo = {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '24px',
    textAlign: 'center',
};

const AdminRoute = ({ children }) => {
    const { user, loading, signInWithGoogle, logOut } = useAuth();

    if (loading) {
        return <div style={estilo}><p>Verificando acceso...</p></div>;
    }

    if (!user) {
        return (
            <div style={estilo}>
                <h2>Acceso restringido</h2>
                <p>Iniciá sesión con la cuenta de administrador para continuar.</p>
                <button className="btn btn-dark" onClick={signInWithGoogle}>Ingresar con Google</button>
            </div>
        );
    }

    const esAdmin = user.emailVerified && ADMIN_EMAILS.includes((user.email || '').toLowerCase());
    if (!esAdmin) {
        return (
            <div style={estilo}>
                <h2>Sin permiso</h2>
                <p>La cuenta {user.email} no tiene acceso a esta sección.</p>
                <button className="btn btn-outline-dark" onClick={logOut}>Cerrar sesión</button>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
