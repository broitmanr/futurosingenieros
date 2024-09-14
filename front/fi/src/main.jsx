import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
//import './components/styles/index.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { RoleProvider } from './context/RolesContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RoleProvider> {/* Para que los componentes accedan al contexto de roles*/}
      <App />
    </RoleProvider>
  </React.StrictMode>,
);
