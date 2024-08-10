import { Router } from 'express';
import usuariosRoutes from './usuario.routes.js';
import authRoutes from './auth.routes.js';

export const rutas_init = () => {
    const router = Router();

    router.use("/usuarios", usuariosRoutes);
    return router;
}

export const rutas_auth = () => {
    const router = Router()
    router.use("/auth",authRoutes)
    return router

}