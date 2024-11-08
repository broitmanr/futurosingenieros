import React, { useState, useEffect, useRef } from 'react';
import { Form, Modal } from 'react-bootstrap'; 
import axios from 'axios';
import { InputOtp } from 'primereact/inputotp';
import { Button } from 'primereact/button';
import './Cursos.css'
import { Toast } from 'primereact/toast';

function CursoVinculacion({ showVincular, handleCloseVincular, handleCursoAgregado }) {
  const [vinculo, setVinculo] = useState('');
  const toastRef = useRef(null);
  const [isCancel, setIsCancel] = useState(false)

  //Se mueve al siguiente campo de entrada si se ingresó un valor
  const handleChangeValue = (e, index) => {
    const newValue = [...vinculo];
    newValue[index] = e.target.value;
    setVinculo(newValue)
  
    if(e.target.value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`).focus()
    }
  }
  //Maneja el retroceso de los campos de entrada
  const handleKeyDown = (e, index) => {
    if(e.key === 'Backspace' && !vinculo[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus()
    }
  }

  const handleVincularAlumno = async (e) => {
    e.preventDefault();
    if(isCancel){
      setIsCancel(false)
      return
    }
    const codigoVinculacion = vinculo;
    if(!codigoVinculacion) {
      toastRef.current.show({ severity: 'error', summary: 'Error', detail: `Debe ingresar un código de vinculación`, life: 3000 })
      return
    }
    try{
      const response = await axios.post('/curso/vincular-estudiante', {
        codigoVinculacion
      }, { withCredentials: true })
      handleCursoAgregado(response.data)
      setVinculo(Array(4).fill('')) //Limpia el input
      toastRef.current.show({ severity: 'success', summary: 'Éxito', detail: 'Vinculación exitosa', life: 3000 });
      handleCloseVincular()
    } catch (err) {
      if (err.response.status === 404){
        toastRef.current.show({ severity: 'error', summary: 'Error', detail: `Código ${codigoVinculacion} no válido, por favor, revise nuevamente el código ingresado`, life: 3500 })
      } else if (err.response.status === 409){
        toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Ya perteneces al curso correspondiente al código ingresado', life: 3000 })
      } else {
        console.log('Error al vincularse al curso', err.response ? err.response.data : err.message)
      }
    }
  }

  const handleCancelarVinculacion = () => {
    console.log('Curso cancelado')
    setIsCancel(true)
    setVinculo('')
    handleCloseVincular()
  }

  return (
    <>
      <Toast ref={toastRef} />
      <Modal show={showVincular} onHide={handleCloseVincular} data-cy="modal-vinculacion">
  <Form onSubmit={handleVincularAlumno}>
    <div className="vincular-alumno-container">
      <h5 className="text-description-vincular-alumno">Ingrese el código de vinculación</h5>
      <div className='cod-v-alumno-container'>
        <InputOtp 
          className="input-item-cod-v"
          numInputs={4}
          value={vinculo} 
          onChange={(e) => setVinculo(e.value)}
          inputClassName="otp-input"
          data-cy="codigo-vinculacionAlumno"
        />
      </div>
      <div className="d-flex justify-content-between align-items-center w-100">
        <Button 
          className="btn-vincular-alumno" 
          onClick={handleCancelarVinculacion} 
          label='Cancelar'
          data-cy="btn-cancelar-vinculacion"
        />
        <Button 
          className="btn-vincular-alumno" 
          type='submit' 
          label='Agregar'
          data-cy="btn-confirmar-vinculacion"
        />
      </div>
    </div>
  </Form>
</Modal>
    </>
  );
}

export default CursoVinculacion;