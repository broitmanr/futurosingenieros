import { Link, useParams } from 'react-router-dom';
import './CursosActividades.css';
import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import Actividad from '../CursosActividades/ActividadForm'
import axios from "axios";
import { FaRegPlusSquare } from "react-icons/fa";
import { RiFileDownloadLine } from "react-icons/ri";
import { PiUsersThreeBold } from "react-icons/pi";
import { RiBarChartBoxLine } from "react-icons/ri";
import { useRole } from '../../context/RolesContext';


export const CursosActividades = () => {
    const { role } = useRole()
    const [show, setShow] = useState(false);
    const [instancias, setInstancias] = useState({});

    const [curso, setCurso] = useState({});
    const [isLoading, setLoading] = useState({});
    const params = useParams();

    const handleClose = () => setShow(false);

    const [shouldFetchInstancia, setShouldFetchInstancia] = useState(false); //Estados para manejar la actualización de la instancia

    const mostrarInfoActividad = (actividad) => {
        console.log("Información de la actividad:", actividad);
        // Logica para mostrar la informacion de la actividad
      };

    // useEffect para hacer la petición con axios
    useEffect(() => {
        // OBTENER LOS DATOS DEL CURSO
        axios.get(`http://localhost:5000/api/curso/${params.id}`, { withCredentials: true }) // Ajusta la URL de la API según corresponda
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
            const response = await axios.get(`http://localhost:5000/api/instanciaEvaluativa/curso/${params.id}`, { withCredentials: true }) // Ajusta la URL de la API según corresponda
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

    const handleInstanciaAgregada = (nuevaInstancia) => {
        console.log('agregada', nuevaInstancia)
        setInstancias(prevInstancia => [...prevInstancia, nuevaInstancia])
        setShouldFetchInstancia(true) //Activa el estado de actualización
    };

    return (
        <>
            <section className="seccionBanner py-5">
                <div className="instancia-container">
                    <div className="row">
                        <div className="col-md-6 mx-auto contenedor-info-curso p-4">
                            {
                                isLoading
                                    ?

                                    <p className='text-danger text-center'>Cargando</p>

                                    :
                                    curso.Materium?.nombre &&
                                    <>
                                        <h2 className="nombre-materia">{curso.Materium.nombre}</h2>
                                        <p><span className="nombre-comision">{curso.Comision.nombre}</span> - <span className="anio-comision">Año {curso.cicloLectivo}</span></p>
                                    </>
                            }

                        </div>
                    </div>
                </div>
            </section>

            <main className='contenido-principal'>
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
                                                    <FaRegPlusSquare className='icons-aside-menu-actividades' />
                                                    Crear instancia
                                                </Link>
                                                <Actividad show={show} handleClose={handleClose} cursoID={curso.ID} setInstancias={setInstancias} handleInstanciaAgregada={handleInstanciaAgregada} />
                                            </li>
                                            <li className='aside-item'>
                                                <Link className='aside-link' to={`/alumnos/${curso.ID}`}>
                                                    <PiUsersThreeBold className='icons-aside-menu-actividades' />
                                                    Alumnos
                                                </Link>
                                            </li>
                                            </>
                                        )}
                                        <li className='aside-item'>
                                            <Link className='aside-link' to="#">
                                                <RiBarChartBoxLine className='icons-aside-menu-actividades' />
                                                Rendimiento
                                            </Link>
                                        </li>
                                        { role === 'A' && (
                                            <>  
                                            <li className='aside-item'>
                                                <Link className='aside-link' to={`/alumnos/${curso.ID}`}>
                                                    <PiUsersThreeBold className='icons-aside-menu-actividades' />
                                                    Grupo
                                                </Link>
                                            </li>
                                            </>
                                        )}
                                        <li className='aside-item'>
                                            <Link className='aside-link' to="#">
                                                <RiFileDownloadLine className='icons-aside-menu-actividades' />
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
                                            <Link to={`/actividad/${value.ID}/entregas`}
                                                className="actividad-boton no-underline" 
                                                key={key}    
                                            >
                                                <div className="col-md-12 d-flex align-items-center">
                                                    <p className="actividad-nombre m-0">{value.nombre}</p>
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
