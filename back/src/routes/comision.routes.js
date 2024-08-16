const express = require('express');

const comisionController =require('../controllers/comision.controller')

const router = express.Router();


router.get('/', comisionController.listar);

module.exports = router;