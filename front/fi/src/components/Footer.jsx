import React from 'react';
import { FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    return ( 
        <footer className="footer" style={{ 
            backgroundColor: '#1A2035', 
            color: '#fff', 
            textAlign: 'center', 
            padding: '2rem',
            marginTop: 'auto'
            }} data-bs-theme="dark" >
            <div className="container d-flex flex-column align-items-center">
                <div className="d-flex align-items-center mb-2">
                    <FaMapMarkerAlt style={{ marginRight: '1.2rem' }}/>
                    <span style={{ fontSize: '1.4rem'}}>Av. 60 esq. 124 s/n, Berisso, Bueno Aires, Argentina</span>
                </div>
                <div>
                    <span style={{ fontSize: '1.4rem'}}>2024 - Diseñado por alumnos de la UTN - Facultad Regional La Plata</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer