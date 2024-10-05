import { useRef, useState, useEffect } from "react"
import { useParams } from 'react-router-dom';
import axios from 'axios';
import moment from "moment";
import { useRole } from "../../context/RolesContext";
import { Dialog } from 'primereact/dialog';


import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';

import './DetalleEntrega.css'
import UploadWindow from "./UploadWindow";


export const DetalleEntrega = () => {
    
    const { role } = useRole()
    const [entregaDetalle, setEntregaDetalle] = useState([])
    const params = useParams();
    const [isLoading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false); //Manejo del Dialog

    useEffect(() => {
        const fetchEntregaDetalle = async () => {
            try {
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
        <div className="entrega-detalle-container">
            {role === 'A' &&
                <>
                    <div className="container d-flex justify-content-center">
                        <div className="container-box-entrega-detalle">
                            <div className="col-md-6 mx-auto border- border-2 box-entrega-detalle">
                                {isLoading ? (
                                    <p className='text-danger text-center'>Cargando</p>
                                ) : (
                                    entregaDetalle.nombre && (
                                        <>
                                            <div>
                                                <h2 className="nombre-entrega-detalle">{entregaDetalle.nombre}</h2>
                                                <p className='descripcion-entrega-detalle'>{entregaDetalle.descripcion}</p>
                                            </div>
                                            <div>
                                                <p className="fechas-entrega-detalle">
                                                    <span className="fechas-entrega">Fecha de vencimiento:</span> {moment(entregaDetalle.fechavto1).format('DD/MM/YY')}
                                                </p>
                                                {entregaDetalle.fechavto2 && <p className="fechas-entrega-detalle">
                                                    <span className="fechas-entrega">Fecha de vencimiento 2:</span> {moment(entregaDetalle.fechavto2).format('DD/MM/YY')}
                                                </p>
                                                }
                                            </div>
                                        </>
                                    )
                                )
                                }

                               
                               <UploadWindow/>

                                <button onClick={handleEntregar} className="btn-entrega-detalle-entregar d-none">Entregar</button>
                                <Dialog className='dialog-agregar-entrega-detalle' header='¡Fantástico, usted ha hecho la entrega!'
                                    visible={visible}
                                    onHide={() => setVisible(false)}
                                    breakpoints={{ '960px': '75vw', '641px': '100vw' }}
                                >
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>
    )
    
}
