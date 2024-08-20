import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Subheader from './components/Subheader';
import Footer from './components/Footer';
import Home from './Home';
import Cursos from './Cursos';
import SignInSide from "./components/SignInSide.tsx";


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
            </Routes>
            <Footer />
        </BrowserRouter>
    </div>
  );
}

export default App
