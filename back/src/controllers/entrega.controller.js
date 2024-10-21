const errors = require('../const/error')
const { handleTransaction } = require('../const/transactionHelper')
const models = require('../database/models/index')
const GoogleDriveService = require('../services/GoogleDriveService') // Importa el servicio de Google Drive
const fs = require('fs') // Para manejar el stream de archivos
const pico = require('picocolors')
const googleDriveService = new GoogleDriveService()

const crearEntrega = async (req, res, next) => {
  const files = req.files
  console.log(pico.blue(`Iniciando creación de entrega con ${files.length} archivos`))

  try {
    const { entregaPactadaId } = req.body
    console.log(pico.yellow(`EntregaPactadaId: ${entregaPactadaId}`))
    console.log(entregaPactadaId)
    const entregaPactada = await models.EntregaPactada.findByPk(entregaPactadaId, {
      include: [
        {
          model: models.InstanciaEvaluativa,
          attributes: ['grupo', 'curso_id']
        }
      ]
    })
    if (!entregaPactada) {
      console.warn(pico.red('Advertencia: EntregaPactada no encontrada.'))
      return next({ ...errors.NotFoundError, details: 'EntregaPactada no encontrada' })
    }
    console.log(pico.green(`EntregaPactada encontrada: ${JSON.stringify(entregaPactada, null, 2)}`))
    // Verificar si la entrega es grupal
    const entregaGrupal = entregaPactada.InstanciaEvaluativa.grupo
    let grupoId = null
    if (entregaGrupal) {
      const personaXgrupo = await models.PersonaXGrupo.findOne({
        where: {
          persona_id: res.locals.usuario.persona_id
        },
        include: [
          {
            model: models.Grupo,
            where: {
              curso_id: entregaPactada.InstanciaEvaluativa.curso_id
            }
          }
        ]
      })

      if (!personaXgrupo) {
        return next({ ...errors.NotFoundError, details: 'No se encontró grupo para la persona y la entrega es grupal' })
      }
      grupoId = personaXgrupo.grupo_ID
    }
    await handleTransaction(async (transaction) => {
      // Verificar si ya existe una entrega
      let entrega = await models.Entrega.findOne({
        where: {
          entregaPactada_ID: entregaPactadaId,
          [models.Sequelize.Op.or]: [
            { grupo_ID: grupoId },
            { persona_ID: res.locals.usuario.persona_id }
          ]
        },
        transaction // Asegúrate de pasar la transacción aquí
      })

      if (entrega) {
        console.log(pico.yellow(`Entrega ya existente encontrada con ID: ${entrega.ID}`))
      } else {
        console.log(pico.magenta('Creando nueva entrega en la base de datos'))
        entrega = await models.Entrega.create({
          fecha: Date.now(),
          nota: null,
          grupo_ID: grupoId ?? null,
          persona_id: res.locals.usuario.persona_id,
          entregaPactada_ID: entregaPactadaId,
          updated_by: res.locals.usuario.ID
        }, { transaction })

        //   Si la entrega se crea hay que crear las persona x entrega
        if (grupoId) {
          const grupo = await models.Grupo.findByPk(grupoId, {
            include: [{
              model: models.Persona,
              attributes: ['ID']
            }]
          })

          const porcentaje = parseFloat((100 / parseInt(grupo.Personas.length)).toFixed(2))
          for (const persona of grupo.Personas) {
            const personaXEntrega = await models.PersonaXEntrega.create({
              porcentaje_participacion: porcentaje,
              persona_id: persona.ID,
              entrega_id: entrega.ID
            }, { transaction })
          }
        } else {
          personaXEntrega = await models.PersonaXEntrega.create({
            porcentaje_participacion: 100,
            persona_id: res.locals.usuario.persona_id,
            entrega_id: entrega.ID
          }, { transaction })
        }
      }

      const archivos = await asociarArchivos(files, entrega.ID, req, res, transaction, next) // Pasar la transacción aquí
      if (archivos.length === 0) {
        return next({ ...errors.BadRequestError, details: 'No se encontraron archivos para asociar' })
      }
      entrega.fecha = new Date()
      entrega.save()
      console.log(pico.blue(`Entrega creada exitosamente con ${archivos.length} archivos`))
      res.status(201).json({
        entrega,
        archivos
      })
    }, next) // Mantén el manejo de transacciones en el bloque handleTransaction
  } catch (error) {
    console.error(pico.red(`Error al crear la entrega y subir los archivos: ${error.message}`))
    console.error(pico.red(error.stack))
    return next({
      ...errors.InternalServerError,
      details: 'Error al crear la entrega y subir los archivos: ' + error.message
    })
  } finally {
    for (const file of files) {
      if (file && file.path) {
        req.tempFiles.push(file.path)
      }
    }
  }
}

