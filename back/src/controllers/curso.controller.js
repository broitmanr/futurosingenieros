const crypto = require('crypto');
const errors = require('../const/error');
const { red, green, yellow, blue } = require('picocolors');
const models = require('../database/models/index');

// Función para crear un curso
async function crear(req, res,next) {


    // Obtener los datos del cuerpo de la solicitud
    const { cicloLectivo, materia_id, comision_id} = req.body;
    const transaction = await models.sequelize.transaction();
    // Si el usuario no tiene persona asociada entonces no puede crear el curso
    if (res.locals.usuario.persona_id == null)
        return next(errors.UsuarioNoPersona)
    try {

        const nuevoCurso = await models.Curso.create({
            cicloLectivo,
            materia_id,
            comision_id,
            updated_by: res.locals.usuario.ID,
            codigoVinculacion: null
        }, {transaction});

        await models.PersonaXCurso.create({
            persona_id:res.locals.usuario.persona_id,
            curso_id: nuevoCurso.ID,
            rol:res.locals.usuario.rol,
            updated_by: res.locals.usuario.ID
        }, { transaction });

        await transaction.commit();
        // Responder con el curso creado
        res.status(201).json(nuevoCurso);
    } catch (error) {
        await transaction.rollback();
        console.error(red('Error al crear el curso:', error));
        return next(errors.FaltanCampos);
    }
}

async function ver(req, res,next) {
    const { id } = req.params;

    try {

        const cursoVer = await models.Curso.findOne({
            where:{
              id:id,
            },
            include: [
                {
                    model: models.Materia,
                    // attributes: ['ID', 'nombre'] // Ajusta los atributos según tus necesidades
                },
                {
                    model: models.Comision,
                    attributes: ['ID', 'nombre'] // Ajusta los atributos según tus necesidades
                },
                {
                    model: models.PersonaXCurso,
                    include: [
                        {
                            model: models.Persona,
                            attributes: ['ID', 'nombre', 'apellido'] // Ajusta los atributos según tus necesidades
                        }
                    ],
                    // attributes: ['persona_id']
                }
            ]
        });

        if (!cursoVer) {
            console.warn(yellow(`Advertencia: Curso con ID ${id} no encontrado.`));
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        res.status(200).json(cursoVer);
    } catch (error) {
        console.error(red('Error al obtener el curso:', error));
        res.status(500).json({ error: 'Error al obtener el curso' });
    }
}

async function listar(req, res,next) {
    try {


        // Agregar validar que sea los q el es docente
        const cursos = await models.Curso.findAll({
        include:[
            {
                model: models.Comision,
                attributes: ['nombre']
            },{
                model:models.Materia,
                attributes:['nombre']
            }],


        });

        const cursosComplete = cursos.map(curso => ({
            id:curso.ID,
            anio: curso.cicloLectivo,
            comision: curso.Comision.nombre,
            materia: curso.Materium.nombre
        }));



        res.status(200).json(cursosComplete);
    } catch (error) {
        console.error(red('Error al listar los cursos:', error));
        res.status(500).json({ error: 'Error al listar los cursos' });
    }
}


async function generarCodigoVinculacion(req, res, next) {
    const { cursoId } = req.body;
    const docenteId = res.locals.usuario.persona_id;
    console.log(green(`ID recuperado del usuario logueado: ${docenteId}`));
    console.log(green(`ID del curso recibido: ${cursoId}`));

    const transaction = await models.sequelize.transaction();

    try {
    
        const curso = await models.Curso.findByPk(cursoId, { transaction })

        if (!curso) {
            console.warn(yellow(`Advertencia: Curso con ID ${cursoId} no existe.`));
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        // Verificar si el docente está asociado al curso
        const esDocente = await models.PersonaXCurso.findOne({
            where: { persona_id: docenteId, curso_id: cursoId, rol: 'D' }
        });

        if (!esDocente) {
            console.warn(yellow(`Advertencia: Usuario con ID ${docenteId} no es docente del curso con ID ${cursoId}.`));
            return res.status(403).json({ error: 'No tienes permiso para generar un código para este curso' });
        }

        console.log(green(`El usuario logueado con ID ${docenteId} es docente del curso con ID ${cursoId}.`));

        // El código de vinculación es el ID del curso en hexadecimal
        const codigoVinculacion = crypto.randomBytes(4).toString('hex').toUpperCase()
        await curso.update({ codigoVinculacion }, { transaction })
        await transaction.commit()
        console.log(blue(`Código de vinculación generado correctamente: ${codigoVinculacion}`));
        res.json({
            codigoVinculacion,
            mensaje: 'Código de vinculación generado exitosamente'
        });

    } catch (error) {
        await transaction.rollback();
        console.error(red('Error al generar el código de vinculación:', error));
        res.status(500).json({ error: 'Error al generar el código de vinculación' });
    }
}

async function vincularEstudiante(req, res, next) {
    const transaction = await models.sequelize.transaction();
    try {
        const { codigoVinculacion } = req.body;
        const estudianteId = res.locals.usuario.persona_id;

        if (!estudianteId) {
            await transaction.rollback();
            return next(errors.UsuarioNoPersona);
        }

        console.log(green(`Buscando curso con código de vinculación: ${codigoVinculacion}`));
        const curso = await models.Curso.findOne({
            where: { codigoVinculacion },
            transaction
        });

        // Log the result of the query
        console.log(blue(`Resultado de la consulta de curso: ${JSON.stringify(curso)}`));

        if (!curso) {
            console.warn(yellow(`Advertencia: Código de vinculación ${codigoVinculacion} no encontrado en la base de datos.`));
            await transaction.rollback();
            return res.status(404).json({ error: 'Código de vinculación inválido' });
        }

        console.log(green(`Curso encontrado con ID ${curso.ID}.`));

        const vinculacionExistente = await models.PersonaXCurso.findOne({
            where: { persona_id: estudianteId, curso_id: curso.ID },
            transaction
        });

        if (vinculacionExistente) {
            console.warn(yellow(`Advertencia: El estudiante con ID ${estudianteId} ya está vinculado al curso con ID ${curso.ID}.`));
            await transaction.rollback();
            return res.status(400).json({ error: 'El estudiante ya está vinculado a este curso' });
        }

        await models.PersonaXCurso.create({
            persona_id: estudianteId,
            curso_id: curso.ID,
            rol: 'E',
            updated_by: res.locals.usuario.ID
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Estudiante vinculado al curso exitosamente' });

    } catch (error) {
        await transaction.rollback();
        console.error(red('Error al vincular estudiante al curso:', error));
        next(error);
    }
}


module.exports = {
    crear, ver, listar, generarCodigoVinculacion, vincularEstudiante
};
