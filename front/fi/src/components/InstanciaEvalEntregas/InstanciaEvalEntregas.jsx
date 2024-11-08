import React, { useEffect, useRef, useState } from 'react';
import './InstanciaEvalEntregas.css';
import {Button, Card, Col, Row,Badge} from 'react-bootstrap';
import { EntregaForm } from './EntregaForm';
import { Link, useParams } from 'react-router-dom';
import { useRole } from '../../context/RolesContext';
import { PanelMenu } from 'primereact/panelmenu';
import DetalleEntregaDocente from '../DetalleEntrega/DetalleEntregaDocente'
import moment from 'moment'
import axios from 'axios'
import { BsTrash } from "react-icons/bs";
import { CiWarning } from "react-icons/ci";
import { CiCircleCheck } from "react-icons/ci";
import { RxCrossCircled } from "react-icons/rx";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

export const InstanciaEvalEntregas = () => {
    const { role } = useRole()
    const [show, setShow] = useState(false);
    const [idInstanciaEval, setIdInstanciaEval] = useState(null)
    const [instancia, setInstancia] = useState({})
    const [entregas, setEntregas] = useState([]);
    const [shouldFetchEntregas, setShouldFetchEntregas] = useState(false); //Estados para manejar la actualización de la instancia
    const [selectedEntrega, setSelectedEntrega] = useState(null)
    const [visibleConfirmDelete, setVisibleConfirmDelete] = useState(false)
    const [entregaDelete, setEntregaDelete] = useState(null)
    const toastR = useRef(null)
    const params = useParams();
    const handleClose = () => setShow(false);
    const [isLoading, setLoading] = useState(true);
    const badges = ['dark', 'success', 'info', 'danger', 'warning', 'light']

    useEffect(()=> {
        const idInstanciaEval = params.id;
        setIdInstanciaEval(idInstanciaEval)
    },[params.id])

    useEffect(() => {
        const fetchInstancia = async () => {
            try {
                const response = await axios.get(`/instanciaEvaluativa/${idInstanciaEval}`, { withCredentials: true })
                console.log(response.data)
                if(response.data){
                    setInstancia(response.data)
                }
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }


        if(idInstanciaEval){
            setLoading(true)
            fetchInstancia()
        }

    }, [idInstanciaEval]);

    const fetchEntregaInstancia = async () => {
        try {
            const response = await axios.get(`/entregaPactada/instancia/${params.id}`, { withCredentials: true })
            if(response.data){
                console.log(response.data)
                setEntregas(response.data);
                setLoading(false);
            }
        } catch (err) {
            console.log(err)
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEntregaInstancia()
    }, [params.id])

    useEffect(() => {
        if(shouldFetchEntregas){
            fetchEntregaInstancia()
            setShouldFetchEntregas(false) //Resetea el estado de actualización
        }
    }, [shouldFetchEntregas])

    const panelItems = entregas.map(entrega => ({
        label: entrega.nombre,
        id: entrega.ID,
        command: () => setSelectedEntrega(entrega),
        template: (entrega, options) => {
            return (
                <div className='p-d-flex p-jc-between p-ai-center'>
                    <span className='entrega-label-cd'>{entrega.label}</span>
                    <BsTrash color='red' size={22} className="icon-delete-entrega"
                    onClick={(e) => showConfirmDeleteEntrega(e, entrega)} />
                </div>
            )
        }
    }))

    const handleEntregaAgregada = (nuevaEntrega) => {
        console.log('agregada', nuevaEntrega)
        setEntregas(prevEntrega => [...prevEntrega, nuevaEntrega])
        setShouldFetchEntregas(true) //Activa el estado de actualización
    }

    const accept = async () => {
        try{
            const response = axios.delete(`/entregaPactada/${entregaDelete}`, {withCredentials: true})
            if(response.status === 204){
                fetchEntregaInstancia()
                toastR.current.show({ severity: 'success', summary: 'Éxito', detail: 'Entrega pactada eliminada con éxito', life: 3000 });
            }
        } catch (err) {
            console.log('No se ha logrado eliminar la entrega pactada', err)
        }
        setVisibleConfirmDelete(false)
    }

    const reject = () => {
        setVisibleConfirmDelete(false)
    }

    const showConfirmDeleteEntrega = (e, entrega) => {
        e.stopPropagation()
        setEntregaDelete(entrega.id);
        setVisibleConfirmDelete(true)
    }

    return (
        <div className='actividad-entregas-container'>
        <>
            <section className="seccionBanner py-4 banner-instancias">
                <div className="container">
                    <div className="row">
                        <div className="col-md-9 mx-auto recuadro-estilizado p-4">
                            { isLoading ?
                                <p className='text-danger text-center'>Cargando</p>
                                :
                                    instancia.nombre &&
                                    <>
                                        <h2 className="nombre-instancia">{instancia.nombre}</h2>
                                        <div className="texto-informativo-instancia d-grid justify-content-center">
                                            <span>Porc. Ponderación: {instancia.porcentaje_ponderacion}</span>
                                            <span>{instancia.TipoInstancium.nombre}</span>
                                            <span>{instancia.descripcion}</span>
                                            <span>{instancia.grupo ? 'Grupal' : 'Individual'}</span>
                                        </div>
                                    </>
                            }
                        </div>
                    </div>
                </div>
            </section>
            <Toast ref={toastR} />
            <section className="seccion-entregas py-4">
                <div className="container">
                    { role === 'D' && ( 
                    <>
                    <div className="entrega-subtitulo d-flex justify-content-between">
                        <h2>Entregas</h2>
                        <Button className="crear-entrega" onClick={() => setShow(true)}>
                            <i className="fa fa-plus-square me-2" aria-hidden="true"></i>
                            Crear Entrega
                        </Button>
                    </div>
                    {
                        idInstanciaEval ? <EntregaForm show={show} handleClose={handleClose} idInstanciaEval={idInstanciaEval} entregas={entregas} handleEntregaAgregada={handleEntregaAgregada} /> : null
                    }
                    <div className='p-grid'>
                        <div className='p-col-3'>
                            {entregas.length > 0 ? (
                                <>
                                <div onClick={(e) => e.stopPropagation()}>
                                <PanelMenu className="md:w-18rem float-start panel-individual-entregas" model={panelItems} />
                                <ConfirmDialog
                                    className="popup-confirm-delete"
                                    visible={visibleConfirmDelete}
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
                                </>
                            ):(
                                <div className="no-entregas" >
                                <img 
                                    src="/NoEncontrado.png" 
                                    alt="No entregas" 
                                    className='img-no-entregas'
                                />
                                <p className='text-danger'>Esta instancia evaluativa no posee entregas disponibles</p>
                                </div>   
                            )}
                            
                        </div>
                        {selectedEntrega && <DetalleEntregaDocente entrega={selectedEntrega} />}
                    </div>
                    </>
                    )}
                    {role === 'A' &&
                    <>
                    {isLoading && <p>Cargando entregas...</p>}
                    {!isLoading && (
                        entregas.length > 0 ? (
                            entregas.map((item, idx) => (
                                <Row key={idx} className="entrega-card-alumno">
                                    <Col className={'col-12 entrega estilo-entrega'}>
                                    <Row>
                                        <h4 className="entrega-titulo">{item.nombre} <span>{item.numero}</span></h4>
                                        <div className="entrega-fechas">
                                            <p className="entrega-vencimiento">1° vencimiento: <span>{moment(item.fechavto1).format('DD/MM/YY')}</span></p>
                                            { item.fechavto2 &&
                                                <p className="entrega-vencimiento">2° vencimiento: <span>{moment(item.fechavto2).format('DD/MM/YY')}</span></p>
                                            }
                                        </div>
                                    </Row>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <Link className='estilo-detalle' to={`/entrega/${item.ID}`}>Ver detalle</Link>
                                            {/*TODO:Poner el estado real, todavia no lo tenemos, habria que joinear con entrega*/}
                                            <div className='nota-estado-entrega-alumno'>
                                                <Badge gap={2} bg={badges[item.estado.id]} className={badges[item.estado.id] === 'light' ? 'badge-light' : 'badge-default'}>{item.nota ? "Nota: "+ item.nota : null } - {item.estado.descripcion }</Badge>
                                                <Badge bg="info" style={{ marginTop: '1rem' }}>{item.fechaEntrega ? `Entregado el: ${moment(item.fechaEntrega).format('DD/MM/YY')}`: ''}</Badge>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            ))
                        ):(
                            <div className="no-entregas" >
                                <img 
                                    src="/NoEncontrado.png" 
                                    alt="No entregas" 
                                    className='img-no-entregas'
                                />
                                <p className='text-danger'>Esta instancia evaluativa no posee entregas disponibles</p>
                            </div>
                        )
                    )}
                    </>
                    }
                </div>
            </section>
        </>
        </div>
    )
}
