import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from "moment";
import { useRole } from "../../context/RolesContext";
import { Button } from 'primereact/button';
import './DetalleEntrega.css';
import UploadWindow from "./UploadWindow";

export const DetalleEntrega = () => {
    const { role } = useRole();
    const [entregaDetalle, setEntregaDetalle] = useState({});
    const [entregaAsociada, setEntregaAsociada] = useState(null); // Estado para una única entrega
    const params = useParams();
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntregaDetalle = async () => {
            try {
                const response = await axios.get(`/entregaPactada/${params.id}`, { withCredentials: true });
                setEntregaDetalle(response.data);
                
                // Verificar si ya hay una entrega asociada
                const entregaResponse = await axios.get(`/entrega/miEntregaAlumno/${params.id}`, { withCredentials: true });
                if (entregaResponse.data.success && entregaResponse.data.entrega) {
                    setEntregaAsociada(entregaResponse.data.entrega); // Actualizar con la única entrega
                } else {
                    setEntregaAsociada(null);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error al obtener los detalles:', err);
                setLoading(false);
            }
        };
        fetchEntregaDetalle();
    }, [params.id]);

    const handleUploadSuccess = () => {
        setLoading(true);
        axios.get(`/entrega/miEntregaAlumno/${params.id}`, { withCredentials: true })
            .then(response => {
                if (response.data.success && response.data.entrega) {
                    setEntregaAsociada(response.data.entrega);
                } else {
                    setEntregaAsociada(null);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error al actualizar la entrega:', err);
                setLoading(false);
            });
    };

    return (
        <div className="entrega-detalle-container">
            {role === 'A' &&
                <div className="container d-flex justify-content-center">
                    <div className="container-box-entrega-detalle flex-column">
                        <div className="col-md-6 mx-auto border-2 box-entrega-detalle mb-3">
                            {isLoading ? (
                                <p className='text-danger text-center'>Cargando...</p>
                            ) : (
                                <>
                                    {!entregaAsociada && (
                                        <>
                                        <h3 style={{ marginBottom: '1rem', color: '#1a2035' }}>{entregaDetalle.nombre}</h3>
                                        <p className='descripcion-entrega-detalle'>{entregaDetalle.descripcion}</p>
                                        <p className="fechas-entrega-detalle">
                                            <span className="fechas-entrega">Fecha de vencimiento 1:</span> {moment(entregaDetalle.fechavto1).format('DD/MM/YY')}
                                        </p>
                                        {entregaDetalle.fechavto2 && <p className="fechas-entrega-detalle">
                                             <span className="fechas-entrega">Fecha de vencimiento 2:</span> {moment(entregaDetalle.fechavto2).format('DD/MM/YY')}
                                        </p>}
                                        </>
                                    )}
                                    {entregaAsociada ? (
                                        // Mostrar detalles de la entrega si ya se hizo
                                        <div className='dialog-agregar-entrega-detalle'>
                                            <h3 style={{ marginBottom: '2rem' }}>Ya has realizado una entrega de: {entregaDetalle.nombre}</h3>
                                            <p className='descripcion-entrega-detalle'>{entregaDetalle.descripcion}</p>
                                            <p className="fechas-entrega-detalle">
                                                <span className="fechas-entrega">Fecha de vencimiento 1:</span> {moment(entregaDetalle.fechavto1).format('DD/MM/YY')}
                                            </p>
                                            {entregaDetalle.fechavto2 && <p className="fechas-entrega-detalle">
                                                <span className="fechas-entrega">Fecha de vencimiento 2:</span> {moment(entregaDetalle.fechavto2).format('DD/MM/YY')}
                                            </p>}
                                            <div>
                                                <p className="m-0">Ultima fecha de entrega: {moment(entregaAsociada.fecha).format('DD/MM/YY')}</p>
                                                <p>Estado: <span className="fw-bold">Entregado</span></p>
                                                <div style={{ marginTop: '2rem' }}>
                                                    <Button icon="pi pi-plus" className="p-button-secondary" style={{ borderRadius: '0.4rem' }} label="Agregar versión" 
                                                        onClick={() => setEntregaAsociada(null)} />
                                                    <Button label="Ver Comentarios"  style={{marginLeft: '1rem', backgroundColor: '#1a2035', borderRadius: '0.4rem'}} onClick={() => navigate(`/archivo/${entregaAsociada.ID}`)} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Si no hay entrega, mostrar componente de subida
                                        <UploadWindow entregaPactadaId={entregaDetalle.ID} onUploadSuccess={handleUploadSuccess} />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};