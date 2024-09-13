import React, { useState, useEffect } from 'react';
import { Form, Modal } from 'react-bootstrap'; 
import axios from 'axios';
import { InputOtp } from 'primereact/inputotp';
import { Button } from 'primereact/button';
import './styles/CodigoVinculacion.css'

function CursoVinculacion({ showVincular, handleCloseVincular }) {
  const [vinculo, setVinculo] = useState('');

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
    const codigoVinculacion = vinculo;
    if(!codigoVinculacion) {
      console.log('Se debe ingresar un código de vinculación')
      return;
    }
    try{
      const response = await axios.post('http://localhost:5000/api/curso/vincular-estudiante', {
        codigoVinculacion
      }, { withCredentials: true })
      setVinculo(Array(4).fill('')) //Limpia el input
      handleCloseVincular()
    } catch (err) {
      console.log('Error al vincularse al curso', err.response ? err.response.data : err.message)
    }
  }

  const handleCancelarVinculacion = () => {
    console.log('Curso cancelado')
    setVinculo('')
    handleCloseVincular()
  };

  return (
    <>
      <Modal show={showVincular} onHide={handleCloseVincular}>
        <Form onSubmit={handleVincularAlumno}>
          <div className="vincular-alumno-container">
            <h5 className="text-description-vincular-alumno">Ingrese el código de vinculación</h5>
            <div className='cod-v-alumno-container'>
                <InputOtp 
                  className="input-item-cod-v"
                  numInputs={4}
                  value={vinculo} 
                  onChange={(e) => setVinculo(e.value)}
                />
            </div>
            <div className="d-flex justify-content-between align-items-center w-100">
              <Button className="btn-vincular-alumno" onClick={handleCancelarVinculacion} label='Cancelar' />
              <Button className="btn-vincular-alumno" type='submit' label='Agregar' />
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
}

export default CursoVinculacion;