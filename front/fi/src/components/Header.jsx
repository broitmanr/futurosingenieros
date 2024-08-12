import React from 'react';

const Header = () => {
    return ( 
        <React.Fragment>
            <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#1A2035' }} data-bs-theme="dark" >
                <div class="container-fluid d-flex justify-content-between align-items-center">
                    <a className="navbar-brand" href="#">
                        <img src="logoFrlp.png" alt="Logo" style={{ height: '8rem' }} />
                    </a>
                    <div className="navbar-brand position-absolute" 
                        style={{ 
                            fontWeight: 'bold', 
                            fontSize: '1.8rem', 
                            left: '50%', //Posiciona al texto en el centro
                            transform: 'translateX(-50%)' //Centra el texto
                        }}>
                        FUTUROS INGENIEROS
                    </div>
                </div>
            </nav>
        </React.Fragment>
    )
}

export default Header