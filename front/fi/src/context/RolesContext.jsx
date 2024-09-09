import React, { createContext, useState, useContext, useEffect } from "react";

const RoleContext = createContext()

export const RoleProvider = ({ children }) => {
    const [ role, setRole ] = useState(() => {
        return localStorage.getItem('role') || '' //Mantener sesión activa
    });

    useEffect(() => {
        if(role) {
            localStorage.setItem('role', role)
        }else{
            localStorage.removeItem('role')
        }
    }, [role])

    return (
        <RoleContext.Provider value={{ role, setRole }}>
            {children}
        </RoleContext.Provider>
    )
};

export const useRole = () => {
    return useContext(RoleContext)
};