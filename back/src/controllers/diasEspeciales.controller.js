const models = require('../database/models/index')
const errors = require('../const/error')
const pico = require('picocolors')

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

module.exports = {
    crearDiaEspecial,
    listarDiasEspeciales,
    obtenerDiaEspecial,
    actualizarDiaEspecial,
    eliminarDiaEspecial
}
