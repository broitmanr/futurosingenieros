import { Link, useNavigate, useParams } from 'react-router-dom';
import './CursoInstanciasEval.css';
import { Button, Card } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import InstanciaEval from './InstanciaEvalForm'
import axios from "axios";
import { FaRegPlusSquare } from "react-icons/fa";
import { TbEdit } from "react-icons/tb";
import { BsTrash } from "react-icons/bs";
import { RiFileDownloadLine } from "react-icons/ri";
import { PiUsersThreeBold } from "react-icons/pi";
import { RiBarChartBoxLine } from "react-icons/ri";
import { useRole } from '../../context/RolesContext';
import { ModalCrearGrupo } from './ModalCrearGrupo';
import { Badge } from 'primereact/badge';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { CiWarning } from "react-icons/ci";
import { CiCircleCheck } from "react-icons/ci";
import { RxCrossCircled } from "react-icons/rx";
import { Col } from 'react-bootstrap';

export const CursoInstanciasEval = () => {
    
    const { role } = useRole()
    const [show, setShow] = useState(false);
    const [showGrupo, setShowGrupo] = useState(false);
    const [grupo, setGrupo] = useState(false);
    const [instancias, setInstancias] = useState({});
    const [instanciasDelete, setInstanciasDelete] = useState(null) //Estado para manejar la instancia a eliminar
    const [visibleConfirmDelete, setVisibleConfirmDelete] = useState(false);
    const [curso, setCurso] = useState({});
    const [isLoading, setLoading] = useState({});
    const params = useParams();
    const toastRef = useRef(null)
    const handleClose = () => setShow(false);
    const handleCloseGrupo = () => setShowGrupo(false);
    const [shouldFetchInstancia, setShouldFetchInstancia] = useState(false); //Estados para manejar la actualización de la instancia
    const navigate = useNavigate()

    const fetchGrupoAlumno = async () => {
        try {
            const response = await axios.get(`/grupo/verGrupoAlumnoCurso/${params.id}`, { withCredentials: true });
            if (response.data) {
                console.log(response.data);
                setGrupo(response.data); // Guardar el grupo en el estado
            }
        } catch (err) {
            console.log(err);
            // Manejar errores
        }
    }

    // useEffect para hacer la petición con axios
    useEffect(() => {
        // OBTENER LOS DATOS DEL CURSO
        axios.get(`/curso/${params.id}`, { withCredentials: true }) // Ajusta la URL de la API según corresponda
            .then(response => {
                console.log(response.data);
                setCurso(response.data)
                setLoading(false); // Detiene el estado de carga
            })
            .catch(err => {
                console.log(err)
                // setError('Error al obtener los cursos');
                setLoading(false);
            });
    }, []); // El array vacío asegura que el efecto solo se ejecute una vez al montar el componente

    // OBTENER LAS ACTIVIDADES DE ESE CURSO
    const fetchCursoInstancia = async () => {
        try {
            const response = await axios.get(`/instanciaEvaluativa/curso/${params.id}`, { withCredentials: true }) // Ajusta la URL de la API según corresponda
            if(response.data){
                console.log(response.data);
                setInstancias(response.data); // Almacena los datos obtenidos en el estado
                setLoading(false); // Detiene el estado de carga
            }
        } catch (err) {
            console.log(err)
            // setError('Error al obtener los cursos');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCursoInstancia()
    }, [])

    useEffect(() => {
        if(shouldFetchInstancia){
            fetchCursoInstancia()
            setShouldFetchInstancia(false) //Resetea el estado de actualización
        }
    }, [shouldFetchInstancia])

    useEffect(() => {
       if (role === 'A'){
          fetchGrupoAlumno();
       }
    }, []);

    const handleInstanciaAgregada = (nuevaInstancia) => {
        console.log('agregada', nuevaInstancia)
        setInstancias(prevInstancia => [...prevInstancia, nuevaInstancia])
        setShouldFetchInstancia(true) //Activa el estado de actualización
    };

    const accept = async () => {
        try{
            const response = await axios.delete(`/instanciaEvaluativa/${instanciasDelete}`, { withCredentials: true })
            if(response.data){
                fetchCursoInstancia()
                toastRef.current.show({ severity: 'success', summary: 'Éxito', detail: 'Instancia eliminada con éxito', life: 3000 })
            }else if(err.response.status === 409) {
                toastRef.current.show({ severity: 'error', summary: 'Error', detail: 'No se puede eliminar una instancia con entregas pactadas', life: 3500 })
            }else{
                console.log('Error al eliminar la instancia:', err)
            }
        }finally{
            setVisibleConfirmDelete(false)
        }
    }

    const reject = () => {
        setVisibleConfirmDelete(false)
    }

    const showConfirmDelete = (e, value) => {
        e.stopPropagation();
        setInstanciasDelete(value.ID);
        setVisibleConfirmDelete(true)
    }

    return (
        <>
            <Toast ref={toastRef} />
            <section className="seccionBanner py-4">
                <div className="instancia-container">
                    <div className="row">
                        <div className="col-md-9 mx-auto contenedor-info-curso p-4">
                            {
                                isLoading
                                    ?

                                    <p className='text-danger text-center'>Cargando</p>

                                    :
                                    curso.Materium?.nombre &&
                                    <>
                                        <h2 className="nombre-materia">{curso.Materium.nombre}</h2>
                                        <p><span className="nombre-comision">{curso.Comision.nombre}</span> - <span className="anio-comision">Año {curso.cicloLectivo}</span></p>
                                        {grupo && (
                                            <Badge value={`Grupo: ${grupo.numero} - ${grupo.nombre}`} severity="info"></Badge>
                                        )}
                                    </>
                            }

                        </div>
                    </div>
                </div>
            </section>

            <main className='contenido-principal curso-instancias-eval'>
                <div className="container">
                    <div className="row py-4">
                        <div className="col-md-3">
                            <aside className='aside-menu'>
                                <nav>
                                    <ul className="aside-nav">
                                        { role === 'D' && (
                                            <>
                                            <li className='aside-item d-flex align-items-center'>
                                                <Link className='aside-link' onClick={() => setShow(true)}>
                                                    <FaRegPlusSquare className='icons-aside-menu-instancias-eval' />
                                                    Crear instancia evaluativa
                                                </Link>
                                                <InstanciaEval show={show} handleClose={handleClose} cursoID={curso.id} instancias={instancias} setInstancias={setInstancias} handleInstanciaAgregada={handleInstanciaAgregada} />
                                            </li>
                                            <li className='aside-item'  data-cy="alumnos-tab">
                                                <Link className='aside-link' to={`/alumnos/${curso.id}`} >
                                                    <PiUsersThreeBold className='icons-aside-menu-instancias-eval' />
                                                    Alumnos
                                                </Link>
                                            </li>
                                            </>
                                        )}
                                        <li className='aside-item'>
                                            <Link className='aside-link' to={`/rendimiento/${curso.id}`}>
                                                <RiBarChartBoxLine className='icons-aside-menu-instancias-eval' />
                                                Rendimiento
                                            </Link>
                                        </li>
                                        { role === 'A' && (
                                            <>  
                                            <li className='aside-item'>
                                                <Link className='aside-link' onClick={() => setShowGrupo(true)}>
                                                    <PiUsersThreeBold className='icons-aside-menu-instancias-eval' />
                                                    Grupo
                                                </Link>
                                                <ModalCrearGrupo show={showGrupo} handleClose={handleCloseGrupo} grupoExistente={grupo}/>
                                            </li>
                                            </>
                                        )}
                                        <li className='aside-item'>
                                            <Link className='aside-link' to={`/recursos/${curso.id}`}>
                                                <RiFileDownloadLine className='icons-aside-menu-instancias-eval' />
                                                Recursos
                                            </Link>
                                        </li>
                                    </ul>
                                </nav>
                            </aside>
                        </div>
                        <div className="col-md-9">
                            <h4 className="mt-3">Instancias evaluativas creadas</h4>
                            {
                                isLoading ? (
                                    <div className="text-center">Cargando...</div>
                                ) : (
                                    instancias.length > 0 ? (
                                        Object.entries(instancias).map(([key, value]) => (  
                                            <Col
                                                className="instancias-eval-boton no-underline" 
                                                key={key}
                                            >
                                                <Card className='card-instancias-evaluativas' onClick={() => navigate(`/instancia-eval/${value.ID}/entregas`)}>
                                                    <div className="col-md-12 d-flex align-items-center">
                                                        <p className="instancias-eval-nombre m-0">{value.nombre}</p>
                                                        { role === 'D' && (
                                                            <div className="ms-auto d-flex align-items-center" onClick={(e) => e.stopPropagation()}>
                                                                <div>
                                                                    <TbEdit color='#632f79' size={24} className="icon-delete-curso" />
                                                                </div>
                                                                <BsTrash color='red' size={21} className="icon-delete-curso"
                                                                onClick={(e) => showConfirmDelete(e, value)} />
                                                                <ConfirmDialog
                                                                    className="popup-confirm-delete"
                                                                    visible={visibleConfirmDelete}
                                                                    onHide={reject}
                                                                    message={
                                                                        <div className="flex flex-column align-items-center w-full gap-3">
                                                                            <span className="popup-message">¿Está seguro que desea eliminar la instancia?</span>
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
                                                        )}
                                                    </div>
                                                </Card>
                                            </Col>
                                        ))
                                    ) : (
                                        <p className='text-danger'>Este curso no posee instancias evaluativas.</p>
                                    )
                                )
                            }
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
