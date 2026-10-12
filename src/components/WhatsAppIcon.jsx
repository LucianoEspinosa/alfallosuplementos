import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_NUMBER } from '../config';

// Botón flotante de WhatsApp. Mobile: círculo de 58px. Desktop: círculo de 60px con la burbuja
// "¿Te asesoramos?". En mobile se oculta donde hay barra fija abajo (detalle, carrito y checkout).
const WhatsAppIcon = ({ ocultarEnMobile = false }) => {
    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`;

    return (
        <div className={`af-wa ${ocultarEnMobile ? 'af-wa--sinmobile' : ''}`}>
            <span className="af-wa-bubble">¿Te asesoramos?</span>
            <a className="af-wa-btn" href={url} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <FaWhatsapp size={30} />
            </a>
        </div>
    );
};

export default WhatsAppIcon;
