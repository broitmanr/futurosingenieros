import { useEffect, useState } from 'react';
import { Button, Form, Modal, InputGroup, Alert } from 'react-bootstrap';
import axios from "axios";
import { useParams } from 'react-router-dom'; // Importar useParams
import { LiaPlusSolid } from "react-icons/lia";
import './CursoInstanciasEval.css';

export const ModalCrearGrupo = ({ show, handleClose, grupoExistente }) => {
  const { id } = useParams(); // Obtener el cursoID de los parámetros de la URL
  const [legajos, setLegajos] = useState([{ legajo: '', nombre: '', apellido: '', idDePersona: null, error: '' }]);
  const [nombreGrupo, setNombreGrupo] = useState(''); // Estado para el nombre del grupo
  const [isLoading, setLoading] = useState(false);
  const [errorGrupo, setErrorGrupo] = useState(''); // Para manejar errores en el nombre del grupo
  const [mensajeExito, setMensajeExito] = useState(''); // Para manejar el mensaje de éxito
  const [guardarDeshabilitado, setGuardarDeshabilitado] = useState(false); // Controlar la visibilidad de los botones

  // Efecto para cargar datos si hay un grupo existente
  useEffect(() => {
    if (grupoExistente) {
      setNombreGrupo(grupoExistente.nombre);
      setLegajos(grupoExistente.Personas.map(persona => ({
        legajo: persona.legajo,
        nombre: persona.nombre,
        apellido: persona.apellido,
        idDePersona: persona.ID,
        error: ''
      })));
      setGuardarDeshabilitado(false); // Cambiar a false para permitir ediciones
    } else {
      setNombreGrupo('');
      setLegajos([{ legajo: '', nombre: '', apellido: '', idDePersona: null, error: '' }]);
      setGuardarDeshabilitado(false); // Habilitar botones si no hay grupo
    }
  }, [grupoExistente, show]);

  // Manejar cambio en el input de legajo
  const handleLegajoChange = (index, e) => {
    const newLegajos = [...legajos];
    newLegajos[index].legajo = e.target.value;
    // Limpiar nombre, apellido, idDePersona y errores cuando se modifica el legajo
    newLegajos[index].nombre = '';
    newLegajos[index].apellido = '';
    newLegajos[index].idDePersona = null;
    newLegajos[index].error = '';
    setLegajos(newLegajos);
  };

  // Buscar el legajo en la API
  const handleBuscarLegajo = async (index) => {
    const legajo = legajos[index].legajo;
    if (!legajo) return;

    setLoading(true);
    try {
      const response = await axios.get(`/persona/legajoCurso/${legajo}/${id}`, { withCredentials: true });
      const newLegajos = [...legajos];
      newLegajos[index].nombre = response.data.nombre;
      newLegajos[index].apellido = response.data.apellido;
      newLegajos[index].idDePersona = response.data.ID; // Se almacena el idDePersona
      newLegajos[index].error = ''; // Limpiar cualquier error anterior
      setLegajos(newLegajos);
    } catch (error) {
      const newLegajos = [...legajos];
      if (error.response && error.response.data.error && error.response.data.error.details) {
        // Usamos el 'details' del error para mostrar el mensaje específico
        newLegajos[index].error = error.response.data.error.details;
      } else {
        newLegajos[index].error = "Error al buscar el legajo";
      }
      setLegajos(newLegajos);
    } finally {
      setLoading(false);
    }
  };

  // Agregar nuevo campo de legajo
  const handleAgregarLegajo = () => {
    setLegajos([...legajos, { legajo: '', nombre: '', apellido: '', idDePersona: null, error: '' }]);
  };

  // Eliminar campo de legajo
  const handleEliminarLegajo = (index) => {
    const newLegajos = legajos.filter((_, i) => i !== index);
    setLegajos(newLegajos);
  };

  // Enviar datos al servidor
  const handleSubmit = (e) => {
    e.preventDefault();

    const legajosValidos = legajos.filter(item => item.idDePersona !== null);

    // Validar si el nombre del grupo está vacío
    if (!nombreGrupo.trim()) {
      setErrorGrupo('El nombre del grupo es obligatorio');
      return;
    }

    // Si hay errores con los legajos o el nombre del grupo
    if (legajosValidos.length !== legajos.length) {
      setErrorGrupo("Todos los legajos deben ser validados antes de guardar.");
      return;
    }

    // Preparar los datos a enviar
    const grupoData = {
      cursoID: id, // Incluimos el cursoID en la petición
      nombreGrupo, // Incluimos el nombre del grupo en la petición
      legajos: legajosValidos.map(item => item.idDePersona)
    };

    setLoading(true); // Iniciar cargando
    const request = grupoExistente
        ? axios.put(`/grupo/${grupoExistente.ID}`, grupoData, { withCredentials: true }) // Si existe, hacemos una actualización
        : axios.post(`/grupo/`, grupoData, { withCredentials: true }); // Si no existe, creamos uno nuevo

    request
        .then(response => {
          // Si la petición es exitosa, mostramos mensaje de éxito
          setMensajeExito('Grupo guardado con éxito');
          setGuardarDeshabilitado(true); // Deshabilitamos los botones de Guardar/Cancelar
          setErrorGrupo(''); // Limpiar cualquier error anterior
        })
        .catch(error => {
          setErrorGrupo(error.response?.data?.error?.details || 'Error al guardar el grupo');
          setMensajeExito(''); // Limpiar mensaje de éxito si hay un error
        })
        .finally(() => {
          setLoading(false); // Finalizamos la carga
        });
  };

  return (
      <>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{grupoExistente ? 'Editar Grupo' : 'Crear Grupo'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {mensajeExito && (
                <Alert variant="success">{mensajeExito}</Alert>
            )}
            {errorGrupo && (
                <Alert variant="danger">{errorGrupo}</Alert>
            )}
            <Form onSubmit={handleSubmit} id="formGrupo">
              {/* Campo para el nombre del grupo */}
              <Form.Group controlId="nombreGrupo" className="mb-3">
                <Form.Label>Nombre del Grupo</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Ingrese el nombre del grupo"
                    value={nombreGrupo}
                    onChange={(e) => {
                      setNombreGrupo(e.target.value);
                      setErrorGrupo(''); // Limpiar error cuando se modifica el nombre
                    }}
                    isInvalid={!!errorGrupo} // Mostrar como inválido si hay un error
                    disabled={guardarDeshabilitado} // Deshabilitar si ya se guardó
                />
              </Form.Group>

              {/* Campos de legajos */}
              {legajos.map((legajo, index) => (
                  <div key={index} className="mb-3">
                    <InputGroup>
                      {/* Botón de eliminar a la izquierda */}
                      <Button
                          variant="outline-danger"
                          onClick={() => handleEliminarLegajo(index)}
                          className='btn-delete-legajo'
                          disabled={guardarDeshabilitado} // Deshabilitar si ya se guardó
                      >
                        <i className="fa fa-times"></i>
                      </Button>

                      {/* Campo de legajo */}
                      <Form.Control
                          type="text"
                          placeholder="Ingrese legajo"
                          value={legajo.legajo}
                          onChange={e => handleLegajoChange(index, e)}
                          isInvalid={legajo.error !== ''} // Campo inválido si hay un error
                          disabled={guardarDeshabilitado} // Deshabilitar si ya se guardó
                      />

                      {/* Botón de búsqueda con la lupa */}
                      <Button
                          variant="outline-secondary"
                          onClick={() => handleBuscarLegajo(index)}
                          disabled={guardarDeshabilitado || isLoading} // Deshabilitar si ya se guardó o está cargando
                      >
                        <i className="fa fa-search"></i>
                      </Button>
                    </InputGroup>

                    {/* Mostrar nombre y apellido si está disponible */}
                    {legajo.nombre && legajo.apellido && (
                        <div className="mt-2">
                          <small className="text-success"> {legajo.nombre} {legajo.apellido} </small>
                        </div>
                    )}

                    {/* Mostrar error si hay un problema al buscar el legajo */}
                    {legajo.error && (
                        <div className="mt-2">
                          <small className="text-danger">{legajo.error}</small>
                        </div>
                    )}
                  </div>
              ))}
              <div className='btn-agregar-legajo-container'>
              {/* Botón para agregar legajo */}
                <Button
                  onClick={handleAgregarLegajo}
                  disabled={guardarDeshabilitado} // Deshabilitar si ya se guardó
                  className='btn-agregar-legajo'
                >
                  {/* Agregar Legajo */}
                  <LiaPlusSolid size={30} color= '#fff' />
                </Button>
              </div>              
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex justify-content-between w-100">
              <Button className='btn-curso-cancelar' onClick={handleClose} disabled={guardarDeshabilitado}>
                Cancelar
              </Button>
              <Button className='btn-curso-agregar' type="submit" disabled={guardarDeshabilitado || isLoading}>
                {isLoading ? 'Guardando...' : (grupoExistente ? 'Guardar Cambios' : 'Guardar Grupo')}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </>
  );
};