const asociarArchivos = async (files, entregaID, req, res, transaction, next) => {
  console.log(pico.blue(`Iniciando asociación de archivos con entrega ID: ${entregaID}`))
  const archivos = []
  const fileIds = []
  try {
    if (!files || !files.length) {
      console.warn(pico.yellow('Advertencia: No se encontraron archivos para subir'))
      return next({ ...errors.BadRequestError, details: 'No se encontraron archivos para asociar' })
    }

    // Buscar la entrega por el ID proporcionado
    const entrega = await models.Entrega.findByPk(entregaID, { transaction }) // Usar la transacción
    if (!entrega) {
      console.warn(pico.yellow(`Advertencia: El ID de la entrega con valor ${entregaID} no es válido`))
      return next({ ...errors.NotFoundError, details: `Advertencia: El ID de la entrega con valor ${entregaID} no es válido` })
    }

    // Procesar archivos si todo es válido
    console.log(pico.red('Obteniendo o creando carpetas en Google Drive'))
    const folderId = process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID
    console.log(pico.yellow(`Folder ID principal - recuperado en Controller: ${folderId}`))
    const entregasFolderId = await googleDriveService.getOrCreateFolder(folderId, 'Entregas')
    console.log(pico.green(`Folder ID de Entregas - recuperado en Controller: ${entregasFolderId}`))
    const entregaPactadaFolderId = await googleDriveService.getOrCreateFolder(entregasFolderId, entrega.entregaPactada_ID.toString())
    console.log(pico.green(`Folder ID de EntregaPactada - recuperado en Controller: ${entregaPactadaFolderId}`))
    for (const file of files) {
      try {
        console.log(pico.magenta(`Procesando archivo: ${file.originalname}`))
        const mimeType = file.mimetype
        const filePath = file.path

        // Crear el registro del archivo en la base de datos para obtener su ID
        const archivo = await models.Archivo.create({
          nombre: '', // Nombre temporal, se actualizará después
          referencia: '',
          extension: file.mimetype.split('/')[1],
          entrega_id: entrega.ID
        }, { transaction }) // Asegúrate de pasar la transacción aquí

        // Cambiar el nombre del archivo al ID del archivo.pdf
        const fileName = `${archivo.ID}.pdf`
        console.log(`Nombre del archivo: ${fileName}`)

        const fileStream = fs.createReadStream(filePath)

        console.log(pico.blue(`Subiendo archivo a Google Drive: ${fileName}`))
        const { file: driveFile, folder: driveFolder } = await googleDriveService.uploadFile(fileStream, fileName, mimeType, entregaPactadaFolderId)
        // Almacenarnos el fileId en el arreglo
        fileIds.push(driveFile.id)

        console.log(pico.cyan(`Archivo subido en Drive File: ${JSON.stringify({
          id: driveFile.id,
          name: driveFile.name,
          webViewLink: driveFile.webViewLink
        }, null, 2)}`))

        console.log(pico.cyan(`Carpeta contenedora: ${JSON.stringify({
          id: driveFolder.id,
          name: driveFolder.name,
          webViewLink: driveFolder.webViewLink
        }, null, 2)}`))

        // Actualizar el registro del archivo con el nombre y la referencia correctos
        await archivo.update({
          nombre: fileName,
          referencia: driveFile.webViewLink,
          updated_by: res.locals.usuario.ID
        }, { transaction }) // Pasar la transacción aquí

        archivos.push(archivo)
      } catch (fileError) {
        console.error(pico.red(`Error procesando archivo ${file.originalname}: ${fileError.message}`)) // No pasamos el error, seguimos con el siguiente archivo
      }
    }
    return archivos
  } catch (error) {
    console.error(pico.red(`Error al asociar archivos a la entrega: ${error.message}`))
    // Eliminar archivos de Google Drive en caso de error
    for (const fileId of fileIds) {
      try {
        await googleDriveService.deleteFile(fileId)
        console.log(pico.yellow(`Archivo con ID ${fileId} eliminado de Google Drive debido a un error`))
      } catch (deleteError) {
        console.error(pico.red(`Error al eliminar archivo de Google Drive: ${deleteError}`))
      }
    }
    // Pasar el error al siguiente middleware
    return next(error)
  } finally {
    for (const file of files) {
      if (file && file.path) {
        req.tempFiles.push(file.path)
      }
    }
  }
}

