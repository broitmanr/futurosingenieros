import React, {useEffect, useState, useRef} from "react";
import data from '../shared/data';
import { Button, Card, Col, Row } from 'react-bootstrap';
import Curso from './CursoForm';
import CursoVinculacion from './CursoVinculacion'
import axios from "axios";
import { useRole } from "../../context/RolesContext";
import { Link, useNavigate } from "react-router-dom";
import { ProgressBar } from 'primereact/progressbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { BsTrash } from "react-icons/bs";
import { CiWarning } from "react-icons/ci";
import { CiCircleCheck } from "react-icons/ci";
import { RxCrossCircled } from "react-icons/rx";
import './Cursos.css'
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
    const [visibleConfirm, setVisibleConfirm] = useState(false);
    const navigate = useNavigate()
    const toastRef = useRef(null);
    const [cursoDelete, setCursoDelete] = useState(null) //Estado para manejar el curso a eliminar
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

    const accept = async () => {
        try{
            const response = await axios.delete('/curso', { data: {cursosIDs: [cursoDelete] }, withCredentials: true })
            if(response.data){
                fetchCursos()
                toastRef.current.show({ severity: 'success', summary: 'Éxito', detail: 'Curso eliminado con éxito', life: 3000 });
            }
        } catch(err) {
            console.log('Error al eliminar el curso:', err)
        }    
        setVisibleConfirm(false)
    }

    const reject = () => {
        setVisibleConfirm(false)
    }

    const showConfirmDelete = (e, item) => {
        e.stopPropagation();
        setCursoDelete(item.id);
        setVisibleConfirm(true)
    };
    

    return ( 
        <div className="cursos-container">
            { role === 'D' && (
                <>
                    <div className="cursos-components-container">
                    <Calendar
                                className='calendar-component'
                                onMonthChange={fetchSpecialDays}
                                specialDays={dias}
                            />
                        <Button className='cursos-btns' onClick={() => setShow (true)} data-cy="boton-agregar-curso">
                            Agregar curso
                        </Button>
                        <Curso loading={loading} show={show} handleClose={handleClose} handleCursoAgregado={handleCursoAgregado} />
                    </div>
                </>
            )}
            { role === 'A' && (
                <>
                    <div className="cursos-components-container">
                        <Calendar
                            className='calendar-component'
                            onMonthChange={fetchSpecialDays}
                            specialDays={dias}
                        />
                    <Button className='cursos-btns' onClick={() => setShowVincular (true) } data-cy="unirse-curso">
                    Vincular curso
                        </Button>
                        <CursoVinculacion showVincular={showVincular} handleCloseVincular={handleCloseVincular} handleCursoAgregado={handleCursoAgregado} />
                    </div>
                </>
            )}
            {loading && <p>Cargando cursos...</p>}
            {error && <p>{error}</p>}
            {/* Mostrar los cursos si se han cargado correctamente */}
            <Toast ref={toastRef} />
            {!loading && !error && (
                <Row xs={1} md={3} className="g-4 cursos-row">
                    {cursos.map((item, idx) => (
                        <Col key={idx}>
                            <Card className="cursos-card-container" onClick={() => navigate(`/curso/${item.id}`)} data-cy={`curso-${item.id}`}>
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
                                        <Row>
                                            <Col className="col-md-10">
                                                {item.materia}
                                            </Col>
                                            { role === 'D' && (
                                            <>
                                                <Col className="col-md-2">
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex flex-wrap justify-content-center gap-2">
                                                            <BsTrash color='red' size={22} className="icon-delete-curso"
                                                            onClick={(e) => showConfirmDelete(e, item)} />
                                                        </div>
                                                        <ConfirmDialog
                                                            className="popup-confirm-delete"
                                                            visible={visibleConfirm}
                                                            onHide={reject}
                                                            message={
                                                                <div className="flex flex-column align-items-center w-full gap-3">
                                                                    <span className="popup-message">¿Está seguro que desea eliminar el curso?</span>
                                                                </div>
                                                            }
                                                            header="Confirmación"
                                                            icon={<CiWarning size={40} className="text-6xl text-primary-500" />}
                                                            footer={
                                                                <div>
                                                                    <Button onClick={reject} className="button-cancelar"><CiCircleCheck size={22} color="#1a2035" className="icons-delete-curso" /> Cancelar</Button> 
                                                                    <Button onClick={accept} className="button-eliminar"><RxCrossCircled size={22} className="icons-delete-curso" /> Eliminar</Button>
                                                                </div>
                                                            }
                                                            breakpoints={{ '1100px': '75vw', '960px': '100vw' }}
                                                        />
                                                    </div>
                                                </Col>
                                            </> )}
                                        </Row>
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
export default Cursos;