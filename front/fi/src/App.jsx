import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Subheader from './components/Subheader';
import Footer from './components/Footer';
import Home from './Home';
import Catedras from './Catedras'


function App() {
  return (
    <div className="App">
        <BrowserRouter>
            <Header />
            <Subheader />
            <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/catedras" element={<Catedras />}/>
            </Routes>
            <Footer />
        </BrowserRouter>
    </div>
  );
}

export default App
