import { Link } from 'react-router-dom';
import './CursosActividades.css';
import { Button } from 'react-bootstrap';
import { useState } from 'react';
import Actividad from '../CursosActividades/ActividadForm'


export const CursosActividades = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
  
    return (
        <>

            <section className="seccionBanner py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 mx-auto border border-5 p-4">
                            <h2 className="nombre-materia">Diseño de sistemas</h2>
                            <p><span className="nombre-comision">S32</span> - <span className="anio-comision">Año 2024</span></p>
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
                                            <Link className='aside-link' to="#">Instancia Evaluativa</Link>
                                        </li>
                                        <li className='aside-item'>
                                            <Link className='aside-link' to="#">Alumnos</Link>
                                        </li>
                                        <li className='aside-item'>
                                            <Link className='aside-link' to="#">Calificaciones</Link>
                                        </li>
                                        <li className='aside-link d-flex align-items-center'>
                                            <i className="fa fa-bell" aria-hidden="true"></i>
                                            <Link className='aside-link' to="#">Notificaciones</Link>
                                        </li>
                                        <li className='aside-link d-flex align-items-center'>
                                            <i class="fa fa-cogs" aria-hidden="true"></i>
                                            <Link className='aside-link' to="#">Configuracion</Link>
                                        </li>
                                    </ul>
                                </nav>
                            </aside>
                        </div>

                        <div className="col-md-9">
                            <Button variant="primary" onClick={() => setShow (true)} >
                            <i class="fa fa-plus-square me-2" aria-hidden="true"></i>
                                Crear Instancia
                            </Button>
                            <h4 className="mt-3">Instancias evaluativas creadas</h4>

                            <Actividad show={show} handleClose={handleClose} />

                            <div className="actividad d-flex row border border-2 mt-4 p-2">
                                <div className="col-md-8 d-flex align-items-center">
                                <i class="fa-solid fa-tasks me-2"></i>
                                    <p className='actividad-nombre m-0'>Planificación del cronograma</p></div>
                                <div className="col-md-4 d-flex justify-content-end">
                                    <i class="fa fa-pencil me-2" aria-hidden="true"></i>
                                    <i class="fa-solid fa-trash text-danger"></i>
                                </div>
                            </div>

                            <div className="actividad d-flex row border border-2 mt-4 p-2">
                                <div className="col-md-8 d-flex align-items-center">
                                <i class="fa-solid fa-tasks me-2"></i>
                                    <p className='actividad-nombre m-0'>Planificación de costos</p></div>
                                <div className="col-md-4 d-flex justify-content-end">
                                    <i class="fa fa-pencil me-2" aria-hidden="true"></i>
                                    <i class="fa-solid fa-trash text-danger"></i>
                                </div>
                            </div>

                            <div className="actividad d-flex row border border-2 mt-4 p-2">
                                <div className="col-md-8 d-flex align-items-center">
                                <i class="fa-solid fa-tasks me-2"></i>
                                    <p className='actividad-nombre m-0'>Plan de gestion de riesgos</p></div>
                                <div className="col-md-4 d-flex justify-content-end">
                                    <i class="fa fa-pencil me-2" aria-hidden="true"></i>
                                    <i class="fa-solid fa-trash text-danger"></i>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

            </main>


        </>
    )
}
