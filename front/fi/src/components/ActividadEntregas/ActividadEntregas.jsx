import { useEffect, useState } from 'react';
import '../styles/ActividadEntrega.css';
import { Button } from 'react-bootstrap';
import { EntregaForm } from './EntregaForm';
import { Link, useParams } from 'react-router-dom';
import { useRole } from '../../context/RolesContext';

export const ActividadEntregas = () => {
    const { role } = useRole()
    const [show, setShow] = useState(false);
    const [idActividad, setIdActividad] = useState(null)
   
    const params = useParams();
    const handleClose = () => setShow(false);

    useEffect(()=> {
        const idActividad = params.id;
        setIdActividad(idActividad)
    },[])

    return (
        <>
            <section className="seccionBanner py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 mx-auto recuadro-estilizado">
                            <h2 className="nombre-materia">Trabajo Integrador Grupal</h2>
                            <div className="texto-informativo d-flex justify-content-between">
                                <span>Porc. Ponderación: 75%</span>
                                <span>Trabajo integrador</span>
                                <span>Instancia de prueba</span>
                            </div>

                        </div>
                    </div>
                </div>


            </section>

            <section className="seccion-entregas py-4">
                <div className="container">
                    <div className="entrega-subtitulo d-flex justify-content-between">
                        <h2>Entregas</h2>
                        { role === 'D' && (
                            <Button className="crear-entrega" onClick={() => setShow(true)}>
                                <i className="fa fa-plus-square me-2" aria-hidden="true"></i>
                                Crear Entrega
                            </Button>
                        )}
                    </div>
                    
                    {
                        idActividad ? <EntregaForm show={show} handleClose={handleClose} idActividad={idActividad}/> : null
                    }
                    

                    <div className="row">
                        <div className="col-12 entrega estilo-entrega">
                            <h4 className="entrega-titulo">Plan de gestión del cronograma</h4>
                            <Link className='estilo-detalle' to="/entrega/:id">Ver detalle</Link>
                            <span className="entrega-estado">Aprobada</span>
                            <p className="entrega-fecha">Fecha de entrega: <span>10/08</span></p>
                            <p className="entrega-vencimiento">Fecha de vencimiento: <span>17/08</span></p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 entrega estilo-entrega">
                            <h4 className="entrega-titulo">Planificación del alcance</h4>
                            <Link className='estilo-detalle' to="/entrega/:id">Ver detalle</Link>
                            <span className="entrega-estado">Aprobada</span>
                            <p className="entrega-fecha">Fecha de entrega: <span>10/08</span></p>
                            <p className="entrega-vencimiento">Fecha de vencimiento: <span>17/08</span></p>
                        </div>
                    </div>

                </div>
            </section>

        </>
    )
}
