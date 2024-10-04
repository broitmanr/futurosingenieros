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

export default function SignOut() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [validatedFirst, setValidatedFirst] = useState(false);
    const [validatedSecond, setValidatedSecond] = useState(false);
    const stepperRef = useRef(null);
    const navigate = useNavigate();

    const handleRoleChange = (role) => {
        setSelectedRole(role);
    };

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false || selectedRole === null || password !== confirmPassword || email !== confirmEmail) {
        event.preventDefault();
        event.stopPropagation();
        setValidatedFirst(true)
        }else{
            setValidatedFirst(false);
            stepperRef.current.nextCallback()
        }
        
    };

    const handleSecondSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        setValidatedSecond(true)
        }else{
            setValidatedSecond(false);
            navigate('/login')
        }
    };

    return(
        <div className="register-container">
            <h5 className='title-sign-up'>Registrarme</h5>
            <Stepper ref={stepperRef} style={{ flexBasis: '50rem' }}>
            <StepperPanel header="Información de usuario">
                <div className="flex flex-column h-12rem">
                    <Form noValidate validated={validatedFirst} onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formGridEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control required type="email" placeholder="Ingrese su email" value={email} 
                                onChange={(e) => setEmail(e.target.value)} />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su email</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridConfirmEmail">
                            <Form.Label>Confirmar Email</Form.Label>
                            <Form.Control required type="email" placeholder="Ingrese nuevamente su email" value={confirmEmail} 
                                onChange={(e) => setConfirmEmail(e.target.value)} isInvalid={validatedFirst && email !== confirmEmail} />
                            <Form.Control.Feedback type='invalid'>
                                {validatedFirst && email !== confirmEmail ? "Los correos no coinciden" : "Por favor, confirme su email"}
                            </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formGridPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control required type="password" placeholder="Ingrese su contraseña" value={password} 
                                onChange={(e) => setPassword(e.target.value)}  />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su contraseña</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} controlId="formGridConfirmPassword">
                            <Form.Label>Confirmar contraseña</Form.Label>
                            <Form.Control required type="password" placeholder="Ingrese nuevamente su contraseña" value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} isInvalid={validatedFirst && password !== confirmPassword} />
                            <Form.Control.Feedback type='invalid'>
                                {validatedFirst && password !== confirmPassword ? "Las contraseñas no coinciden" : "Por favor, confirme su contraseña"}
                            </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formGridLegajo">
                            <Form.Label>Legajo o DNI</Form.Label>
                            <Form.Control required type="number" placeholder="Ingrese su legajo o DNI" />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su legajo o DNI</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} className='form-control-rol-container' controlId="formGridRol">
                            <div key='inline-radio' className="mb-3 form-control-rol">
                                <Form.Label className='radio-rol-label'>Rol</Form.Label>
                                <div>
                                <Form.Check
                                    inline
                                    required
                                    type="radio"
                                    id='inline-radio-1'
                                    label="Estudiante"
                                    className='radio-rol'
                                    checked={selectedRole === 'Estudiante'}
                                    onChange={() => handleRoleChange('Estudiante')}
                                />
                                <Form.Check
                                    inline
                                    required
                                    type="radio"
                                    id='inline-radio-2'
                                    label="Docente"
                                    className='radio-rol'
                                    checked={selectedRole === 'Docente'}
                                    onChange={() => handleRoleChange('Docente')}
                                />
                                </div>
                            </div>
                            <Form.Control.Feedback type='invalid'>Debe elegir una de las opciones</Form.Control.Feedback>
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
                    <Form noValidate validated={validatedSecond} onSubmit={handleSecondSubmit}>
                        <Form.Group className="mb-3" controlId="formGroupName">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control required placeholder="Ingrese su nombre" />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su nombre</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formGroupLastName">
                            <Form.Label>Apellido</Form.Label>
                            <Form.Control required placeholder="Ingrese su apellido" />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su apellido</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formGroupId">
                            <Form.Label>Documento</Form.Label>
                            <Form.Control required type='number' placeholder="Ingrese su documento" />
                            <Form.Control.Feedback type='invalid'>Debe ingresar su documento</Form.Control.Feedback>
                        </Form.Group>
                        <Col xs="auto" className="my-1 btns-sign-out">
                            <Button className='btn-cancel-sign-out' onClick={() => stepperRef.current.prevCallback()}>Volver</Button>
                            <Button className='btn-confirm-sign-out' type='submit'>Confirmar</Button>
                        </Col>
                    </Form>
                </div>
            </StepperPanel>
            </Stepper>
        </div>
    )
}