// Funcion para asociar archivos a una entrega
const asociarArchivosConEntrega = async (req, res, next) => {
  try {
    const entregaId = req.params.entregaId
    const files = req.files
    if (!entregaId || !files) {
      return next({ ...errors.ValidationError, details: `El valor de files es: ${files} y el valor de entregaId es ${entregaId}. Por favor, vuelva a ingresar valores correctos` })
    }
    console.log(pico.blue(` --- Iniciando asocacion de entrega con ${files.length} archivos ---`))
    await handleTransaction(async (transaction) => {
      const archivosAsociados = await asociarArchivos(files, entregaId, req, res, transaction, next)
      if (!archivosAsociados.length) {
        return next({ ...errors.NotFoundError, details: 'No se encontraron archivos para asociar' })
      }
      res.status(201).json({ archivosAsociados })
    }, next)
  } catch (error) {
    return next(error)
  }
}
// Un docente puede listar las entregas
async function listarEntregasParaElDocente(req, res, next) {
  const { idEntregaPactada } = req.params
  console.log('Entregas ID que llega del params', idEntregaPactada)
  try {
    const entregas = await models.Entrega.findAll({
      where: { entregaPactada_ID: idEntregaPactada },
      include: [
        {
          model: models.Persona,
          attributes: ['legajo', 'nombre', 'apellido']
        }
      ]
    })

    if (!entregas.length) {
      return next({ ...errors.NotFoundError, details: 'No se encontraron entregas de alumnos para esa entregaPactadaID' })
    }
    const estadosEntregas = []
    for (const entrega of entregas) {
      estadosEntregas[entrega.ID] = await getEstado(entrega)
    }

    const entregasMapeadas = entregas.map(entrega => ({
      id: entrega.ID,
      legajo: entrega.Persona.legajo,
      nombre: entrega.Persona.nombre,
      apellido: entrega.Persona.apellido,
      nota: entrega.nota,
      estado: estadosEntregas[entrega.ID].descripcion
    }))

    res.status(200).json(entregasMapeadas)
  } catch (error) {
    return next({
      ...errors.InternalServerError,
      details: 'Error al listar las entregas: ' + error.message
    })
  }
}

// Función para actualizar una entrega
async function actualizar(req, res, next) {
  const { idEntrega } = req.params
  const { fecha, nota, grupoId, personaId } = req.body

  try {
    await handleTransaction(async (transaction) => {
      const entrega = await models.Entrega.findOne({
        where: { ID: idEntrega },
        attributes: ['ID'],
        transaction
      })

      if (!entrega) {
        console.warn(pico.yellow(`Advertencia: Entrega con ID ${idEntrega} no encontrada.`))
        await transaction.rollback()
        return next({ ...errors.NotFoundError, details: 'Entrega no encontrada' })
      }

      await entrega.update({
        fecha,
        nota,
        grupo_ID: grupoId,
        persona_idEntrega: personaId,
        updated_by: res.locals.usuario.ID
      }, { transaction })

      res.status(200).json(entrega)
    }, next)
  } catch (error) {
    console.error(pico.red('Error al actualizar la entrega:', error))
    return next(error) // Pasa el error al midEntregadleware de errores
  }
}

// Función para eliminar una entrega
async function eliminar(req, res, next) {
  const { idEntrega } = req.params

  const entregaEliminada = await handleTransaction(async (transaction) => {
    const entrega = await models.Entrega.findByPk(idEntrega, {
      attributes: ['ID'],
      transaction
    })

    if (!entrega) {
      console.warn(pico.yellow(`Advertencia: Entrega con ID ${idEntrega} no encontrada.`))
      await transaction.rollback()
      return next({ ...errors.NotFoundError, details: 'Entrega no encontrada' })
    }

    await entrega.destroy({ transaction })
    return entrega
  }, next)

  if (entregaEliminada) {
    res.status(200).json({ message: 'Entrega eliminada exitosamente' })
  }
}

// Función para calificar una entrega
const calificarEntrega = async (req, res, next) => {
  const { idEntrega } = req.params
  const { nota } = req.body
  try {
    const entrega = await models.Entrega.findByPk(idEntrega)
    if (!entrega || !nota) {
      console.warn(pico.yellow(`Advertencia: Entrega con ID ${idEntrega} no encontrada.`))
      return next({ ...errors.NotFoundError, details: 'Entrega no encontrada' })
    }

    entrega.nota = nota
    entrega.updated_by = res.locals.usuario.ID

    await entrega.save()

    res.status(200).json(entrega)
  } catch (error) {
    console.error(pico.red('Error al calificar la entrega:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error al calificar la entrega: ' + error.message
    })
  }
}

