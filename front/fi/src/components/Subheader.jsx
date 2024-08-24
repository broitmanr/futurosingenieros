import React from 'react';

const Subheader = () => {
    return ( 
        <React.Fragment>
            <div className="subheader" 
                style={{ 
                    backgroundColor: '#CCDCF1', 
                    color: '#1A2035', 
                    padding: '0.8vh',
                    borderBottom: '0.14rem solid #1A2035' 
                }} data-bs-theme="dark">
                <div className="container-fluid d-flex justify-content-between align-items-center" 
                    style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.4vw',
                        color: '#1A2035', 
                        paddingLeft: '8rem',
                        paddingRight: '8rem'
                    }}>
                    <div>
                        <a className="nav-link active" href="https://www.frlp.utn.edu.ar/" target="_blank">Facultad</a>
                    </div>
                    <div>
                        <a className="nav-link active" href="https://alumnos.frlp.utn.edu.ar/Login?ReturnUrl=%2f" target="_blank">AlumnosWeb</a> 
                    </div>
                    <div>
                        <a className="nav-link active" href="https://profeweb.frlp.utn.edu.ar/Login?ReturnUrl=%2f" target="_blank">ProfeWeb</a>
                    </div>
                    
                </div>
            </div>
        </React.Fragment>
    )
}

export default Subheader