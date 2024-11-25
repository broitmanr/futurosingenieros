import { useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import axios from "axios";
import './InstanciaEvalEntregas.css';
import { Toast } from 'primereact/toast';

export const EntregaModify = ({ showModify, handleCloseModify, idInstanciaEval, entregas/*, handleEntregaAgregada*/ }) => {
    const [formData, setFormData] = useState({})
    const toastRef = useRef(null)

    const onChange = (e) => {
        setFormData(prevState => {
          return { ...prevState, [e.target.name]: e.target.value }
        })
    };

    const handleSubmitModify = (e) => {
        e.preventDefault();
        if (!formData.nombre){ 
            toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Debe ingresar un nombre', life: 3000 })
            return 
        }
        const hayNombresDuplicados = entregas.some(entrega => entrega.nombre.toLowerCase() === formData.nombre.toLowerCase())
        if(hayNombresDuplicados){
        toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Ya existe una entrega con ese nombre, por favor, elige otro nombre', life: 3000 })
        return 
        }
        if(/^\d+$/.test(formData.nombre)){
            toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'El nombre no puede ser solo un número', life: 3000 })
            return
        }
        formData.instanciaEvaluativaID = parseInt(idInstanciaEval);
        formData.numero = parseInt(formData.numero)
        if (!formData.numero){ 
            toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Debe ingresar un número entero', life: 3000 })
            return 
        }
        const hayNumerosDuplicados = entregas.some(entrega => entrega.numero === formData.numero)
        if(hayNumerosDuplicados){
            toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Ya existe una entrega con ese número, por favor, elige otro número', life: 3000 })
            return
        }
        if(!formData.fechavto1){
            toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'Debe ingresar la fecha de vencimiento 1', life: 3000 })
            return
        }
        console.log(formData);
        // PASAR LA DATA EN REQ BODY.
        // axios.put(`/entregaPactada`, formData, { withCredentials: true }) // Ajusta la URL de la API según corresponda
        //     .then(response => {
        //         console.log('Instancia evaluativa creada', response.data)
        //         setFormData({})
        //         handleEntregaModificada(response.data)
        //         toastRef.current.show({ severity: 'success', summary: 'Éxito', detail: 'Entrega Pactada modificada con éxito', life: 3000 });
        //         /*setInstancias(prevState => {
        //             return [...prevState, response.data]
        //         })*/
        //     })
        //     .catch(err => {
        //         console.log(err.response.data.error)
        //         alert('Error: ' + err.response.data.error.message)
        //         // setError('Error al crear la instancia evaluativa');

        //     })
        handleCloseModify()
    }

    const handleCancelar = () => {
        console.log('Modificación de entrega cancelada')
        setFormData({})
        handleCloseModify()
    }

    return (
        <>
            <Toast ref={toastRef} />
            <Modal show={showModify} onHide={handleCloseModify}>
                <Modal.Header closeButton>
                    <Modal.Title>Modificar entrega</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form /*onSubmit={e => handleSubmitModify(e)}*/>
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
                            <Form.Control name="fechavto1" 
                            value={formData.fechavto1}
                            onChange={e => onChange(e)} type="date"
                            min={new Date().toISOString().split("T")[0]} //No permite elegir una fecha anterior a la actual
                            placeholder="Ingrese una fecha" />
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
                        <Button className='btn-entrega-cancelar' onClick={handleCancelar}>
                            Cancelar
                        </Button>
                        <Button className='btn-entrega-agregar' /*onClick={handleSubmit}*/>
                            Confirmar
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    )
}