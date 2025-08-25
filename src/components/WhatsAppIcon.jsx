import React from 'react';
import { FaWhatsapp } from 'react-icons/fa'; 

const WhatsAppIcon = () => {
    
    const handleWhatsAppClick = () => {

        const phoneNumber = '541167936064';
        const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}`;
        window.open(whatsappURL, '_blank');
    };

    return (
        <div className="whatsapp-icon" onClick={handleWhatsAppClick}>
            <FaWhatsapp size={30} color="#fff" />
        </div>
    );
};

export default WhatsAppIcon;
