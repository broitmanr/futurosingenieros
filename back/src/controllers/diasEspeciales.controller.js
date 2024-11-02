const models = require('../database/models/index')
const errors = require('../const/error')
const pico = require('picocolors')
const {Op} = require("sequelize");

// Función para crear un día especial
async function crearDiaEspecial(req, res, next) {
    const { fecha, descripcion, nombre, cuentaAsistencia } = req.body
    console.log(pico.blue('Crear Día Especial - Datos recibidos:'), req.body)
    try {
        // Validamos que fecha no sea null y que sea una fecha válida (no sea menor a la fecha actual)
        if (!fecha || isNaN(Date.parse(fecha)) || Date.parse(fecha) < Date.now()) {
            console.warn(pico.yellow(`Advertencia: Fecha inválida ${fecha}.`))
            return next({ ...errors.ValidationError, details: `Fecha inválida: ${fecha}` })
        }
        // Validamos que no exista un día especial con la misma fecha, descripción, nombre y cuentaAsistencia
        const diaEspecialExistente = await models.DiasEspeciales.findOne({
            where: {
                fecha,
                descripcion,
                nombre,
                cuentaAsistencia
            }
        })
        if (diaEspecialExistente) {
            console.warn(pico.yellow(`Advertencia: Día especial ya existente con los datos ${JSON.stringify(req.body)}.`))
            return res.status(400).json({
                message: `Ya existe un día especial con la misma fecha (${fecha}), descripción (${descripcion}), y nombre (${nombre}).`
            })
        }
        const nuevoDiaEspecial = await models.DiasEspeciales.create({
            fecha,
            descripcion,
            nombre,
            cuentaAsistencia,
            updated_by: res.locals.usuario.ID
        })
        console.log(pico.green('Día Especial creado exitosamente:'), nuevoDiaEspecial)
        res.status(201).json(nuevoDiaEspecial)
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error(pico.red('Error de restricción de unicidad:', error))
            return next({
                ...errors.ValidationError,
                details: `Ya existe un día especial con los mismos datos: ${JSON.stringify(req.body)}`
            })
        }
        console.error(pico.red('Error al crear el día especial:', error))
        next({
            ...errors.InternalServerError,
            details: 'Error al crear el día especial: ' + error.message
        })
    }
}

// Función para listar todos los días especiales
async function listarDiasEspeciales(req, res, next) {
    console.log(pico.blue('Listar Días Especiales - Solicitud recibida'))
    try {
        const diasEspeciales = await models.DiasEspeciales.findAll()
        console.log(pico.green('Días Especiales listados exitosamente:'), diasEspeciales)
        res.status(200).json(diasEspeciales)
    } catch (error) {
        console.error(pico.red('Error al listar los días especiales:', error))
        next({
            ...errors.InternalServerError,
            details: 'Error al listar los días especiales: ' + error.message
        })
    }
}

async function listarDiasEspecialesByMonth(req, res, next) {
    try {
        const { month } = req.params;

        // Validar que month y year sean números válidos
        const monthNum = parseInt(month);
        const yearNum = new Date().getFullYear();

        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                error: 'El mes debe ser un número entre 1 y 12'
            });
        }

        if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
            return res.status(400).json({
                error: 'Año inválido'
            });
        }

        // Construir el rango de fechas para el mes y año dados
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

        // Consultar a la base de datos
        const diasEspeciales = await models.DiasEspeciales.findAll({
            where: {
                fecha: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // Mapear los días especiales para devolver el formato deseado
        const result = diasEspeciales.map(dia => ({
            day: new Date(dia.fecha).getDate(), // Obtener el número del día del mes
            description: dia.nombre, // Campo `nombre`
            color: generarColorPastel(), // Generar color pastel para cada fecha
            fullDescription: dia.descripcion
        }));

        res.status(200).json(result);
    } catch (error) {
        next({
            status: 500,
            message: 'Error al listar los días especiales: ' + error.message
        });
    }
}

// Función para obtener un día especial por ID
async function obtenerDiaEspecial(req, res, next) {
    const { id } = req.params
    console.log(pico.blue(`Obtener Día Especial - ID recibido: ${id}`))
    try {
        const diaEspecial = await models.DiasEspeciales.findByPk(id)
        if (!diaEspecial) {
            console.warn(pico.yellow(`Advertencia: Día especial con ID ${id} no encontrado.`))
            return next({ ...errors.NotFoundError, details: `Día especial con ID ${id} no encontrado` })
        }
        console.log(pico.green('Día Especial obtenido exitosamente:'), diaEspecial)
        res.status(200).json(diaEspecial)
    } catch (error) {
        console.error(pico.red('Error al obtener el día especial:', error))
        next({
            ...errors.InternalServerError,
            details: 'Error al obtener el día especial: ' + error.message
        })
    }
}

// Función para actualizar un día especial
async function actualizarDiaEspecial(req, res, next) {
    const { id } = req.params
    const { fecha, descripcion, nombre, cuentaAsistencia } = req.body
    console.log(pico.blue(`Actualizar Día Especial - ID recibido: ${id}`))
    console.log(pico.blue('Actualizar Día Especial - Datos recibidos:'), req.body)
    try {
        const diaEspecial = await models.DiasEspeciales.findByPk(id)
        if (!diaEspecial) {
            console.warn(pico.yellow(`Advertencia: Día especial con ID ${id} no encontrado.`))
            return next({ ...errors.NotFoundError, details: `Día especial con ID ${id} no encontrado` })
        }
        diaEspecial.fecha = fecha
        diaEspecial.descripcion = descripcion
        diaEspecial.nombre = nombre
        diaEspecial.cuentaAsistencia = cuentaAsistencia
        diaEspecial.updated_by = res.locals.usuario.ID
        await diaEspecial.save()
        console.log(pico.green('Día Especial actualizado exitosamente:'), diaEspecial)
        res.status(200).json(diaEspecial)
    } catch (error) {
        console.error(pico.red('Error al actualizar el día especial:', error))
        next({
            ...errors.InternalServerError,
            details: 'Error al actualizar el día especial: ' + error.message
        })
    }
}

// Función para eliminar un día especial
async function eliminarDiaEspecial(req, res, next) {
    const { id } = req.params
    console.log(pico.blue(`Eliminar Día Especial - ID recibido: ${id}`))
    try {
        const diaEspecial = await models.DiasEspeciales.findByPk(id)
        if (!diaEspecial) {
            console.warn(pico.yellow(`Advertencia: Día especial con ID ${id} no encontrado.`))
            return next({ ...errors.NotFoundError, details: `Día especial con ID ${id} no encontrado` })
        }
        await diaEspecial.destroy()
        console.log(pico.green(`Día Especial con ID ${JSON.stringify(diaEspecial)} eliminado exitosamente.`))
        res.status(204).send()
    } catch (error) {
        console.error(pico.red('Error al eliminar el día especial:', error))
        next({
            ...errors.InternalServerError,
            details: 'Error al eliminar el día especial: ' + error.message
        })
    }
}
// Función para generar un color pastel con baja opacidad
    function generarColorPastel() {
        const r = Math.floor((Math.random() * 127) + 30); // Genera un valor entre 127-254 para tonos claros
        const g = Math.floor((Math.random() * 127) + 40);
        const b = Math.floor((Math.random() * 127) + 60);
        const opacity = 0.7; // Baja opacidad
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

module.exports = {
    crearDiaEspecial,
    listarDiasEspeciales,
    obtenerDiaEspecial,
    actualizarDiaEspecial,
    eliminarDiaEspecial,
    listarDiasEspecialesByMonth
}
