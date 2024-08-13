import { Router } from 'express';
import materiaController from '../controllers/materia.controller.js';
import validate from '../middlewares/validate.js'
const router = Router();


router.get('/:anio', materiaController.listarByAnio);

export default router;