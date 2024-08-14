const curso = require('../database/models/curso')
const errors = require('../const/error')
const models = require('../database/models/index')




// Función para crear un curso
async function crear(req, res,next) {


    // Obtener los datos del cuerpo de la solicitud
    const { cicloLectivo, materia_id, comision_id} = req.body;
    const transaction = await sequelize.transaction();
    // Si el usuario no tiene persona asociada entonces no puede crear el curso
    if (res.locals.usuario.persona_id == null)
        return next(errors.UsuarioNoPersona)
    try {

        const nuevoCurso = await models.Curso.create({
            cicloLectivo,
            materia_id,
            comision_id,
            updated_by: res.locals.usuario.ID
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
        return next(errors.FaltanCampos)

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
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        res.status(200).json(cursoVer);
    } catch (error) {
        console.error('Error al obtener el curso:', error);
        res.status(500).json({ error: 'Error al obtener el curso' });
    }
}

module.exports = {
    crear, ver
};
