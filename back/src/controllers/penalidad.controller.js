const models = require('../database/models/index')
const errors = require('../const/error')
const { red, yellow } = require('picocolors')

// Función para crear una penalidad
async function crear(req, res, next) {
    const { valor, descripcion, personaxcursoID, tipoPenalidadID } = req.body
    try {
        // Validamos que los id que se pasaron existan y sean válidos
        const personaxcurso = await models.PersonaXCurso.findByPk(personaxcursoID)
        if (!personaxcurso) {
            return next({ ...errors.NotFoundError, details: `PersonaXCurso con ID ${personaxcursoID} no encontrada` })
        }
        const tipoPenalidad = await models.TipoPenalidad.findByPk(tipoPenalidadID)
        if (!tipoPenalidad) {
            return next({ ...errors.NotFoundError, details: `TipoPenalidad con ID ${tipoPenalidadID} no encontrado` })
        }
        const nuevaPenalidad = await models.Penalidad.create({
            valor,
            descripcion,
            personaxcurso_id: personaxcursoID,
            tipoPenalidad_id: tipoPenalidadID,
            updated_by: res.locals.usuario.ID
        })
        res.status(201).json(nuevaPenalidad)
    } catch (error) {
        console.error(red('Error al crear la penalidad: - ', error))
        next({
            ...errors.InternalServerError,
            details: 'Error al crear la penalidad: ' + error.message
        })
    }
}

// Función para listar penalidades
async function listar(req, res, next) {
    try {
        const penalidades = await models.Penalidad.findAll({
        })

        res.status(200).json(penalidades)
    } catch (error) {
        console.error(red('Error al listar las penalidades:', error))
        next({
            ...errors.InternalServerError,
            details: 'Error al listar las penalidades: ' + error.message
        })
    }
}

// Función para obtener penalidad por ID
async function ver(req, res, next) {
    const { id } = req.params

    try {
        const penalidad = await models.Penalidad.findOne({
            where: { ID: id }
        })

        if (!penalidad) {
            console.warn(yellow(`Advertencia: Penalidad con ID ${id} no encontrada.`))
            return next({ ...errors.NotFoundError, details: `Penalidad con ID ${id} no encontrada` })
        }

        res.status(200).json(penalidad)
    } catch (error) {
        console.error(red('Error al obtener la penalidad:', error))
        next({
            ...errors.InternalServerError,
            details: 'Error al obtener la penalidad: ' + error.message
        })
    }
}

// Función para verificar entregas con penalidad aplicable (versión para background job)
async function verificarPenalidadesBackground() {
    try {
        const now = new Date()
        const entregasConPenalidad = await models.EntregaPactada.findAll({
            where: {
                [models.Sequelize.Op.or]: [
                    { fechavto1: { [models.Sequelize.Op.lt]: now } },
                    {
                        fechavto2: {
                            [models.Sequelize.Op.and]: [
                                { [models.Sequelize.Op.lt]: now },
                                { [models.Sequelize.Op.ne]: null }
                            ]
                        }
                    }
                ]
            },
            include: [
                {
                    model: models.InstanciaEvaluativa,
                    where: { penalidad_aplicable: true },
                    attributes: ['ID', 'nombre', 'curso_id', 'grupo']
                },
                {
                    model: models.Entrega,
                    required: false,
                    include: [
                        {
                            model: models.Grupo,
                            required: false,
                            attributes: ['ID']
                        },
                        {
                            model: models.Persona,
                            required: false,
                            attributes: ['ID']
                        }
                    ]
                }
            ]
        })

        for (const entregaPactada of entregasConPenalidad) {
            const esGrupal = entregaPactada.InstanciaEvaluativa.grupo
            const entregas = entregaPactada.Entrega

            for (const entrega of entregas) {
                if (esGrupal && entrega.Grupo && entrega.Grupo.ID) {
                    const miembrosGrupo = await models.PersonaXGrupo.findAll({
                        where: { grupo_id: entrega.Grupo.ID }
                    })

                    for (const miembro of miembrosGrupo) {
                        await aplicarPenalidad(miembro.persona_id, entregaPactada)
                    }
                } else if (!esGrupal && entrega.Persona && entrega.Persona.ID) {
                    await aplicarPenalidad(entrega.Persona.ID, entregaPactada)
                }
            }
        }

        console.log('Verificación de penalidades completada exitosamente.')
    } catch (error) {
        console.error(red('Error al verificar penalidades en background:', error))
    }
}

