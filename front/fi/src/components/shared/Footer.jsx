import React from 'react';
import { FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    return ( 
        <footer className="footer-container" data-bs-theme="dark" >
            <div className="container-footer-content d-flex flex-column align-items-center">
                <div className="d-flex align-items-center mb-2">
                    <FaMapMarkerAlt className='icon-footer' />
                    <span className='text-footer'>Av. 60 esq. 124 s/n, Berisso, Bueno Aires, Argentina</span>
                </div>
                <div>
                    <span className='text-footer'>2024 - Diseñado por alumnos de la UTN - Facultad Regional La Plata</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer