import React from "react";
import { Link } from 'react-router-dom';

function Home(){
    return(
        <div className="home-container d-flex flex-column align-items-center" 
            style={{
                minHeight: '100vh', 
                marginTop: '10rem'
                //justifyContent: 'center'
            }}>
            <h5 style={{ 
                color: '#1A2035', 
                fontWeight: 'bold', 
                fontSize: '2.4rem', 
                marginBottom: '12rem'
                }}>¡Bienvenidos a Futuros Ingenieros!</h5>  
            <form style={{ width: '40rem', textAlign: 'center' }}> 


                <Link to="/login" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary"
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
            </form> 
        </div>
    )
}

export default Home