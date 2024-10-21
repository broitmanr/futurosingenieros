import React, { createContext, useState, useContext, useEffect} from "react";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') === 'true' //Mantener sesión activa
    });

    useEffect(() => {
        if(isLoggedIn) {
            localStorage.setItem('isLoggedIn', isLoggedIn)
        }else{
            localStorage.removeItem('isLoggedIn')
        }
    }, [isLoggedIn])

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    return useContext(AuthContext)
};