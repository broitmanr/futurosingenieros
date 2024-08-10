import { Router } from 'express';
import usuarioController from '../controllers/usuario.controller.js';
import validate from '../middlewares/validate.js'
import usuarioScheme from '../middlewares/schemes/usuario.scheme.js'
const router = Router();

router.get('/', usuarioController.prueba);
router.post('/', validate(usuarioScheme.crearUsuario), usuarioController.crear);

export default router;