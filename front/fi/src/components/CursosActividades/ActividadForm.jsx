import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import axios from "axios";
function Actividad({ show, handleClose, cursoID,setInstancias, handleInstanciaAgregada }) {

  const [formData, setFormData] = useState({})
  const [tipoInstancias, setTipoInstancias] = useState([]);
  const [isLoading, setLoading] = useState({});


  const onChange = (e) => {
    
    setFormData(prevState => {
      return { ...prevState, [e.target.name]: e.target.value }
    })
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    formData.cursoID = cursoID;
    console.log(formData);

    // PASAR LA DATA EN REQ BODY.
     axios.post(`/instanciaEvaluativa`,formData, { withCredentials: true }) // Ajusta la URL de la API según corresponda
             .then(response => {
                 console.log('actividad creada',response.data);
                 setFormData({})
                 /*setInstancias(prevState => {
                    return [...prevState, response.data]
                 })*/
                 handleInstanciaAgregada(response.data)
             })
             .catch(err => {
                 alert('Error: '+ err.response.data.error.message)
                 // setError('Error al crear la actividad');
               
             });
 
    handleClose();
    }


  useEffect(() => {
    // LISTAR EL TIPO DE INSTANCIAS DISPONIBLES PARA EL SELECT
    axios.get(`/instanciaEvaluativa/tiposInstancias`, { withCredentials: true }) // Ajusta la URL de la API según corresponda
      .then(response => {
        console.log(response.data);
        setTipoInstancias(response.data)
      
      })
      .catch(err => {
        console.log(err)
        // setError('Error al obtener los cursos');
        setLoading(false);
      });
  }, [])
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton style={{ backgroundColor: '#7fa7db', color: '#1A2035', fontWeight: 'bold' }}>
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
              <Form.Select name="porcentajePonderacion" style={{ marginBottom: '1rem' }} onChange={e => onChange(e)} aria-label="Floating label select example">
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
              <Form.Select name="tipoInstanciaID" style={{ marginBottom: '1rem' }} onChange={e => onChange(e)} aria-label="Floating label select example">
                <option>Seleccione el tipo</option>
                {
                  tipoInstancias && tipoInstancias.length > 0 
                  ?
                    tipoInstancias.map((tipo,index) => {
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

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <Button variant="secondary" onClick={handleClose}
              style={{
                backgroundColor: '#CCDCF1',
                color: '#1A2035',
                fontWeight: 'bold',
                borderBlockColor: '#1A2035',
              }}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} style={{ backgroundColor: '#1A2035' }}>
              Confirmar
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Actividad;