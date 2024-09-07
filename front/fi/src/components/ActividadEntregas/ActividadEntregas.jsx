
import { useState } from 'react';
import '../styles/ActividadEntrega.css';
import { Button } from 'react-bootstrap';
import { EntregaForm } from './EntregaForm';

export const ActividadEntregas = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    return (
        <>
            <section className="seccionBanner py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 mx-auto border border-5 p-4">

                            <h2 className="nombre-materia">Planificación del cronograma</h2>
                            <div className="d-flex justify-content-between">
                                <span>Porc. Ponderación: 50%</span>
                                <span>Trabajo integrador</span>
                                <span>Instancia de prueba</span>
                            </div>

                        </div>
                    </div>
                </div>


            </section>

            <section className="seccion-entregas py-4">
                <div className="container">
                    <div className="d-flex justify-content-between">
                        <h2>Entregas</h2>
                        <Button variant="primary" onClick={() => setShow(true)}>
                            <i className="fa fa-plus-square me-2" aria-hidden="true"></i>
                            Crear Entrega
                        </Button>
                    </div>
                    
                    <EntregaForm show={show} handleClose={handleClose}/>

                    <div className="row">
                        <div className="col-12 entrega">
                            <h4 className="entrega-titulo">Planificación del cronograma</h4>
                            <span className="entrega-estado">Aprobada</span>
                            <p className="entrega-fecha">Fecha de entrega: <span>10/08</span></p>
                            <p className="entrega-vencimiento">Fecha de vencimiento: <span>17/08</span></p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 entrega">
                            <h4 className="entrega-titulo">Planificación del cronograma</h4>
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
