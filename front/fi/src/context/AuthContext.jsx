import React, { createContext, useState, useContext, useEffect} from "react";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') === 'true' //Mantener sesión activa
    });

    // MODIFICACIONES PARA GUARDAR LA DATA DEL USER.
    const [userData, setUserData] = useState(() => { const savedUserData = localStorage.getItem('userData')
        try { 
            return savedUserData ? JSON.parse(savedUserData) : null; // Obtener data del usuario logeado 
        } catch (error) {
            console.log('Error al pasar user data', error)
            return null
        } 
    })

    useEffect(() => {
        if(isLoggedIn) {
            localStorage.setItem('isLoggedIn', isLoggedIn)
            localStorage.setItem('userData', JSON.stringify(userData))
        }else{
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('userData')
        }
    }, [isLoggedIn, userData])

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userData, setUserData }}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    return useContext(AuthContext)
};