import { useEffect, useState } from 'react';
import '../styles/ActividadEntrega.css';
import { Button } from 'react-bootstrap';
import { EntregaForm } from './EntregaForm';
import { Link, useParams } from 'react-router-dom';
import { useRole } from '../../context/RolesContext';
import axios from 'axios';

export const ActividadEntregas = () => {
    const { role } = useRole()
    const [show, setShow] = useState(false);
    const [idActividad, setIdActividad] = useState(null)
    const [instancia, setInstancia] = useState({})
    const [tipoInstancias, setTipoInstancias] = useState([])
    const params = useParams();
    const handleClose = () => setShow(false);
    const [isLoading, setLoading] = useState(true);

    useEffect(()=> {
        const idActividad = params.id;
        console.log(idActividad)
        setIdActividad(idActividad)
    },[params.id])
/*
    useEffect(() => {
        const fetchInstancia = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/instanciaEvaluativa/${idActividad}`, { withCredentials: true }) 
                console.log(response.data)
                if(response.data){
                    console.log(response.data);
                    setInstancia(response.data)
                }   
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }

        const fetchTipoInstancia = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/instanciaEvaluativa/tiposInstancias`, { withCredentials: true }) 
                if(response.data){
                    console.log(response.data);
                    setTipoInstancias(response.data)
                }   
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }

        if(idActividad){
            setLoading(true)
            fetchInstancia()
            fetchTipoInstancia()
        }

    }, [idActividad]);

    const tipoInstancia = tipoInstancias.find(tipo => tipo.id === instancia.tipoInstanciaID)
    console.log(tipoInstancia)
*/
    return (
        <>
            <section className="seccionBanner py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 mx-auto recuadro-estilizado">
                            {/*{ isLoading ? (
                                <p className='text-danger text-center'>Cargando</p>
                                ) : (
                                    instancia.nombre && (
                                    <>
                                        <h2 className="nombre-instancia">{instancia.nombre}</h2>
                                        <div className="texto-informativo d-flex justify-content-between">
                                            <span>Porc. Ponderación: {instancia.porcentaje_ponderacion}</span>
                                            {tipoInstancia && <span>{instancia.tipoInstancia.nombre}</span> }
                                            <span>{instancia.descripcion}</span>
                                        </div>
                                    </>
                                    )
                            )}*/}
                             
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
