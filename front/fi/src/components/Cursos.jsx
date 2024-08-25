import React, {useEffect, useState} from "react";
import data from './shared/data';
import { Button, Card, Col, Row } from 'react-bootstrap';
import Curso from './CursoForm';
import axios from "axios";

const Cursos = () => {
    const [show, setShow] = useState(false);

    const [cursos, setCursos] = useState([]); // Estado para almacenar los cursos
    const [loading, setLoading] = useState(true); // Estado para manejar el estado de carga
    const [error, setError] = useState(''); // Estado para manejar errores

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // useEffect para hacer la petición con axios
    useEffect(() => {
        axios.get('http://localhost:5000/api/curso', { withCredentials: true }) // Ajusta la URL de la API según corresponda
            .then(response => {
                setCursos(response.data); // Almacena los datos obtenidos en el estado
                setLoading(false); // Detiene el estado de carga
            })
            .catch(err => {
                setCursos(data)
                // setError('Error al obtener los cursos');
                setLoading(false);
            });
    }, []); // El array vacío asegura que el efecto solo se ejecute una vez al montar el componente


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

            {loading && <p>Cargando cursos...</p>}
            {error && <p>{error}</p>}
            {/* Mostrar los cursos si se han cargado correctamente */}
            {!loading && !error && (
                <Row xs={1} md={3} className="g-4" style={{padding: '5rem'}}>
                    {cursos.map((item, idx) => (
                        <Col key={idx}>
                            <Card>
                                <Card variant="top" style={{backgroundColor: '#7fa7db', height: '10rem'}}></Card>
                                <Card.Body>
                                    <Card.Title>
                                        <Row>
                                            <Col className="col-md-9">
                                                {item.comision}
                                            </Col>
                                            <Col className="col-md-3 text-right">
                                                {item.anio}
                                            </Col>
                                        </Row>
                                    </Card.Title>
                                    <Card.Text>
                                        {item.materia}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
}
export default Cursos