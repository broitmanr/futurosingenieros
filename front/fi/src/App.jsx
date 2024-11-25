import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/shared/Header.jsx';
import Subheader from './components/shared/Subheader.jsx';
import Footer from './components/shared/Footer.jsx';
import Home from './components/Home.jsx';
import Cursos from './components/Cursos/Cursos.jsx';
import SignInSide from "./components/SignInSide.tsx";
import SignUp from "./components/SignUp.jsx"
import AlumnosCurso from './components/CursoInstanciasEval/AlumnosCurso.jsx';
import { CursoInstanciasEval } from './components/CursoInstanciasEval/CursoInstanciasEval.jsx';
import { InstanciaEvalEntregas } from './components/InstanciaEvalEntregas/InstanciaEvalEntregas.jsx';
import { DetalleEntrega } from './components/DetalleEntrega/DetalleEntrega.jsx';
import ArchivoEntrega from './components/PruebaPDFViewer/App.tsx';
import Rendimiento from './components/Rendimiento/Rendimiento.jsx';
import Recursos from './components/CursoInstanciasEval/Recursos.jsx';
import PrivateRoute from './PrivateRoutes';
import axios from "axios";
import RendimientoAlumno from "./components/Rendimiento/RendimientoAlumno.jsx";
import RendimientoGrupo from "./components/Rendimiento/RendimientoGrupo.jsx";
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Perfil } from './components/Perfil/Perfil.jsx';


axios.defaults.baseURL = 'https://api.futurosingenieros.site/api'

const AppContent = () => {
  const { isLoggedIn } = useAuth()
  return (
    //<div className="App">
      // <AuthProvider>
      //   <BrowserRouter>
    <>
      <Header />
      {!isLoggedIn && <Subheader />}
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<SignInSide />}/>
        <Route path="/register" element={<SignUp />}/>
        <Route
          path="/cursos"
          element={
            <PrivateRoute allowedRoles={['D', 'A']}>
              <Cursos />
            </PrivateRoute>
          }
        />
        <Route
          path="/mi-perfil"
          element={
            <PrivateRoute allowedRoles={['D', 'A']}>
              <Perfil />
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
        <Route
          path="/curso/:id"
          element={
            <PrivateRoute allowedRoles={['D', 'A']}>
              <CursoInstanciasEval />
            </PrivateRoute>
          }
        />
        <Route 
          path="/instancia-eval/:id/entregas" 
          element={
            <PrivateRoute allowedRoles={['D', 'A']}>
              <InstanciaEvalEntregas />
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
          path="/archivo/:id" 
          element={
            <PrivateRoute allowedRoles={['D', 'A']}>
              <ArchivoEntrega />
            </PrivateRoute>
          }
        />
        <Route 
          path="/rendimiento/:id" 
          element={
            <PrivateRoute allowedRoles={['D', 'A']}>
              <Rendimiento />
            </PrivateRoute>
          }
        />
        <Route
          path="/rendimiento/alumno/:id/:idAlumno"
          element={
            <PrivateRoute allowedRoles={['D']}>
              <RendimientoAlumno  />
            </PrivateRoute>
          }
        />
        <Route
          path="/rendimiento/grupo/:id/:idGrupo"
          element={
            <PrivateRoute allowedRoles={['D']}>
              <RendimientoGrupo  />
            </PrivateRoute>
          }
        />
        <Route 
          path="/recursos/:id" 
          element={
            <PrivateRoute allowedRoles={['D', 'A']}>
              <Recursos />
            </PrivateRoute>
          }
        />
      </Routes>
      <Footer />
    </>
      //   </BrowserRouter>
      // </AuthProvider>
    //</div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
