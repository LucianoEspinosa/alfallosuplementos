// utils/normalize.js
export const normalizarBusqueda = (texto) => {
    if (!texto || typeof texto !== 'string') return '';
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
};

// En tus componentes de búsqueda:
import { normalizarBusqueda } from '../utils/normalize';

const buscarFragancias = (termino) => {
    const terminoNormalizado = normalizarBusqueda(termino);
    return fragancias.filter(fragancia => 
        normalizarBusqueda(fragancia.categoria).includes(terminoNormalizado)
    );
};