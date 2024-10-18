import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import axios from "axios";


export const EntregaForm = ({ show, handleClose, idInstanciaEval, handleEntregaAgregada }) => {
    const [formData, setFormData] = useState({})

    const onChange = (e) => {
    
        setFormData(prevState => {
          return { ...prevState, [e.target.name]: e.target.value }
        })
      };

 
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('prueba')

        formData.instanciaEvaluativaID = parseInt(idInstanciaEval);
        formData.numero = parseInt(formData.numero)
        console.log(formData);
        // PASAR LA DATA EN REQ BODY.
        axios.post(`/entregaPactada`, formData, { withCredentials: true }) // Ajusta la URL de la API según corresponda
            .then(response => {
                console.log('Instancia evaluativa creada', response.data);
                setFormData({})
                handleEntregaAgregada(response.data)
                /*setInstancias(prevState => {
                    return [...prevState, response.data]
                })*/
            })
            .catch(err => {
                console.log(err.response.data.error)
                alert('Error: ' + err.response.data.error.message)
                // setError('Error al crear la instancia evaluativa');

            });

        handleClose();

    }
    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton style={{ backgroundColor: '#7fa7db', color: '#1A2035', fontWeight: 'bold' }}>
                    <Modal.Title>Crear una entrega</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={e => handleSubmit(e)}>

                        <Form.Group className="mb-3" controlId="grupoInstancia">
                            <Form.Label>Nombre de la entrega</Form.Label>
                            <Form.Control name="nombre" onChange={e => onChange(e)} type="text" placeholder="Ingrese un nombre" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="grupoInstancia">
                            <Form.Label>Numero de entrega</Form.Label>
                            <Form.Control name="numero" onChange={e => onChange(e)} type="number" placeholder="Ingrese un numero" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="grupoInstancia">
                            <Form.Label>Fecha de vencimiento 1</Form.Label>
                            <Form.Control name="fechavto1" onChange={e => onChange(e)} type="date" placeholder="Ingrese una fecha" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="grupoInstancia">
                            <Form.Label>Fecha de vencimiento 2</Form.Label>
                            <Form.Control name="fechavto2" onChange={e => onChange(e)} type="date" placeholder="Ingrese una fecha" />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="grupoInstancia">
                            <Form.Label>Descripcion</Form.Label>
                            <Form.Control name="descripcion" onChange={e => onChange(e)} type="text" placeholder="Ingrese una descripcion" />
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
                        <Button onClick={handleSubmit} variant="primary" style={{ backgroundColor: '#1A2035' }}>
                            Confirmar
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}
