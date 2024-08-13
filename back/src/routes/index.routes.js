import { Router } from 'express';
import usuariosRoutes from './usuario.routes.js';
import authRoutes from './auth.routes.js';
import decodeJWT from '../middlewares/decodeJWT.js'
import cursoRoutes from "./curso.routes.js";
import comisionRoutes from "./comision.routes.js";
import materiaRoutes from "./materia.routes.js";


export const rutas_init = () => {
    const router = Router();

    router.use("/usuarios",decodeJWT, usuariosRoutes)
    router.use("/curso",decodeJWT,cursoRoutes)
    router.use("/comision",decodeJWT,comisionRoutes)
    router.use("/materia",decodeJWT,materiaRoutes)
    return router;
}

export const rutas_auth = () => {
    const router = Router()
    router.use("/auth",authRoutes)
    return router

}