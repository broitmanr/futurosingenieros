import { Link, useParams } from 'react-router-dom';
import './CursoInstanciasEval.css';
import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import InstanciaEval from './InstanciaEvalForm'
import axios from "axios";
import { FaRegPlusSquare } from "react-icons/fa";
import { RiFileDownloadLine } from "react-icons/ri";
import { PiUsersThreeBold } from "react-icons/pi";
import { RiBarChartBoxLine } from "react-icons/ri";
import { useRole } from '../../context/RolesContext';
import { ModalCrearGrupo } from './ModalCrearGrupo';
import { Badge } from 'primereact/badge';


export const CursoInstanciasEval = () => {
    
    const { role } = useRole()
    const [show, setShow] = useState(false);
    const [showGrupo, setShowGrupo] = useState(false);
    const [grupo, setGrupo] = useState(false);
    const [instancias, setInstancias] = useState({});

    const [curso, setCurso] = useState({});
    const [isLoading, setLoading] = useState({});
    const params = useParams();

    const handleClose = () => setShow(false);
    const handleCloseGrupo = () => setShowGrupo(false);

    const [shouldFetchInstancia, setShouldFetchInstancia] = useState(false); //Estados para manejar la actualización de la instancia

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

    return (
        <>
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
                                                <InstanciaEval show={show} handleClose={handleClose} cursoID={curso.id} setInstancias={setInstancias} handleInstanciaAgregada={handleInstanciaAgregada} />
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
                                            <Link to={`/instancia-eval/${value.ID}/entregas`}
                                                className="instancias-eval-boton no-underline" 
                                                key={key}    
                                            >
                                                <div className="col-md-12 d-flex align-items-center">
                                                    <p className="instancias-eval-nombre m-0">{value.nombre}</p>
                                                    { role === 'D' && (
                                                        <div className="ms-auto d-flex align-items-center">
                                                            <i className="fa fa-pencil me-2" aria-hidden="true"></i>
                                                            <i className="fa-solid fa-trash text-danger"></i>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
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
