import curso from '../models/curso.js'
import errors from '../const/error.js'
import sequelize from "../config/database.js";
import PersonaXCurso from "../models/personaXcurso.js";

// Función para crear un curso
async function crear(req, res,next) {


    // Obtener los datos del cuerpo de la solicitud
    const { cicloLectivo, materia_id, comision_id} = req.body;
    const transaction = await sequelize.transaction();
    // Si el usuario no tiene persona asociada entonces no puede crear el curso
    if (res.locals.usuario.persona_id == null)
        return next(errors.UsuarioNoPersona)
    try {

        const nuevoCurso = await curso.create({
            cicloLectivo,
            materia_id,
            comision_id,
            updated_by: res.locals.usuario.ID
        }, {transaction});

        await PersonaXCurso.create({
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

export default {
    crear
};
