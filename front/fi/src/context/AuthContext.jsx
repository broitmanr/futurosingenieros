import React, { createContext, useState, useContext, useEffect} from "react";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') === 'true' //Mantener sesión activa
    });

    // MODIFICACIONES PARA GUARDAR LA DATA DEL USER.
    const [userData,setUserData] = useState(() => {
        return localStorage.getItem('userData') || null // Obtener data del usuario logeado
    });

    useEffect(() => {
        if(isLoggedIn) {
            localStorage.setItem('isLoggedIn', isLoggedIn)
            localStorage.setItem('userData', userData)
        }else{
            localStorage.removeItem('isLoggedIn')
        }
    }, [isLoggedIn])

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userData, setUserData }}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    return useContext(AuthContext)
};