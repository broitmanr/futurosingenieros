
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import './DetalleEntrega.css'
import moment from 'moment';
import { IoOpenOutline } from "react-icons/io5";
import axios from 'axios';

export default function DetallaEntregaIndividual({entrega}) {
    const { id } = useParams(); //Id de la instancia
    const [entregasHechas, setEntregasHechas] = useState([])
    const [isLoading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [nota, setNota] = useState('');

    const handleEntregasHechas = async () => {
        setLoading(true);
        setErrorMessage("");
        setEntregasHechas([]);

        try {
            const response = await axios.get(`/entrega/listarEntregasHechas/${entrega.ID}`, { withCredentials: true });
            if (response.data && response.data.length > 0) {
                setEntregasHechas(response.data);
            }
        } catch (err) {
            console.log(err);
            setErrorMessage('No se encontraron entregas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleEntregasHechas();
    }, [entrega.ID]);

    const isPositiveInteger = (val) => {
        let str = String(val);

        str = str.trim();

        if (!str) {
            return false;
        }

        str = str.replace(/^0+/, '') || '0';
        let n = Math.floor(Number(str));

        return n !== Infinity && String(n) === str && n >= 0;
    };

    const onCellEditComplete = async (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;
        switch (field) {
            case 'nota': 
            if (isPositiveInteger(newValue)){
                rowData[field] = newValue;
                console.log('rowData', rowData);
                try{
                    const response = await axios.patch(`/entrega/calificar/${rowData.id}`, { nota: newValue }, { withCredentials: true })
                    console.log('Calificación', response.data)
                    handleEntregasHechas()
                }catch(err){
                    console.log('Error al modificar la nota:', err)
                }
            }else{
                event.preventDefault();
                //alert('Inválido: La calificación debe ser un número positivo')
            } 
            break;
            default:
                event.preventDefault();
                break;
        }
    };

    const cellEditor = (options) => {
        if (options.field === 'nota') {
            return textEditor(options);
        }
        return null
    };

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />;
    };

    const handleVerArchivo = (url) => {
        if (url) {
            window.open(url, '_blank'); // Abre el archivo en una nueva pestaña
        } else {
            console.log('No hay URL para mostrar');
        }
    };

    const renderHeader = () => {
        return (
            <div className="table-header-entrega-docente">
                { isLoading ? (
                    <p className='text-danger text-center'>Cargando</p>
                    ) : (
                        entrega.nombre && (
                        <>
                            <div >
                                <h5 className="nombre-entrega-detalle">{entrega.nombre}</h5>
                                <p className='descripcion-entrega-detalle'>{entrega.descripcion}</p>
                                <div className='fechas-entrega-docente-container'>
                                    <p>
                                        <span className='fechas-entrega'>F. vencimiento:</span> {moment(entrega.fechavto1).format('DD/MM/YY')}
                                    </p>
                                    { entrega.fechavto2 && <p className='fecha2-entrega-docente'>
                                        <span className='fechas-entrega'>F. vencimiento 2:</span> {moment(entrega.fechavto2).format('DD/MM/YY')}
                                        </p>
                                    }
                                </div>
                            </div>
                        </>
                        )
                    )
                }
            </div>
        )}

    const header = renderHeader(); 

    return (
        <div className="card p-fluid">
            <DataTable className='detalle-entrega-docente' 
            dataKey="ID"
            value={entregasHechas} 
            editMode="cell" 
            header={header} 
            reorderableColumns
            emptyMessage={errorMessage || "Oops...no se hay entregas para mostrar"}
            >
                <Column
                    className='columns-data-entrega-docente'
                    field="legajo"
                    key="legajo"
                    header="LEGAJO"
                />
                <Column
                    className='columns-data-entrega-docente'
                    field="nombre"
                    key="nombre"
                    header="NOMBRE"
                    body={(rowData) => `${rowData.apellido}, ${rowData.nombre}`}
                    sortable
                    sortField="apellido"
                />
                <Column
                    className='columns-data-entrega-docente'
                    field='estado'
                    key='estado'
                    header="ESTADO"
                /> 
                <Column
                    className='columns-data-entrega-docente'
                    field="nota"
                    key="nota"
                    header="CALIFICACIÓN"
                    body={(rowData) => rowData.nota}
                    editor={(options) => cellEditor(options)}
                    onCellEditComplete={onCellEditComplete} 
                />
                <Column
                    className='columns-data-entrega-docente'
                    header="VER"
                    body={(rowData) => (
                        <IoOpenOutline
                            onClick={() => handleVerArchivo(`/archivo/${rowData.id}`)}
                            style={{ cursor: 'pointer', color: '#007bff' }}
                            title="Ver archivo"
                        />
                    )}
                />
            </DataTable>
        </div>
    );
}
        