import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from "moment";
import { useRole } from "../../context/RolesContext";
import { Button } from 'primereact/button';
import './DetalleEntrega.css';
import UploadWindow from "./UploadWindow";
import ParticipationSection from "./PorcentajeParticipacion";

export const DetalleEntrega = () => {
    const { role } = useRole();
    const [entregaDetalle, setEntregaDetalle] = useState({});
    const [entregaAsociada, setEntregaAsociada] = useState(null); // Estado para una única entrega
    const [porcentajes, setPorcentajes] = useState({});
    const [totalPorcentaje, setTotalPorcentaje] = useState(0);
    const [participantes, setParticipantes] = useState([]);
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

                    // Obtener los porcentajes de participación
                    const porcentajesResponse = await axios.get(`/entrega/${entregaResponse.data.entrega.ID}/porcentaje-participacion`, { withCredentials: true });
                    console.log('Porcentajes de participación recuperados desde el endpoint /:entregaId/porcentaje-participacion:', porcentajesResponse.data);
                    setParticipantes(porcentajesResponse.data);
                    const initialPorcentajes = {};
                    porcentajesResponse.data.forEach(participacion => {
                        initialPorcentajes[participacion.personaId] = parseFloat(participacion.porcentaje);
                    });
                    setPorcentajes(initialPorcentajes);
                    const total = Object.values(initialPorcentajes).reduce((acc, val) => acc + parseFloat(val || 0), 0);
                    setTotalPorcentaje(total);
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

                    // Obtener los porcentajes de participación
                    axios.get(`/entrega/${response.data.entrega.ID}/porcentaje-participacion`, { withCredentials: true })
                        .then(porcentajesResponse => {
                            setParticipantes(porcentajesResponse.data);
                            const initialPorcentajes = {};
                            porcentajesResponse.data.forEach(participacion => {
                                initialPorcentajes[participacion.personaId] = parseFloat(participacion.porcentaje);
                            });
                            setPorcentajes(initialPorcentajes);
                            const total = Object.values(initialPorcentajes).reduce((acc, val) => acc + parseFloat(val || 0), 0);
                            setTotalPorcentaje(total);
                        })
                        .catch(err => {
                            console.error('Error al obtener los porcentajes de participación:', err);
                        });
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

    const handlePorcentajeChange = (personaId, value) => {
        const newPorcentajes = { ...porcentajes, [personaId]: parseFloat(value) };
        setPorcentajes(newPorcentajes);
        const total = Object.values(newPorcentajes).reduce((acc, val) => acc + parseFloat(val || 0), 0);
        setTotalPorcentaje(total);
    };

    const handleSubmit = async () => {
        try {
            const porcentajesNumericos = {};
            for (const [personaId, porcentaje] of Object.entries(porcentajes)) {
                porcentajesNumericos[personaId] = parseFloat(porcentaje);
            }
            console.log('Enviando porcentajes de participación:', porcentajesNumericos);
            await axios.patch(`/entrega/actualizar/${entregaAsociada.ID}/porcentaje-participacion`, { porcentajes: porcentajesNumericos }, { withCredentials: true });
        } catch (err) {
            console.error('Error al actualizar los porcentajes de participación:', err);
        }
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
                                        <h3 className="descripcion-entrega-nombre">{entregaDetalle.nombre}</h3>
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
                                            <h3 className="entrega-asociada-nombre">Ya has realizado una entrega de: {entregaDetalle.nombre}</h3>
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
                                                <div className="button-group">
                                                    <Button label="Ver Comentarios" className="btn-ver-comentarios" onClick={() => navigate(`/archivo/${entregaAsociada.ID}`)} />
                                                    <Button icon="pi pi-plus" className="btn-subir-version" label="Subir otra entrega" 
                                                        onClick={() => setEntregaAsociada(null)} />
                                                </div>
                                                {entregaDetalle.InstanciaEvaluativa.grupo && (
                                                <ParticipationSection
                                                    participantes={participantes}
                                                    porcentajes={porcentajes}
                                                    handlePorcentajeChange={handlePorcentajeChange}
                                                    totalPorcentaje={totalPorcentaje}
                                                    handleSubmit={handleSubmit}
                                                />
                                            )}
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