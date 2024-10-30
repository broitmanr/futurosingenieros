import React, {useEffect, useState} from "react";
import data from '../shared/data';
import { Button, Card, Col, Row } from 'react-bootstrap';
import Curso from './CursoForm';
import CursoVinculacion from './CursoVinculacion'
import axios from "axios";
import { useRole } from "../../context/RolesContext";
import { Link } from "react-router-dom";
import { ProgressBar } from 'primereact/progressbar';
import './Cursos.css';
import Calendar from '../Calendar/Calendar.jsx';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";


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
    const [dias,setDias]=useState([]);
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
    const fetchSpecialDays = async (month) => {

        try {
            const response = await axios.get(`/eventos/byMonth/${month}`, { withCredentials: true });
            if (response.status === 200) {
                setDias(response.data)
                setLoading(false)
            }
        }catch (err) {
            console.error('Al listar las fechas', err);
            setLoading(false)
        }

    };
    useEffect(() => {
        // Llama a fetchSpecialDays para el mes inicial al montar el componente
        const initialMonth = new Date().getMonth() + 1;
        fetchSpecialDays(initialMonth);
    }, []);

    return ( 
        <div className="cursos-container">
            { role === 'D' && (
                <>
                    <Button className='cursos-btns' onClick={() => setShow (true)}>
                        Agregar curso
                    </Button>
                    <Curso loading={loading} show={show} handleClose={handleClose} handleCursoAgregado={handleCursoAgregado} />
                </>
            )}
            { role === 'A' && (
                <>
                    <Calendar
                        onMonthChange={fetchSpecialDays}
                        specialDays={dias}
                    />
                    <Button className='cursos-btns' onClick={() => setShowVincular (true) }>
                        Vincular curso
                    </Button>
                    <CursoVinculacion showVincular={showVincular} handleCloseVincular={handleCloseVincular} handleCursoAgregado={handleCursoAgregado} />
                </>

            )}
            {loading && <p>Cargando cursos...</p>}
            {error && <p>{error}</p>}
            {/* Mostrar los cursos si se han cargado correctamente */}
            {!loading && !error && (
                <Row xs={1} md={3} className="g-4 cursos-row">
                    {cursos.map((item, idx) => (
                        <Col key={idx}>
                            <Link className="cursos-link" to={`/curso/${item.id}`}>
                                <Card className="cursos-card-container">
                                    <Card.Img
                                        variant="top"
                                        src={item.image}
                                        className="cursos-img"
                                        onLoad={() => setImageLoading(false)}
                                    />
                                    {imageLoading && (
                                        <div className="cursos-img-progress">
                                            <ProgressBar className="cursos-img-progress-bar" mode="indeterminate"></ProgressBar>
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