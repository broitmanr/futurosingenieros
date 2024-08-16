import React from "react";
import data from './data';

const Catedras = () => {
    return ( 
        <div className="catedras-container d-flex justify-content-center" style={{ minHeight: '100vh' }}> 
            {data.map((item) => (
                <div key={item.id} className="card" 
                    style={{
                        left: 0,
                        marginTop: '2rem',
                        padding: '1rem',
                        margin: '2.5rem',
                        width: '24rem',
                        height: '20rem',
                        backgroundColor: '#e2ebf7',
                        flexDirection: 'column'
                    }}>
                    <div className="card-header" style={{ border: 'none', backgroundColor: 'transparent' }}>
                        <span className="Comision" 
                            style={{
                                color: '#1A2035',
                                backgroundColor: '#7fa7db',
                                padding: '1rem 3rem', 
                                textAlign: 'left',
                                borderRadius: '0.4rem',
                                fontWeight: 'bold',
                                fontSize: '1.12rem'
                            }}>{item.comision}</span>
                    </div>
                    <div className="card-contenido d-flex flex-column">
                        <h2 
                            style={{ 
                                fontSize: '1.8rem', 
                                margin: '6rem 0 8rem', 
                                textAlign: 'center',
                                color: '#1A2035'
                            }}>{item.catedra}</h2>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Catedras