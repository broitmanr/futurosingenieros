import { Router } from 'express';
import comisionController from '../controllers/comision.controller.js';
import validate from '../middlewares/validate.js'
const router = Router();


router.get('/', comisionController.listar);

export default router;