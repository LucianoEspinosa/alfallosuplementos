import React from 'react';
import { Link } from "react-router-dom";
import { PiInstagramLogo } from 'react-icons/pi';
import logo from "./img/alfallonegro.png";
import { WHATSAPP_NUMBER } from '../config';

const INSTAGRAM = "https://www.instagram.com/alfallo.suplementos/";

const Footer = () => {
    const anio = new Date().getFullYear();
    const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}`;

    return (
        <footer className="af-footer">
            <div className="af-footer-inner">
                <div className="af-footer-brand">
                    <img src={logo} alt="Al Fallo Suplementos" className="af-footer-logo" />
                    <span className="af-footer-tagline">Suplementos deportivos originales con envío a todo el país.</span>
                </div>

                {/* Mobile: medios de pago, contacto y links en una columna (spec AFMobileHome) */}
                <div className="af-footer-col af-footer-pay">
                    <span className="af-overline af-overline--dim">Medios de pago</span>
                    <div className="af-footer-tags">
                        <span className="af-tag af-tag-neutral">Efectivo</span>
                        <span className="af-tag af-tag-neutral">Transferencia</span>
                    </div>
                </div>

                <div className="af-footer-col af-footer-shop">
                    <span className="af-overline af-overline--dim">Tienda</span>
                    <Link to="/#productos">Categorías</Link>
                    <Link to="/#productos">Marcas</Link>
                    <a href="/privacidad.html">Privacidad</a>
                </div>

                <div className="af-footer-col af-footer-contact">
                    <span className="af-overline af-overline--dim">Contacto</span>
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="af-footer-ig">
                        <PiInstagramLogo size={16} />@alfallo.suplementos
                    </a>
                </div>

                <div className="af-footer-mobilelinks">
                    <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="af-footer-ig">
                        <PiInstagramLogo size={18} />@alfallo.suplementos
                    </a>
                    <span>
                        <Link to="/#productos">Categorías</Link> · <Link to="/#productos">Marcas</Link> · <a href="/privacidad.html">Privacidad</a>
                    </span>
                </div>

                <span className="af-footer-copy">© {anio} Al Fallo Suplementos</span>
            </div>
        </footer>
    );
};

export default Footer;
