import React from "react";
import { Link } from 'react-router-dom';

function Home(){
    return(
        <div className="home-container d-flex flex-column align-items-center" 
            style={{
                minHeight: '100vh', 
                marginTop: '8rem'
                //justifyContent: 'center'
            }}>
            <h5 style={{ 
                color: '#1A2035', 
                fontWeight: 'bold', 
                fontSize: '2.4rem', 
                marginBottom: '4rem'
                }}>¡Bienvenidos a Futuros Ingenieros!</h5>  
            <form style={{ width: '40rem' }}> 

                {/*Correo electrónico*/}

                <div class="form-group" style={{ marginBottom: '3rem' }}>
                    <label for="validationDefault01" style={{ fontSize: '1.4rem' }}>Correo electrónico</label>
                    <input type="text" class="form-control" id="validationDefault01" placeholder="Inserte su correo electrónico" 
                        style={{
                            height: '3.6rem',
                            border: '0.2rem solid #1A2035', 
                            marginTop: '0.4rem',
                            fontSize: '1.2rem'
                        }} required />
                </div>

                {/*Contraseña*/}

                <div class="form-group" style={{ marginBottom: '3rem' }}>
                    <label for="validationDefault03" style={{ fontSize: '1.4rem' }}>Contraseña</label>
                    <input type="text" class="form-control" id="validationDefault03" placeholder="Ingrese su contraseña" 
                        style={{
                            height: '3.6rem',
                            border: '0.2rem solid #1A2035',
                            marginTop: '0.4rem',
                            fontSize: '1.2rem'
                        }} required />
                </div>
                <Link to="/cursos" style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary" /*type="submit"*/ 
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