async function aplicarPenalidad(personaId, entregaPactada) {
    const personaXCurso = await models.PersonaXCurso.findOne({
        where: {
            persona_id: personaId,
            curso_id: entregaPactada.InstanciaEvaluativa.curso_id
        }
    })

    if (personaXCurso) {
        await models.Penalidad.create({
            valor: 1,
            descripcion: `Penalidad por entrega vencida: ${entregaPactada.nombre}`,
            personaxcurso_id: personaXCurso.ID,
            tipoPenalidad_id: 3,
            updated_by: 'Sistema Futuros Ingenieros'
        })
    }
}

async function verificarEstadoAlumno(personaXCursoID) {
    try {
        const penalidades = await models.Penalidad.findAll({
            where: { personaxcurso_id: personaXCursoID }
        })
        if (!penalidades || penalidades.length === 0) {
            console.log(yellow(`No hay penalidades para este alumno en este personaXCurso con id: ${personaXCursoID}`))

            return { estado: 'Cursando', totalPuntosPenalidad: 0 }
        }
        const totalPuntosPenalidad = penalidades.reduce((sum, penalidad) => sum + penalidad.valor, 0)

        let estado
        if (totalPuntosPenalidad >= 4) {
            estado = 'Recursada'
        } else if (totalPuntosPenalidad >= 2) {
            estado = 'Final obligatorio'
        } else {
            estado = 'Cursando'
        }

        return { estado, totalPuntosPenalidad }
    } catch (error) {
        console.error(red('Error al verificar estado del alumno:', error))
        throw error
    }
}
async function obtenerEstadoAlumno(req, res, next) {
    const { legajo } = req.params
    try {
        const persona = await models.Persona.findOne({
            where: { legajo }
        })

        if (!persona) {
            return next({ ...errors.NotFoundError, details: `Persona con legajo ${legajo} no encontrada` })
        }

        const personasXCurso = await models.PersonaXCurso.findAll({
            where: { persona_id: persona.ID },
            include: [{
                model: models.Curso, // Vamos a formar el nombre del curso con los datos de ciclo lectivo, materia y comisión
                attributes: ['ID', 'cicloLectivo'],
                include: [
                    {
                        model: models.Materia,
                        as: 'Materium',
                        attributes: ['nombre']
                    },
                    {
                        model: models.Comision,
                        as: 'Comision',
                        attributes: ['nombre']
                    }
                ]
            }]
        })
        if (!personasXCurso || personasXCurso.length === 0) {
            return next({ ...errors.NotFoundError, details: `Persona con legajo ${legajo} no tiene cursos asignados` })
        }
        const estadosPorCurso = await Promise.all(
            personasXCurso.map(async (personaXCurso) => {
                try {
                    const curso = personaXCurso.Curso
                    const materiaNombre = curso.Materium ? curso.Materium.nombre : 'Materia no encontrada'
                    const comisionNombre = curso.Comision ? curso.Comision.nombre : 'Comisión no encontrada'
                    const cursoNombre = `${curso.cicloLectivo} - ${materiaNombre} - ${comisionNombre}`
                    const resultado = await verificarEstadoAlumno(personaXCurso.ID)
                    return {
                        cursoID: curso.ID,
                        cursoNombre,
                        ...resultado
                    }
                } catch (error) {
                    const cursoNombre = `${personaXCurso.Curso.cicloLectivo} - ${personaXCurso.Curso.Materium ? personaXCurso.Curso.Materium.nombre : 'Materia no encontrada'} - ${personaXCurso.Curso.Comision ? personaXCurso.Curso.Comision.nombre : 'Comisión no encontrada'}`
                    console.error(red(`Error al obtener el estado del alumno para el curso ${cursoNombre}:`, error))
                    return {
                        cursoID: personaXCurso.Curso.ID,
                        cursoNombre,
                        estado: 'Error en durante la verificación',
                        totalPuntosPenalidad: 0,
                        error: error.message
                    }
                }
            })
        )

        const cursosEnEstadoTipo = {
            cursando: [],
            finalObligatorio: [],
            recursada: [],
            error: []
        }

        estadosPorCurso.forEach(curso => {
            switch (curso.estado) {
                case 'Cursando':
                    cursosEnEstadoTipo.cursando.push(curso)
                    break
                case 'Final obligatorio':
                    cursosEnEstadoTipo.finalObligatorio.push(curso)
                    break
                case 'Recursada':
                    cursosEnEstadoTipo.recursada.push(curso)
                    break
                case 'Error en durante la verificación':
                    cursosEnEstadoTipo.error.push(curso)
                    break
            }
        })

        const respuesta = {
            legajo: persona.legajo,
            nombre: persona.nombre,
            apellido: persona.apellido,
            cursosEnEstadoTipo,
            resumen: {
                totalCursos: estadosPorCurso.length,
                cursando: cursosEnEstadoTipo.cursando.length,
                finalObligatorio: cursosEnEstadoTipo.finalObligatorio.length,
                recursada: cursosEnEstadoTipo.recursada.length,
                conError: cursosEnEstadoTipo.error.length
            }
        }

        res.status(200).json(respuesta)
    } catch (error) {
        console.error(red('Error al obtener el estado del alumno:', error))
        next({
            ...errors.InternalServerError,
            details: 'Error al obtener el estado del alumno: ' + error
        })
    }
}

