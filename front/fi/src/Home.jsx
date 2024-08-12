import React from "react";

function Home(){
    return(
        <div className="container d-flex flex-column justify-content-center align-items-center" 
            style={{
                height: '100vh' //Proporción altura del dispositivo
            }}>
            <h5 style={{ 
                color: '#1A2035', 
                fontWeight: 'bold', 
                fontSize: '1.8rem' 
                }}>¡Bienvenidos a Futuros Ingenieros!</h5>
            <button className="btn" 
                style={{ 
                    backgroundColor: '#1A2035', 
                    color: '#fff', 
                    marginTop: '2rem',
                    width: '10rem',
                    fontSize: '1.4rem' 
                }}>
                Empezar
            </button>
        </div>
    )
}

export default Home