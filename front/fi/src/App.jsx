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
import ArchivoPrueba from './components/PruebaPDFViewer/PruebaPDFViewer.tsx';
import Rendimiento from './components/Rendimiento/Rendimiento.jsx'
import PrivateRoute from './PrivateRoutes';
import axios from "axios";

axios.defaults.baseURL = 'http://localhost:5000/api'

function App() {

  
  return (
    <div className="App">
        <BrowserRouter>
            <Header />
            <Subheader />
            <Routes>
              <Route path="/" element={<Home />}/>
              <Route path="/login" element={<SignInSide />}/>
              <Route path="/archivo" element={<ArchivoPrueba />}/>
              <Route
                path="/cursos"
                element={
                  <PrivateRoute allowedRoles={['D', 'A']}>
                    <Cursos />
                  </PrivateRoute>
                }
              />
              <Route
                path="/alumnos/:id"
                element={
                  <PrivateRoute allowedRoles={['D']}>
                    <AlumnosCurso />
                  </PrivateRoute>
                }
              />
                {
                // CONSIDERAR QUE NECESITAMOS PASAR EL ID DEL CURSO PARA VISUALIZAR Y ACTUAR SOBRE LAS ACTIVIDADES DE ESTE.
                }
              <Route
                path="/cursos/:id/actividades"
                element={
                  <PrivateRoute allowedRoles={['D', 'A']}>
                    <CursosActividades />
                  </PrivateRoute>
                }
              />
              <Route 
                path="/actividad/:id/entregas" 
                element={
                  <PrivateRoute allowedRoles={['D', 'A']}>
                    <ActividadEntregas />
                  </PrivateRoute>
                }
              />
              <Route 
                path="/entrega/:id" 
                element={
                  <PrivateRoute allowedRoles={['D', 'A']}>
                    <DetalleEntrega />
                  </PrivateRoute>
                }
              />
              <Route 
                path="/rendimiento" 
                element={
                  <PrivateRoute allowedRoles={['D', 'A']}>
                    <Rendimiento />
                  </PrivateRoute>
                }
              />
            </Routes>
            <Footer />
        </BrowserRouter>
    </div>
  );
}

export default App
