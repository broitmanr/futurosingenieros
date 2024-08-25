import React, { useState, useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap'; 
import axios from 'axios';

function Curso({ show, handleClose }) {
  const [anio, setAnio] = useState('');
  const [comisiones, setComisiones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedComision, setSelectedComision] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');

  useEffect(() => {
    if (anio) {
      axios.get('http://localhost:5000/api/comision', { withCredentials: true }) //Obtener comisiones
      .then(response => {
        //Filtra la comision por año
        const comisionesFiltradas = response.data.filter(comision => comision.anio === anio);
        setComisiones(comisionesFiltradas)
      })
      .catch (err => console.error('Error al obtener comisiones', err))
    }
  }, [anio])

  useEffect(() => {
    if(selectedComision){
      axios.get(`http://localhost:5000/api/materia/${anio}`, { withCredentials: true }) //Obtener materias
      .then(response => {
        setMaterias(response.data)
      })
      .catch (err => console.err('Error al obtener materias', err))
    }
  }, [selectedComision, anio])

  const handleAnioChange = (e) => {
    const value = e.target.value;
    if(
      value === '' || (Number(value) >= 1 && Number(value) <= 5)
    ) {
      setAnio(value)
      setSelectedComision('')
      setSelectedMateria('')
    }
  };

  const handleConfirmar = (e) => { //Crear curso
    console.log('Curso creado')
    handleClose();
    /*e.preventDefault();
    axios.post('http://localhost:5000/api/curso', 
      { 
        cicloLectivo: anio,
        materiaID: selectedMateria,
        comisionID: selectedComision,
      }, 
      { withCredentials: true }
    )
    .then(response => {
      console.log('Curso creado con éxito', response.data)
      handleClose();
    })
    .catch (err => console.log('Error al querer crear el curso', err))*/
  };

  const handleCancelar = () => { //Cancelar curso
    console.log('Curso cancelado')
    setAnio('')
    setSelectedComision('')
    setSelectedMateria('')
    handleClose()
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Form onSubmit={handleConfirmar}>
          <Modal.Header closeButton style={{ backgroundColor: '#7fa7db', color: '#1A2035', fontWeight: 'bold' }}>
            <Modal.Title>Agregar curso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form.Group className="mb-3" controlId="grupoCiclo">
                <Form.Label>Ciclo lectivo</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ej: 1, 2, 3, 4, 5"
                  value={anio}
                  onChange={handleAnioChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="grupoComision">
                <Form.Label>Comisión</Form.Label>
                <Form.Select aria-label="Floating label select example"
                  value={selectedComision} onChange={(e) => setSelectedComision(e.target.value)}>
                  <option value="">Seleccione una comisión</option>
                  {comisiones.map(comision => (
                    <option key={comision.ID} value={comision.ID}>{comision.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="grupoMateria">
                <Form.Label>Materia</Form.Label>
                <Form.Select aria-label="Floating label select example" 
                  value={selectedMateria} onChange={(e) => setSelectedMateria(e.target.value)}>
                  <option value="">Seleccione una materia</option>
                  {materias.map(materia => (<option key={materia.ID} value={materia.ID}>{materia.nombre}</option>))}
                </Form.Select>
              </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex justify-content-between w-100">
              <Button variant="secondary" onClick={handleCancelar} 
                style={{ 
                  backgroundColor: '#CCDCF1', 
                  color: '#1A2035', 
                  fontWeight: 'bold', 
                  borderBlockColor: '#1A2035',
                  }}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" style={{ backgroundColor: '#1A2035' }}>
                Confirmar
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default Curso;