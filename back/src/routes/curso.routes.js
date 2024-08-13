import { Router } from 'express';
import cursoController from '../controllers/curso.controller.js';
import validate from '../middlewares/validate.js'
import cursoScheme from '../middlewares/schemes/curso.scheme.js'
import checkRole from "../middlewares/checkRole.js";
const router = Router();


router.post('/', validate(cursoScheme.crearCurso),checkRole.checkRoleDocente,cursoController.crear);

export default router;