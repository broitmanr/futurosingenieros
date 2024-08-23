import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Subheader from './components/Subheader';
import Footer from './components/Footer';
import Home from './Home';
import Cursos from './Cursos';
import SignInSide from "./components/SignInSide.tsx";
import { CursosActividades } from './components/CursosActividades/CursosActividades.jsx';


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

                {
                // CONSIDERAR QUE NECESITAMOS PASAR EL ID DEL CURSO PARA VISUALIZAR Y ACTUAR SOBRE LAS ACTIVIDADES DE ESTE.
                 }
                <Route path="/cursos/:id/actividades" element={<CursosActividades />}/>
            </Routes>
            <Footer />
        </BrowserRouter>
    </div>
  );
}

export default App
