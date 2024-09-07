import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/shared/Header.jsx';
import Subheader from './components/shared/Subheader.jsx';
import Footer from './components/shared/Footer.jsx';
import Home from './components/Home.jsx';
import Cursos from './components/Cursos.jsx';
import SignInSide from "./components/SignInSide.tsx";
import AlumnosCurso from './components/AlumnosCurso.jsx';
import { CursosActividades } from './components/CursosActividades/CursosActividades.jsx';
import { ActividadEntregas } from './components/ActividadEntregas/ActividadEntregas.jsx';
import { DetalleEntrega } from './components/DetalleEntrega/DetalleEntrega.jsx';


function App() {

  
  
  return (
    <div className="App">
        <BrowserRouter>
            <Header />
            <Subheader />
            <Routes>
              <Route path="/" element={<Home />}/>
              <Route path="/cursos" element={<Cursos />}/>
              <Route path="/login" element={<SignInSide />}/>
              <Route path="/alumnos/:id" element={<AlumnosCurso />}/>
                {
                // CONSIDERAR QUE NECESITAMOS PASAR EL ID DEL CURSO PARA VISUALIZAR Y ACTUAR SOBRE LAS ACTIVIDADES DE ESTE.
                }
              <Route path="/cursos/:id/actividades" element={<CursosActividades />}/>
              <Route path="/actividad/:id/entregas" element={<ActividadEntregas/>}/>
              <Route path="/entrega/:id" element={<DetalleEntrega/>}/>

            </Routes>
            <Footer />
        </BrowserRouter>
    </div>
  );
}

export default App
