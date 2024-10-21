import React, { createContext, useState, useContext, useEffect} from "react";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') === 'true' //Mantener sesión activa
    });

<<<<<<< HEAD
    // MODIFICACIONES PARA GUARDAR LA DATA DEL USER.
    const [userData,setUserData] = useState(() => {
        return localStorage.getItem('userData') || null // Obtener data del usuario logeado
    });

    useEffect(() => {
        if(isLoggedIn) {
            localStorage.setItem('isLoggedIn', isLoggedIn)
            localStorage.setItem('userData', userData)
=======
    useEffect(() => {
        if(isLoggedIn) {
            localStorage.setItem('isLoggedIn', isLoggedIn)
>>>>>>> 2bb503b060b0b50c42e41e774b86af45ba90c959
        }else{
            localStorage.removeItem('isLoggedIn')
        }
    }, [isLoggedIn])

    return (
<<<<<<< HEAD
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userData, setUserData }}>
=======
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
>>>>>>> 2bb503b060b0b50c42e41e774b86af45ba90c959
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    return useContext(AuthContext)
};