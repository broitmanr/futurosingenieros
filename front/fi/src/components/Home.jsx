import React from "react";
import { Link } from 'react-router-dom';
import './styles/Home.css'

function Home(){
    return(
        <div className="home-container d-flex flex-column align-items-center">
            <h5 className='home-title'>¡Bienvenidos a Futuros Ingenieros!</h5>  
            <form className='home-form'> 
                <Link className='home-redirect' to="/login">
                    <button className="btn-empezar" data-testid="start-button"
                    >
                        Empezar
                    </button>
                </Link>  
            </form> 
        </div>
    )
}

export default Home