async function obtenerEstadosAlumnosCurso(req, res, next) {
    const { cursoID } = req.params

    try {
        const curso = await models.Curso.findByPk(cursoID)
        if (!curso) {
            return next({ ...errors.NotFoundError, details: `Curso con ID ${cursoID} no encontrado` })
        }

        const personasXCurso = await models.PersonaXCurso.findAll({
            where: { curso_id: cursoID, rol: 'A' },
            include: [
                {
                    model: models.Persona,
                    attributes: ['ID', 'legajo', 'nombre', 'apellido']
                }
            ]
        })

        if (personasXCurso.length === 0) {
            return res.status(200).json({ message: 'No hay alumnos inscritos en este curso', alumnos: [] })
        }

        const estadosAlumnos = await Promise.all(
            personasXCurso.map(async (pxc) => {
                try {
                    const resultado = await verificarEstadoAlumno(pxc.ID)
                    return {
                        personaXCursoID: pxc.ID,
                        legajo: pxc.Persona.legajo,
                        nombre: pxc.Persona.nombre,
                        apellido: pxc.Persona.apellido,
                        ...resultado
                    }
                } catch (error) {
                    console.error(red(`Error al obtener el estado del alumno ${pxc.Persona.legajo}:`, error))
                    return {
                        personaXCursoID: pxc.ID,
                        legajo: pxc.Persona.legajo,
                        nombre: pxc.Persona.nombre,
                        apellido: pxc.Persona.apellido,
                        estado: 'Error en durante la verificación',
                        totalPuntosPenalidad: 0,
                        error: error.message
                    }
                }
            })
        )

        const alumnosPorEstado = {
            cursando: [],
            finalObligatorio: [],
            recursada: [],
            error: []
        }

        estadosAlumnos.forEach(alumno => {
            switch (alumno.estado) {
                case 'Cursando':
                    alumnosPorEstado.cursando.push(alumno)
                    break
                case 'Final obligatorio':
                    alumnosPorEstado.finalObligatorio.push(alumno)
                    break
                case 'Recursada':
                    alumnosPorEstado.recursada.push(alumno)
                    break
                case 'Error en durante la verificación':
                    alumnosPorEstado.error.push(alumno)
                    break
            }
        })

        const respuesta = {
            cursoID: curso.ID,
            cursoNombre: curso.nombre,
            totalAlumnos: estadosAlumnos.length,
            alumnosPorEstado,
            resumen: {
                cursando: alumnosPorEstado.cursando.length,
                finalObligatorio: alumnosPorEstado.finalObligatorio.length,
                recursada: alumnosPorEstado.recursada.length,
                conError: alumnosPorEstado.error.length
            }
        }

        res.status(200).json(respuesta)
    } catch (error) {
        console.error(red('Error al obtener los estados de los alumnos del curso:', error))
        next({
            ...errors.InternalServerError,
            details: 'Error al obtener los estados de los alumnos del curso: ' + error.message
        })
    }
}

module.exports = {
    crear,
    listar,
    ver,
    verificarPenalidadesBackground,
    verificarEstadoAlumno,
    obtenerEstadoAlumno,
    obtenerEstadosAlumnosCurso
}
