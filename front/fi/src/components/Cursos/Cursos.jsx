import React, {useEffect, useState} from "react";
import data from '../shared/data';
import { Button, Card, Col, Row } from 'react-bootstrap';
import Curso from './CursoForm';
import CursoVinculacion from './CursoVinculacion'
import axios from "axios";
import { useRole } from "../../context/RolesContext";
import { Link } from "react-router-dom";
import { ProgressBar } from 'primereact/progressbar';
import './CodigoVinculacion.css'

const Cursos = () => {
    
    const { role } = useRole();
    const [show, setShow] = useState(false);
    const [showVincular, setShowVincular] = useState(false)
    const [cursos, setCursos] = useState([]); // Estado para almacenar los cursos
    const [loading, setLoading] = useState(true); // Estado para manejar el estado de carga
    const [imageLoading, setImageLoading] = useState(true) 
    const [error, setError] = useState(''); // Estado para manejar errores

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleCloseVincular = () => setShowVincular(false);

    const [shouldFetch, setShouldFetch] = useState(false); //Estados para manejar la actualización del curso
 
    // useEffect para hacer la petición con axios 

    const fetchCursos = async () => {
        try{
            const response = await axios.get('/curso', { withCredentials: true }) // Ajusta la URL de la API según corresponda
            if(response.data) {
                setCursos(response.data); // Almacena los datos obtenidos en el estado
                setLoading(false); // Detiene el estado de carga
            }
        } catch (err) {
            setCursos(data)
            // setError('Error al obtener los cursos');
            setLoading(false);
        }
    }

    useEffect(() =>{
        fetchCursos()
    }, [])

    useEffect(() => {
        if(shouldFetch){
            fetchCursos()
            setShouldFetch(false) //Resetea el estado de actualización
        }
    }, [shouldFetch])

    const handleCursoAgregado = (nuevoCurso) => {
        console.log('agregado', nuevoCurso)
        setCursos(prevCursos => [...prevCursos, nuevoCurso])
        setShouldFetch(true) //Activa el estado de actualización
    };

    return ( 
        <div className="cursos-container" style={{ minHeight: '100vh', position: 'relative', padding: '2rem', backgroundColor: '#f2f6fc' }}>
            { role === 'D' && (
                <>
                    <Button variant="primary" onClick={() => setShow (true)} 
                        style={{ 
                            position: 'absolute', 
                            right: '6.6rem', 
                            margin: 5,
                            background: '#1A2035'
                        }}>
                        Agregar curso
                    </Button>
                    <Curso loading={loading} show={show} handleClose={handleClose} handleCursoAgregado={handleCursoAgregado} />
                </>
            )}
            { role === 'A' && (
                <>
                    <Button variant="primary" onClick={() => setShowVincular (true) } 
                        style={{ 
                            position: 'absolute', 
                            right: '6.6rem', 
                            margin: 5,
                            background: '#1A2035'
                        }}>
                        Vincular curso
                    </Button>
                    <CursoVinculacion showVincular={showVincular} handleCloseVincular={handleCloseVincular} handleCursoAgregado={handleCursoAgregado} />
                </>
            )}
            {loading && <p>Cargando cursos...</p>}
            {error && <p>{error}</p>}
            {/* Mostrar los cursos si se han cargado correctamente */}
            {!loading && !error && (
                <Row xs={1} md={3} className="g-4" style={{padding: '5rem'}}>
                    {cursos.map((item, idx) => (
                        <Col key={idx}>
                            <Link style={{textDecoration:'none', color:'#000'}} to={`/curso/${item.id}`}>
                                <Card style={{ border: '0.1rem solid #7fa7db' }}>
                                    <Card.Img
                                        variant="top"
                                        src={item.image}
                                        style={{ height: '10rem', objectFit: 'cover',backgroundImage:'url(/generica.png)', backgroundSize: 'cover',
                                            backgroundPosition: 'center',backgroundColor: '#7fa7db'}}
                                        onLoad={() => setImageLoading(false)}
                                    />
                                    {imageLoading && (
                                        <div style={{ textAlign: 'center' }}>
                                            <ProgressBar className="progress-bar-image" mode="indeterminate" style={{ height: '6px' }}></ProgressBar>
                                        </div>
                                    )}
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
                            </Link>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
}
export default Cursos