import { Router } from 'express';
import usuariosRoutes from './usuario.routes.js';

export const rutas_init = () => {
    const router = Router();

    router.use("/usuarios", usuariosRoutes);
    return router;
};