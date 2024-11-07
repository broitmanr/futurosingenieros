import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Modal } from 'react-bootstrap'; 
import axios from 'axios';
import { Dropdown } from 'primereact/dropdown';
import './Cursos.css'
import { Toast } from 'primereact/toast';

function CursoModificar({ curso, showFormModificar, handleCloseModificarForm, handleCursoModificado }) {
  const currentYear = new Date().getFullYear()
  const initialForm = { //Constante para limpiar el form luego de agregar un curso
    anio: curso.anio,
    selectedComision: '',
    selectedMateria: ''
  }
  const [anio, setAnio] = useState(initialForm.anio);
  const [comisiones, setComisiones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [selectedComision, setSelectedComision] = useState(initialForm.selectedComision);
  const [selectedMateria, setSelectedMateria] = useState(initialForm.selectedMateria);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para controlar el estado de la solicitud
  const toastR = useRef(null);

  useEffect(() => { //Limpia el form luego de agregar un curso
    if(showFormModificar){
      setAnio(curso.anio || initialForm.anio)
      setSelectedComision(curso.comision || initialForm.comision)
      setSelectedMateria(curso.materia || initialForm.materia)
    }
  }, [showFormModificar, curso])

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
      const materia = response.data.find(materia => materia.nombre === curso.materia)
      setSelectedMateria(materia ? materia.ID : '') //Obtener id del curso.materia
    })
    .catch (err => console.err('Error al obtener materias', err))
  }
}, [selectedComision, comisiones, curso.materia])

  const handleAnioChange = (e) => {
    const value = e.target.value;
    if( value === '' || !isNaN(value) && value >= currentYear ) { //Comprueba que sea un número y que sea >= al año actual
      setAnio(value)
    }
  };

  const handleComisionChange = (e) => {
    setSelectedComision(e.value)
    setSelectedMateria('')
  }

  const handleMateriaChange = (e) => {
    setSelectedMateria(e.target.value)
  }

  // const handleModificar = (e) => { //Modificar curso
  //   e.preventDefault()
  //   if (!selectedComision) { toastR.current.show({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar una comision', life: 3000 }); return; }
  //   if (!selectedMateria) { toastR.current.show({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar una materia', life: 3000 }); return; }
  //   setIsSubmitting(true)
  //   axios.put(`/curso/${curso.id}`,
  //     { 
  //       cicloLectivo: anio,
  //       materiaID: selectedMateria,
  //       comisionID: selectedComision,
  //     }, 
  //     { withCredentials: true }
  //   )
  //   .then(response => {
  //     handleCursoModificado(response.data)
  //     toastR.current.show({ severity: 'success', summary: 'Éxito', detail: 'Curso modificado con éxito', life: 3000 })
  //     setTimeout(() => { //Evita conflictos con el toast
  //       handleCloseModificarForm();
  //     }, 1000);
  //   })
  //   .catch (err => console.log('Error al querer crear el curso', err))
  //   .finally(() => {
  //     setIsSubmitting(false); // Establecer isSubmitting en false cuando la solicitud se complete o falle
  //   });
  // };

  const handleCancelar = () => { //Cancelar curso
    console.log('Curso cancelado')
    setAnio('')
    setSelectedComision('')
    setSelectedMateria('')
    handleCloseModificarForm()
  };

  const comisionOptions = comisiones.map(comision => ({
    label: comision.nombre,
    value: comision.ID,
  }))

  return (
    <>
      <Toast ref={toastR} />
      <Modal show={showFormModificar} onHide={handleCloseModificarForm}>
        <Form /*onSubmit={handleModificar}*/>
          <Modal.Header className='modal-header-agregar-curso' closeButton>
            <Modal.Title>Modificar curso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form.Group className="mb-3" controlId="grupoCiclo">
                <Form.Label>Ciclo lectivo</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={curso.anio}
                  value={anio}
                  onChange={handleAnioChange}
                />
              </Form.Group>
              <Form.Group className="mb-3 d-flex flex-column" controlId="grupoComision">
                <Form.Label>Comisión</Form.Label>
                <Dropdown className="w-full modal-dropdown-comision" 
                  value={selectedComision} 
                  onChange={handleComisionChange} 
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
                  value={selectedMateria}
                  onChange={handleMateriaChange}
                >
                  <option value=''>{curso.materia}</option>
                  {materias.length > 0 ? materias.map(materia => ( <option key={materia.ID} value={materia.ID}>{materia.nombre}</option> )) : <option value="">No hay materias disponibles</option>}
                </Form.Select>
              </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex justify-content-between w-100">
              <Button className='btn-agregar-curso-cancelar' onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button className='btn-agregar-curso' /*type="submit"*/ disabled={isSubmitting}>
                {isSubmitting ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default CursoModificar;