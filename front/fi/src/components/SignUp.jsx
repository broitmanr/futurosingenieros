import * as React from 'react';
import { useState, useRef } from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Button } from 'react-bootstrap';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { FaUserCircle } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import './styles/Home.css'
import axios from 'axios'
import {Toast} from "primereact/toast";

export default function SignOut() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [validatedFirst, setValidatedFirst] = useState(false);
    const [validatedSecond, setValidatedSecond] = useState(false);
    const [userData, setUserData] = useState({})
    const [personData, setPersonData] = useState({})
    const stepperRef = useRef(null);
    const navigate = useNavigate();
    const toast = useRef(null);



    /*const handleSubmit = (e) => {
        const form = e.currentTarget;
        if (form.checkValidity() === false || selectedRole === null || password !== confirmPassword || email !== confirmEmail) {
        e.preventDefault();
        e.stopPropagation();
        setValidatedFirst(true)
        }else{
            setValidatedFirst(false);
            stepperRef.current.nextCallback()
        }
    };*/

    const handleSubmitPrueba = async (e) => {
        e.preventDefault()
        const form = e.currentTarget;
        if (form.checkValidity() === false || password !== confirmPassword || email !== confirmEmail) {
            e.stopPropagation();
            setValidatedFirst(true)

        }else{
            setValidatedFirst(false);
            try{
                const response = await axios.post('http://localhost:5000/auth/sign-up',userData, { withCredentials: true })
                if(response.data.success){
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Registro exitoso', life: 3000 });
                    navigate('/login')
                }
            }catch(err){
                if (err.response && err.response.status === 404){
                    stepperRef.current.nextCallback()
                }else if(err.response){
                    toast.current.show({ severity: 'error', summary: 'Error', detail: err.response.data.error.details, life: 3000 });

                }else{
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error', life: 3000 });
                }

            }
        }
    };

    const handleSecondSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
        e.preventDefault();
        e.stopPropagation();
        setValidatedSecond(true)
        }
        else{
            setValidatedSecond(false);
            try{
                console.log(userData,personData)
                const response = await axios.post('http://localhost:5000/auth/sign-up-zero',{userData,personData}, { withCredentials: true })
                if(response.data.success){
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Registro exitoso', life: 3000 });
                    navigate('/login')
                }
            }catch(err){
                if(err.response){
                    toast.current.show({ severity: 'error', summary: 'Error', detail: err.response.data.error.details, life: 3000 });

                }else{
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error', life: 3000 });
                }

                console.log('No se ha logrado registrar al usuario', err)
            }
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target
        setUserData((prevState) => ({
            ...prevState,
            [name]: value
        }))
        if(name === 'email'){
            setEmail(value)
        }else if (name === 'password'){
            setPassword(value)
        }
    }
    const handleSecondChange = (e) => {
        const {name, value} = e.target
        setPersonData((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }


    return(
        <div className="register-container">
            <h5 className='title-sign-up'>Registrarme</h5>
            <Stepper linear ref={stepperRef} style={{ flexBasis: '50rem' }}>
            <StepperPanel header="Información de usuario">
                <div className="flex flex-column h-12rem">
                    <Form noValidate validated={validatedFirst} onSubmit={handleSubmitPrueba}>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formGridEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control required type="email" name='email' placeholder="Ingrese su email" value={email} onChange={handleChange} />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su email</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridConfirmEmail">
                            <Form.Label>Confirmar Email</Form.Label>
                            <Form.Control required type="email" name='confirmEmail' placeholder="Ingrese nuevamente su email" value={confirmEmail}
                                          onChange={(e) => {
                                              const cemail = e.target.value;
                                              setConfirmEmail(cemail);
                                              handleChange(e);
                                          }}
                                          isInvalid={validatedFirst && userData.email !== confirmEmail} />
                            <Form.Control.Feedback type='invalid'>
                                {validatedFirst && userData.email !== confirmEmail ? "Los correos no coinciden" : "Por favor, confirme su email"}
                            </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formGridPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control required type="password" name='password' placeholder="Ingrese su contraseña" value={password} onChange={handleChange}  />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su contraseña</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridConfirmPassword">
                            <Form.Label>Confirmar contraseña</Form.Label>
                            <Form.Control required type="password" name='confirmPassword' placeholder="Ingrese nuevamente su contraseña" value={confirmPassword}
                                          onChange={(e) => {
                                              const cpass = e.target.value;
                                              setConfirmPassword(cpass);
                                              handleChange(e);
                                          }} isInvalid={validatedFirst && userData.password !== confirmPassword} />
                            <Form.Control.Feedback type='invalid'>
                                {validatedFirst && userData.password !== confirmPassword ? "Las contraseñas no coinciden" : "Por favor, confirme su contraseña"}
                            </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} controlId="formGridLegajo">
                            <Form.Label>Legajo o DNI</Form.Label>
                            <Form.Control required type="number" name='legajo' placeholder="Ingrese su legajo" onChange={handleChange} />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su legajo</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Col xs="auto" className="my-1 btns-sign-out">
                            <Button className='btn-cancel-sign-out' href='/login'>
                                Cancelar
                            </Button>
                            <Button className='btn-confirm-sign-out' type="submit">
                                Siguiente
                            </Button>
                        </Col>
                    </Form>
                </div> 
            </StepperPanel>
            <StepperPanel header="Completar registro">
                <div className="flex flex-column h-12rem second-register">
                    <Form className='second-register-form' noValidate validated={validatedSecond} onSubmit={handleSecondSubmit}>
                        <Form.Group className="mb-3" controlId="formGroupName">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control required name='nombre' onChange={handleSecondChange} placeholder="Ingrese su nombre" />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su nombre</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formGroupLastName">
                            <Form.Label>Apellido</Form.Label>
                            <Form.Control required name='apellido' onChange={handleSecondChange} placeholder="Ingrese su apellido" />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su apellido</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formGroupId">
                            <Form.Label>Documento</Form.Label>
                            <Form.Control required name='documento' onChange={handleSecondChange} type='number' placeholder="Ingrese su documento" />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su documento</Form.Control.Feedback>
                        </Form.Group>
                        <Col xs="auto" className="my-1 btns-second-sign-out">
                            <Button className='btn-cancel-sign-out' onClick={() => stepperRef.current.prevCallback()}>Volver</Button>
                            <Button className='btn-confirm-sign-out' type='submit'>Confirmar</Button>
                        </Col>
                    </Form>
                </div>
            </StepperPanel>
            </Stepper>
            <Toast ref={toast} />
        </div>
    )
}