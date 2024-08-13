import React from "react";
import { Link } from 'react-router-dom';

function Home(){
    return(
        <div className="home-container d-flex flex-column align-items-center" 
            style={{
                //display: 'flex',
                //flexDirection: 'column',
                minHeight: '100vh', 
                justifyContent: 'center'
            }}>
            <h5 style={{ 
                color: '#1A2035', 
                fontWeight: 'bold', 
                fontSize: '1.8rem'
                }}>¡Bienvenidos a Futuros Ingenieros!</h5>    
            <Link to="/catedras" style={{ textDecoration: 'none' }}>
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
            </Link>  
        </div>
    )
}

export default Home