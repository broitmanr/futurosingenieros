import { Link, useParams } from 'react-router-dom';
import './CursosActividades.css';
import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import Actividad from '../CursosActividades/ActividadForm'
import axios from "axios";


export const CursosActividades = () => {
    const [show, setShow] = useState(false);
    const [instancias, setInstancias] = useState({});

    const [curso, setCurso] = useState({});
    const [isLoading, setLoading] = useState({});
    const params = useParams();

    const handleClose = () => setShow(false);

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

            // OBTENER LAS ACTIVIDADES DE ESE CURSO
        axios.get(`http://localhost:5000/api/instanciaEvaluativa/${params.id}`, { withCredentials: true }) // Ajusta la URL de la API según corresponda
            .then(response => {
                console.log(response.data);
                setInstancias(response.data); // Almacena los datos obtenidos en el estado
                setLoading(false); // Detiene el estado de carga
                
            })
            .catch(err => {
                console.log(err)
                // setError('Error al obtener los cursos');
                setLoading(false);
            });
    }, []); // El array vacío asegura que el efecto solo se ejecute una vez al montar el componente


    return (
        <>


            <section className="seccionBanner py-5">
                <div className="container">
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
                                        <li className='aside-item'>
                                            <Link className='aside-link' to="#">Recursos</Link>
                                        </li>
                                        <li className='aside-item'>
                                            <Link className='aside-link' to="/alumnos/:id">Alumnos</Link>
                                        </li>
                                        <li className='aside-item'>
                                            <Link className='aside-link' to="#">Calificaciones</Link>
                                        </li>
                                        <li className='aside-item d-flex align-items-center'>
                                            <Link className='aside-link' to="#">
                                            <i className="fa fa-bell" aria-hidden="true"></i>
                                            Notificaciones
                                            </Link>
                                        </li>
                                        <li className='aside-item d-flex align-items-center'>
                                            <Link className='aside-link' to="#">
                                            <i className="fa fa-cogs" aria-hidden="true"></i>
                                            Configuracion
                                            </Link>
                                        </li>
                                    </ul>
                                </nav>
                            </aside>
                        </div>
                        <div className="col-md-9">
    <Button variant="primary" onClick={() => setShow(true)}>
        <i className="fa fa-plus-square me-2" aria-hidden="true"></i>
        Crear Instancia
    </Button>
    <h4 className="mt-3">Instancias evaluativas creadas</h4>

    <Actividad show={show} handleClose={handleClose} cursoID={curso.ID} setInstancias={setInstancias} />

    {
        isLoading ? (
            <div className="text-center">Cargando...</div>
        ) : (
            

            instancias.length > 0 ? (

              
                Object.entries(instancias).map(([key, value]) => (
                    
                    <Link to={`/actividad/${value.ID}/entregas`}
                        className="actividad-boton" 
                        key={key}
                        
                    >
                        <div className="col-md-12 d-flex align-items-center">
                            <p className="actividad-nombre m-0">{value.nombre}</p>
                            <div className="ms-auto d-flex align-items-center">
                                <i className="fa fa-pencil me-2" aria-hidden="true"></i>
                                <i className="fa-solid fa-trash text-danger"></i>
                            </div>
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
