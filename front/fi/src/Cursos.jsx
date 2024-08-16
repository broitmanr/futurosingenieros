import React, { useState } from "react";
import data from './data';
import { Button, Card, Col, Row } from 'react-bootstrap';
import Curso from './CursoForm';

const Cursos = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return ( 
        <div className="cursos-container" style={{ minHeight: '100vh', position: 'relative', padding: '2rem' }}>
            <Button variant="primary" onClick={() => setShow (true)} 
                    style={{ 
                        position: 'absolute', 
                        right: '6.6rem', 
                        margin: 5,
                        background: '#1A2035'
                    }}>
                    Agregar curso
            </Button>
            <Curso show={show} handleClose={handleClose} />
            <Row xs={1} md={3} className="g-4" style={{padding: '5rem'}}>
                {/*Recorre los datos en data */}
                {data.map((item, idx) => ( 
                    <Col key={idx}>
                        <Card>
                            {/*<Card.Img variant="top" src="../public/logo2.png" /> */}
                            <Card variant= "top" style={{backgroundColor: '#7fa7db', height: '10rem'}}></Card>
                            <Card.Body>
                                <Card.Title>{item.comision}</Card.Title> 
                                <Card.Text>
                                    {item.materia}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
        
    )
}

export default Cursos