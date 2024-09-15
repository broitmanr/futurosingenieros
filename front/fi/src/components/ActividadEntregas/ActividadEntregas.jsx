import React, { useEffect, useState } from 'react';
import '../styles/ActividadEntrega.css';
import {Button, Card, Col, Row} from 'react-bootstrap';
import { EntregaForm } from './EntregaForm';
import { Link, useParams } from 'react-router-dom';
import { useRole } from '../../context/RolesContext';
import moment from 'moment'
import axios from 'axios';

export const ActividadEntregas = () => {
    const { role } = useRole()
    const [show, setShow] = useState(false);
    const [idActividad, setIdActividad] = useState(null)
    const [instancia, setInstancia] = useState({})
    const [entregas, setEntregas] = useState({});
    const [shouldFetchEntregas, setShouldFetchEntregas] = useState(false); //Estados para manejar la actualización de la instancia


    const params = useParams();
    const handleClose = () => setShow(false);
    const [isLoading, setLoading] = useState(true);

    useEffect(()=> {
        const idActividad = params.id;
        console.log(idActividad)
        setIdActividad(idActividad)
    },[params.id])

    useEffect(() => {
        const fetchInstancia = async () => {
            try {
                const response = await axios.get(`/instanciaEvaluativa/${idActividad}`, { withCredentials: true })
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


        if(idActividad){
            setLoading(true)
            fetchInstancia()
        }

    }, [idActividad]);

    // OBTENER LAS ACTIVIDADES DE ESE CURSO
    const fetchEntregaInstancia = async () => {
        try {
            const response = await axios.get(`/entregaPactada/instancia/${params.id}`, { withCredentials: true }) // Ajusta la URL de la API según corresponda
            if(response.data){
                console.log(response.data);
                setEntregas(response.data); // Almacena los datos obtenidos en el estado
                setLoading(false); // Detiene el estado de carga
            }
        } catch (err) {
            console.log(err)
            // setError('Error al obtener los cursos');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEntregaInstancia()
    }, [])

    useEffect(() => {
        if(shouldFetchEntregas){
            fetchEntregaInstancia()
            setShouldFetchEntregas(false) //Resetea el estado de actualización
        }
    }, [shouldFetchEntregas])

    const handleEntregaAgregada = (nuevaEntrega) => {
        console.log('agregada', nuevaEntrega)
        setEntregas(prevEntrega => [...prevEntrega, nuevaEntrega])
        setShouldFetchEntregas(true) //Activa el estado de actualización
    };
    return (
        <>
            <section className="seccionBanner py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 mx-auto recuadro-estilizado">
                            { isLoading ?
                                <p className='text-danger text-center'>Cargando</p>
                                :
                                    instancia.nombre &&
                                    <>
                                        <h2 className="nombre-instancia">{instancia.nombre}</h2>
                                        <div className="texto-informativo d-grid justify-content-center">
                                            <span>Porc. Ponderación: {instancia.porcentaje_ponderacion}</span>
                                            <span>{instancia.TipoInstancium.nombre}</span>
                                            <span>{instancia.descripcion}</span>
                                        </div>
                                    </>


                            }
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

                    {isLoading && <p>Cargando cursos...</p>}
                    {!isLoading && (
                            entregas.map((item, idx) => (
                                <Row key={idx}>
                                    <Col className={'col-12 entrega estilo-entrega'}>
                                        <h4 className="entrega-titulo">{item.nombre}</h4>
                                        <Link className='estilo-detalle' to={`/entrega/${item.ID}`}>Ver detalle</Link>
                                        {/*TODO:Poner el estado real, todavia no lo tenemos, habria que joinear con entrega*/}
                                        <span className="entrega-estado">Aprobada</span>
                                        <p className="entrega-fecha">Fecha de entrega: <span>10/08</span></p>
                                        <p className="entrega-vencimiento">1° vencimiento: <span>{moment(item.fechavto1).format('d/m/Y')}</span></p>
                                        <p className="entrega-vencimiento">2° vencimiento: <span>{moment(item.fechavto2).format('d/m/Y')}</span></p>
                                    </Col>
                                </Row>
                            ))

                    )}


                </div>
            </section>

        </>
    )
}
