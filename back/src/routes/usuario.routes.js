import { Router } from 'express';
import usuarioController from '../controllers/usuario.controller.js';

const router = Router();

router.get('/', usuarioController.prueba);

export default router;