const ver = async (req, res, next) => {
  const { id } = req.params
  try {
    const entrega = await models.Entrega.findOne({
      where: { ID: id },
      include: [
        {
          model: models.Archivo,
          attributes: ['ID', 'updated_at']
        },
        {
          model: models.EntregaPactada,
          attributes: ['nombre', 'descripcion']
        }
      ],
      attributes: ['ID', 'fecha', 'nota']
    })

    if (!entrega) {
      return next({ ...errors.NotFoundError, details: 'Entrega no encontrada' })
    }

    const archivosIds = entrega.Archivos ? entrega.Archivos.map(archivo => archivo.get('ID')) : []
    // const archivosFecha = entrega.Archivos ? entrega.Archivos.map(archivo => archivo.get('updated_at')) : []
    // Formatear la respuesta
    const entregaConArchivos = {
      ID: entrega.ID,
      fecha: entrega.fecha,
      nota: entrega.nota,
      archivosIDs: archivosIds,
      archivos: archivosIds,
      // archivosFecha,
      nombre: entrega.EntregaPactada.nombre,
      descripcion: entrega.EntregaPactada.descripcion
    }

    res.status(200).json(entregaConArchivos)
  } catch (error) {
    console.error('Error al obtener los archivos de la entrega:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener los archivos asociados de la entrega: ' + error.message
    })
  }
}

async function getEstado(entrega) {
  // 0 sin entregar, 1 promocionado , 2 aprobado, 3 desaprobado, 4 con comentarios  5 sin corregir
  const estado = {
    id: null,
    descripcion: null
  }
  if (entrega == null) {
    estado.id = 0
    estado.descripcion = 'Sin entregar'
  } else {
    // tODO: MODIFICAR ESTO, ES MUY CROTO PARA SAFAR
    if (entrega.ID === undefined) {
      entrega.ID = entrega.entregaId
    }
    if (entrega.nota) {
      estado.id = entrega.nota >= 6 ? 1 : entrega.nota >= 4 ? 2 : 3
      estado.descripcion = entrega.nota >= 6 ? 'Promocionado' : entrega.nota >= 4 ? 'Aprobado' : 'Desaprobado'
    } else {
      const comentarios = await models.Comentario.count({
        where: {
          entrega_id: entrega.ID
        }
      })
      console.log('problema 2')
      if (comentarios > 0) {
        estado.id = 4
        estado.descripcion = 'Con Comentarios'
      } else {
        estado.id = 5
        estado.descripcion = 'Sin corregir'
      }
    }
  }
  return estado
}

const obtenerEntregaComoAlumno = async (req, res, next) => {
  const { idEntregaPactada } = req.params
  const personaId = res.locals.usuario.persona_id // Obtener ID de la persona logueada

  try {
    // Obtener los grupos a los que pertenece el alumno
    const personaXGrupos = await models.PersonaXGrupo.findAll({
      where: { persona_id: personaId },
      include: [
        {
          model: models.Grupo,
          attributes: ['ID', 'Nombre', 'curso_id']
        }
      ]
    })

    // Obtener IDs de los grupos del alumno
    const grupoIds = personaXGrupos.map(personaXGrupo => personaXGrupo.Grupo.ID)
    console.log(pico.blue(`Grupos del alumno: ${grupoIds}`))
    // Obtener la entrega asociada al persona_id del alumno
    let entrega = await models.Entrega.findOne({
      where: {
        entregaPactada_ID: idEntregaPactada,
        persona_id: personaId
      }
    })
    // Si no se encuentra una entrega individual, buscar una entrega grupal
    if (!entrega) {
      console.log(pico.yellow('Advertencia: No se encontró ninguna entrega para el alumno de forma individual'))

      // Buscar la entrega grupal iterando sobre los IDs de los grupos
      for (const grupoId of grupoIds) {
        console.log(pico.blue(`Buscando entrega grupal para grupo ID con valor actual de: ${grupoId}`))
        entrega = await models.Entrega.findOne({
          where: {
            entregaPactada_ID: idEntregaPactada,
            grupo_id: grupoId
          }
        })
        if (entrega) {
          break // Si se encuentra una entrega, salir del bucle porque ya se encontró la entrega grupal dado que tenemos la entregaPctadaId particular y el grupoId
        }
      }
    }
    // Si no se encuentra ninguna entrega, devolver un error
    if (!entrega) {
      console.log(pico.yellow('Advertencia: No se encontró ninguna entrega para el alumno en el grupo '))
    }

    // Entregas encontradas:
    res.status(200).json({
      success: true,
      entrega
    })
  } catch (error) {
    console.error('Error al obtener las entregas del alumno:', error)
    next({
      ...errors.InternalServerError,
      details: 'Error al obtener las entregas del alumno: ' + error.message
    })
  }
}

module.exports = {
  listarEntregasParaElDocente,
  crearEntrega,
  calificarEntrega,
  asociarArchivosConEntrega,
  ver,
  getEstado,
  obtenerEntregaComoAlumno
}
