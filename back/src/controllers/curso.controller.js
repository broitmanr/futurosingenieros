import curso from '../models/curso.js'
import errors from '../const/error.js'

// Función para crear un curso
async function crear(req, res,next) {


    // Obtener los datos del cuerpo de la solicitud
    const { cicloLectivo, materia_id, comision_id} = req.body;
    console.log(cicloLectivo, materia_id,comision_id)

    try {
        // Crear un nuevo curso
        const nuevoCurso = await curso.create({
            cicloLectivo,
            materia_id,
            comision_id,
            updated_by: res.locals.usuario.id
        });

        // Responder con el curso creado
        res.status(201).json(nuevoCurso);
    } catch (error) {
        console.log(error, cicloLectivo, materia_id,comision_id)
        return next(errors.FaltanCampos)

    }
}

export default {
    crear
};
