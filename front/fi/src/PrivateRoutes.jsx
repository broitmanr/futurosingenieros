import React from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "./context/RolesContext";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { role } = useRole();

    return allowedRoles.includes(role) ? children : <Navigate to='/login' /> //Verifica que el rol esté permitido
}

export default PrivateRoute;