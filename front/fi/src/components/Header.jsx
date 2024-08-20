import React from 'react';

const Header = () => {
    return ( 
        <React.Fragment>
            <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#1A2035' }} data-bs-theme="dark" >
                <div class="container-fluid d-flex justify-content-between align-items-center">
                    {/*Cambié href*/}
                    <a className="navbar-brand" href="/">
                        {/*Ajusta tamaño de imagen según altura */}
                        <img src="logoFrlp.png" alt="Logo" style={{ height: '8vh' }} />
                    </a>
                    <div className="navbar-brand position-absolute" 
                        style={{ 
                            fontWeight: 'bold', 
                            fontSize: '1.8vw', //Ajusta tamaño de letra según ancho
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