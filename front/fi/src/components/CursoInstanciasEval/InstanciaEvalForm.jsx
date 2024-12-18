import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import axios from "axios";
import './CursoInstanciasEval.css';

function Actividad({ show, handleClose, cursoID, setInstancias, handleInstanciaAgregada }) {
  const [formData, setFormData] = useState({})
  const [tipoInstancias, setTipoInstancias] = useState([])
  const [isGrupal, setIsGrupal] = useState(false)
  const [aplicaPenalidad, setAplicaPenalidad] = useState(false)
  const [isLoading, setLoading] = useState({})

  const onChange = (e) => {
    setFormData(prevState => {
      return { ...prevState, [e.target.name]: e.target.value }
    })
  }

  const handleSwitchChange = () => {
    setIsGrupal(!isGrupal)
    setFormData(prevState => ({
      ...prevState,
      grupo: !isGrupal ? 1 : 0
    }))
  }

  const handlePenalidadChange = () => {
    setAplicaPenalidad(!aplicaPenalidad)
    setFormData(prevState => ({
      ...prevState,
      penalidad_aplicable: !aplicaPenalidad
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    formData.cursoID = cursoID
    console.log(formData)

    // PASAR LA DATA EN REQ BODY.
    axios.post(`/instanciaEvaluativa`, formData, { withCredentials: true }) // Ajusta la URL de la API según corresponda
      .then(response => {
        console.log('actividad creada', response.data);
        setFormData({})
        handleInstanciaAgregada(response.data);
      })
      .catch(err => {
        alert('Error: ' + err.response.data.error.message);
      })
    handleClose();
    setIsGrupal(false)
    setAplicaPenalidad(false)
  }

  useEffect(() => {
    // LISTAR EL TIPO DE INSTANCIAS DISPONIBLES PARA EL SELECT
    axios.get(`/instanciaEvaluativa/tiposInstancias`, { withCredentials: true }) // Ajusta la URL de la API según corresponda
      .then(response => {
        console.log(response.data)
        setTipoInstancias(response.data)
      })
      .catch(err => {
        console.log(err)
        // setError('Error al obtener los cursos');
        setLoading(false)
      })
  }, [])
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Crear instancia evaluativa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={e => handleSubmit(e)}>
            <Form.Group className="mb-3" controlId="grupoInstancia">
              <Form.Label>Nombre de la instancia</Form.Label>
              <Form.Control name="nombre" onChange={e => onChange(e)} type="text" placeholder="Escriba un nombre" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="grupoMateria">
              <Form.Label>Porcentaje de ponderacion</Form.Label>
              <Form.Select className='agregar-instancia-eval-select' name="porcentajePonderacion" onChange={e => onChange(e)} aria-label="Floating label select example">
                <option>Seleccione el porcentaje</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
                <option value="20">20%</option>
                <option value="25">25%</option>
                <option value="30">30%</option>
                <option value="35">35%</option>
                <option value="40">40%</option>
                <option value="45">45%</option>
                <option value="50">50%</option>
                <option value="55">55%</option>
                <option value="60">60%</option>
                <option value="65">65%</option>
                <option value="70">70%</option>
                <option value="75">75%</option>
                <option value="80">80%</option>
                <option value="85">85%</option>
                <option value="90">90%</option>
                <option value="95">95%</option>
                <option value="100">100%</option>
              </Form.Select>

              <Form.Label>Tipo de instancia</Form.Label>
              <Form.Select className='agregar-instancia-eval-select' name="tipoInstanciaID" onChange={e => onChange(e)} aria-label="Floating label select example">
                <option>Seleccione el tipo</option>
                {
                  tipoInstancias && tipoInstancias.length > 0
                    ?
                    tipoInstancias.map((tipo, index) => {
                      return (
                        <option key={index} value={tipo.ID}>{tipo.nombre}</option>
                      )
                    })
                    :
                    <option value="0">Cargando..</option>
                }

              </Form.Select>

              <Form.Group className="mb-3" controlId="grupoInstancia">
                <Form.Label>Descripcion (opcional)</Form.Label>
                <Form.Control name="descripcion" onChange={e => onChange(e)} type="text" placeholder="Escriba una descripcion" />
              </Form.Group>
            </Form.Group>
            <Form.Group className="mb-3" controlId="esGrupal">
              <Form.Label>¿Es grupal?</Form.Label>
              <Form.Check
                inline
                type="switch"
                id="custom-isGrupal"
                label={isGrupal ? "Sí, es en grupo" : "No, es individual"}
                checked={isGrupal}
                onChange={handleSwitchChange}
                className='float-end'
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="aplicaPenalidad">
              <Form.Label>¿Aplica penalidad?</Form.Label>
              <Form.Check
                inline
                type="switch"
                id="custom-aplicaPenalidad"
                label={aplicaPenalidad ? "Sí, aplica penalidad" : "No, no aplica penalidad"}
                checked={aplicaPenalidad}
                onChange={handlePenalidadChange}
                className='float-end'
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <Button className='btn-curso-cancelar' onClick={handleClose}>
              Cancelar
            </Button>
            <Button className='btn-curso-agregar' onClick={handleSubmit}>
              Confirmar
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Actividad