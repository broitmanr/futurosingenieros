import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Modal } from 'react-bootstrap'; 
import axios from 'axios';
import { Dropdown } from 'primereact/dropdown';
import './Cursos.css'
import { Toast } from 'primereact/toast';

function Curso({ show, handleClose, handleCursoAgregado }) {
  const currentYear = new Date().getFullYear(); //Constante para obtener el año actual
  const initialForm = { //Constante para limpiar el form luego de agregar un curso
    anio: currentYear,
    selectedComision: '',
    selectedMateria: ''
  }
  const [anio, setAnio] = useState(initialForm.anio);
  const [comisiones, setComisiones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedComision, setSelectedComision] = useState(initialForm.selectedComision);
  const [selectedMateria, setSelectedMateria] = useState(initialForm.selectedMateria);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar el estado de la solicitud
  const toastRef = useRef(null);

  useEffect(() => { //Limpia el form luego de agregar un curso
    if(show){
      setAnio(initialForm.anio)
      setSelectedComision(initialForm.selectedComision)
      setSelectedMateria(initialForm.selectedMateria)
    }
  }, [show])

  useEffect(() => {
      axios.get('/comision', { withCredentials: true }) //Obtener comisiones
      .then(response => {
        setComisiones(response.data)
      })
      .catch (err => console.error('Error al obtener comisiones', err))
  }, [])

  useEffect(() => {
    if(selectedComision){
      const anioComision = comisiones.find(comision => comision.ID === selectedComision)?.anio; //Se obtiene anio
      axios.get(`/materia/${anioComision}`, { withCredentials: true }) //Obtiene las materias
      .then(response => {
        setMaterias(response.data)
      })
      .catch (err => console.err('Error al obtener materias', err))
    }
  }, [selectedComision, comisiones])

  const handleAnioChange = (e) => {
    const value = e.target.value;
    if( value === '' || !isNaN(value) && value >= currentYear ) { //Comprueba que sea un número y que sea >= al año actual
      setAnio(value)
      setSelectedComision('')
      setSelectedMateria('')
    }
  };

  const handleConfirmar = (e) => { //Crear curso
    e.preventDefault();
    setIsSubmitting(true); // Establecer isSubmitting en true cuando se inicie la solicitud
    axios.post('/curso',
      { 
        cicloLectivo: anio,
        materiaID: selectedMateria,
        comisionID: selectedComision,
      }, 
      { withCredentials: true }
    )
    .then(response => {
      console.log('Curso creado con éxito', response.data)
      handleCursoAgregado(response.data) //Actualiza lista de cursos
      toastRef.current.show({ severity: 'success', summary: 'Éxito', detail: 'Curso creado con éxito', life: 3000 });
      handleClose();
    })
    .catch (err => console.log('Error al querer crear el curso', err))
    .finally(() => {
      setIsSubmitting(false); // Establecer isSubmitting en false cuando la solicitud se complete o falle
    });
  };

  const handleCancelar = () => { //Cancelar curso
    console.log('Curso cancelado')
    setAnio(currentYear)
    setSelectedComision('')
    setSelectedMateria('')
    handleClose()
  };

  const comisionOptions = comisiones.map(comision => ({
    label: comision.nombre,
    value: comision.ID,
  }))

  return (
    <>
      <Toast ref={toastRef} />
      <Modal show={show} onHide={handleClose}>
        <Form onSubmit={handleConfirmar}>
          <Modal.Header className='modal-header-agregar-curso' closeButton>
            <Modal.Title>Agregar curso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form.Group className="mb-3" controlId="grupoCiclo">
                <Form.Label>Ciclo lectivo</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={currentYear}
                  value={anio}
                  min={currentYear}
                  onChange={handleAnioChange}
                />
              </Form.Group>
              <Form.Group className="mb-3 d-flex flex-column" controlId="grupoComision">
                <Form.Label>Comisión</Form.Label>
                <Dropdown className="w-full modal-dropdown-comision" 
                  value={selectedComision} 
                  onChange={(e) => setSelectedComision(e.value)} 
                  options={comisionOptions} optionLabel="label" 
                  editable 
                  placeholder="Seleccione una comisión (Ej: S10, S21)"
                  filter
                  emptyMessage="Oops... no se encontró la comisión"
                  emptyFilterMessage="Oops... no se encontró la comisión"
                  appendTo="self" //Muestra el drop dentro del modal
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="grupoMateria">
                <Form.Label>Materia</Form.Label>
                <Form.Select 
                  className='modal-select-materia'
                  aria-label="Floating label select example"
                  value={selectedMateria} onChange={(e) => setSelectedMateria(e.target.value)}>
                  <option value="">Seleccione una materia</option>
                  {materias.map(materia => (<option key={materia.ID} value={materia.ID}>{materia.nombre}</option>))}
                </Form.Select>
              </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex justify-content-between w-100">
              <Button className='btn-agregar-curso-cancelar' onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button className='btn-agregar-curso' type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default Curso;