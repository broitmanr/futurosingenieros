import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import axios from "axios";

export const ModalCrearGrupo = ({show, handleClose}) => {
    const [formData, setFormData] = useState({});
    const [isLoading, setLoading] = useState({});
  
    const onChange = (e) => {
      setFormData(prevState => {
        return { ...prevState, [e.target.name]: e.target.value }
      })
    
    };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData)
    handleClose();
  }

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton style={{ backgroundColor: '#7fa7db', color: '#1A2035', fontWeight: 'bold' }}>
          <Modal.Title>Crear Grupo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={e => handleSubmit(e)}>
            <Form.Group className="mb-3" controlId="legajoEstudianteCreador">
              <Form.Label>Legajo</Form.Label>
              <Form.Control name="legajoEstudiantes[]" onChange={e => onChange(e)} type="text" placeholder="Ingrese su propio legajo" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="legajoIntegranteUno">
              <Form.Label>Nombre de la instancia</Form.Label>
              <Form.Control name="legajoEstudiantes[]" onChange={e => onChange(e)} type="text" placeholder="Escriba un nombre" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="legajoIntegranteDos">
              <Form.Label>Nombre de la instancia</Form.Label>
              <Form.Control name="legajoEstudiantes[]" onChange={e => onChange(e)} type="text" placeholder="Escriba un nombre" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="legajoIntegranteTres">
              <Form.Label>Nombre de la instancia</Form.Label>
              <Form.Control name="legajoEstudiantes[]" onChange={e => onChange(e)} type="text" placeholder="Escriba un nombre" />
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
  )
}
