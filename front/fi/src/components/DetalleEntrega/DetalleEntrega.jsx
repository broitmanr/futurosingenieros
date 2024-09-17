import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom';
import axios from 'axios';
import moment from "moment";
import { useRole } from "../../context/RolesContext";
import { Dialog } from 'primereact/dialog';

export const DetalleEntrega = () => {
    const { role } = useRole()
    const [entregaDetalle, setEntregaDetalle] = useState([])
    const params = useParams();
    const [isLoading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false); //Manejo del Dialog

    useEffect(() => {
        const fetchEntregaDetalle = async () => {
            try{
                const response = await axios.get(`/entregaPactada/${params.id}`, { withCredentials: true })
                console.log('actividad creada', response.data);
                setEntregaDetalle(response.data)
                setLoading(false);    
            } catch (err) {
                console.log(err.response.data.error)
                alert('Error: ' + err.response.data.error.message)
                // setError('Error al crear la actividad');
                setLoading(false); 
            }
        }
        fetchEntregaDetalle()
    }, [params.id])

    const handleEntregar = () => {
        setVisible(true)
    }

    return (
        <div className="entrega-detalle-container" style={{ backgroundColor: '#f2f6fc', minHeight: '70vh', display:'flex', justifyContent: 'center', alignItems: 'center' }}>
            <>
                <div className="container d-flex justify-content-center">
                    <div className="row" style={{ width: '100%', height: '25rem', marginTop: '1rem', marginBottom: '1rem' }}>
                        <div className="col-md-6 mx-auto border- border-2 p-4 d-flex flex-column justify-content-between align-items-center" style={{ border: 'solid #1a2035', borderRadius: '0.6rem' }}>
                            { isLoading ? (
                                <p className='text-danger text-center'>Cargando</p>
                            ) : (
                                    entregaDetalle.nombre && (
                                    <>
                                        <div>
                                            <h2 className="nombre-materia text-center" style={{ color: '#344474' }}>{entregaDetalle.nombre} <span>{entregaDetalle.numero}</span></h2>
                                            <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>{entregaDetalle.descripcion}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '1.09rem', textJustify: 'end' }}>
                                                <span style={{ fontWeight: 'bold', color: '#344474' }}>Fecha de vencimiento:</span> {moment(entregaDetalle.fechavto1).format('DD/MM/YY')}
                                            </p>
                                        { entregaDetalle.fechavto2 && <p style={{ fontSize: '1.09rem', justifySelf: 'flex-end' }}>
                                                <span style={{ fontWeight: 'bold', color: '#344474' }}>Fecha de vencimiento 2:</span> {moment(entregaDetalle.fechavto2).format('DD/MM/YY')}
                                            </p>
                                        }
                                        </div>
                                    </>
                                    )
                                )
                            }
                            { role === 'A' &&
                                <>
                                <button onClick={handleEntregar} style={{ 
                                    backgroundColor: '#1A2035', 
                                    color: '#fff', 
                                    width: '6.9rem',
                                    height: '3.1rem',
                                    fontSize: '1.4rem',
                                    border: '0.2rem solid #F2F6FC',
                                    borderRadius: '0.5rem' 
                                }}>Entregar</button>
                                <Dialog className='dialog-agregar-alumno' header='¡Fantástico, usted ha hecho la entrega!' 
                                    headerStyle={{ justifySelf: 'center', textAlign: 'center' }}
                                    visible={visible} 
                                    onHide={() => setVisible(false)}
                                    breakpoints={{ '960px': '75vw', '641px': '100vw' }}
                                    >
                                </Dialog>
                                </> 
                            }
                        </div>
                    </div>
                </div>
            </>
        </div>
    )
}
