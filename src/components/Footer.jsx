/*import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons';

import { Link } from "react-router-dom";
const Footer = () => {
    return (
        <footer className="footer  border-top border-bottom" style={{ backgroundColor: 'rgb(250, 247, 242)' }}>
            <div className="container">
                <div className="row">
                    <div className="d-none d-md-flex flex-md-column col-md-4">
                        <h5>Información de contacto</h5>
                        <p>Dirección: Florida 343, C.A.B.A.</p>
                        <p>Teléfono: 123456789</p>
                        <p>Email: fragances.net@gmail.com</p>
                    </div>
                    <div className="d-none d-md-flex flex-md-column col-md-4">
                        <h5>Enlaces</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/" className='text-decoration-none text-secondary'>Inicio</Link></li>
                            <li><Link to="/" className='text-decoration-none text-secondary'>Productos</Link></li>
                            <li><Link to="/acerca-de" className='text-decoration-none text-secondary'>Acerca de</Link></li>
                            </ul>
                    </div>
                    <div className="col-md-4">
                        <h5 className='text-center'>Síguenos en redes sociales</h5>
                        <ul className="list-unstyled d-flex  gap-2 fs-3  justify-content-center">
                            <li><Link to="#" className='text-decoration-none text-secondary'><FontAwesomeIcon icon={faFacebook} /></Link></li>
                            <li><Link to="#" className='text-decoration-none text-secondary'><FontAwesomeIcon icon={faTwitter} /></Link></li>
                            <li><Link to="#" className='text-decoration-none text-secondary'><FontAwesomeIcon icon={faInstagram} /></Link></li>
                            <li><Link to="#" className='text-decoration-none text-secondary'><FontAwesomeIcon icon={faLinkedin} /></Link></li>
                            <li><Link to="#" className='text-decoration-none text-secondary'><FontAwesomeIcon icon={faYoutube} /></Link></li>
                        </ul>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 text-center">
                        <p className="mt-md-3">Todos los derechos reservados &copy; 2023</p>
                    </div>
                </div>
            </div>
        </footer>


    )
}
export default Footer;*/
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="foot border-top border-secondary" style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: 'var(--border-color) !important' 
        }}>
            <div className="container py-4">
                <div className="row align-items-center">
                    {/* Logo y nombre */}
                    <div className="col-md-4 mb-3 mb-md-0">
                        <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                            <img 
                                src={require("./img/alfallonegro.png")} 
                                alt="AlFallo Suplementos" 
                                style={{ 
                                    height: '40px', 
                                    marginRight: '12px',
                                    objectFit: 'contain'
                                }} 
                            />
                            <h5 className="mb-0 text-white">AlFallo Suplementos</h5>
                        </div>
                    </div>

                    {/* Acerca de */}
                    <div className="col-md-4 mb-3 mb-md-0">
                        <div className="text-center">
                            <Link 
                                to="/acerca-de" 
                                className="text-decoration-none text-muted"
                                style={{
                                    transition: 'color 0.3s ease',
                                    fontSize: '0.9rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                                onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                            >
                                Acerca de nosotros
                            </Link>
                        </div>
                    </div>

                    {/* Redes sociales - Solo Instagram y WhatsApp */}
                    <div className="col-md-4">
                        <div className="text-center">
                            <h6 className="text-white mb-2">Síguenos</h6>
                            <div className="d-flex justify-content-center gap-3">
                                {/* Instagram */}
                                <a 
                                    href="https://www.instagram.com/alfallo.suplementos/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                    style={{ 
                                        color: 'var(--text-secondary)',
                                        transition: 'all 0.3s ease',
                                        fontSize: '1.5rem'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.color = '#E1306C';
                                        e.target.style.transform = 'scale(1.2)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.color = 'var(--text-secondary)';
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faInstagram} />
                                </a>

                                {/* WhatsApp */}
                                <a 
                                    href="https://wa.me/5491167936064" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                    style={{ 
                                        color: 'var(--text-secondary)',
                                        transition: 'all 0.3s ease',
                                        fontSize: '1.5rem'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.color = '#25D366';
                                        e.target.style.transform = 'scale(1.2)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.color = 'var(--text-secondary)';
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faWhatsapp} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Línea separadora */}
                <div className="row mt-3">
                    <div className="col-12">
                        <hr style={{ 
                            borderColor: 'var(--border-color)',
                            margin: '1rem 0'
                        }} />
                    </div>
                </div>

                {/* Copyright */}
                <div className="row">
                    <div className="col-12 text-center">
                        <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                            © {new Date().getFullYear()} AlFallo Suplementos. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;