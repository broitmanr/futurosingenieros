import { Router } from 'express';
import cursoController from '../controllers/curso.controller.js';
import validate from '../middlewares/validate.js'
import cursoScheme from '../middlewares/schemes/curso.scheme.js'
const router = Router();


router.post('/', validate(cursoScheme.crearCurso), cursoController.crear);

export default router;