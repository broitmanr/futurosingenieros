import React from 'react';

const Subheader = () => {
    return ( 
        <React.Fragment>
            <div className="subheader-container" data-bs-theme="dark">
                <div className="subheader-container-fluid d-flex justify-content-between align-items-center">
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