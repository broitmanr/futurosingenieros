
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
    console.log('entrega', entrega)
    const { id } = useParams(); //Id de la instancia
    const [entregasHechas, setEntregasHechas] = useState([])
    console.log('entregas', entregasHechas)
    const [isLoading, setLoading] = useState(false);

    // useEffect(() => {
    //     const fetchEntregasRealizadas = async () => {
    //         try {
    //             const response = await axios.get(`/entregaPactada/instancia/${id}`, { withCredentials: true });
    //             if (response.data) {
    //                 console.log(response.data); // Verifica la estructura de datos
    //                 setEntregasHechas(response.data);
    //             }
    //         } catch (err) {
    //             console.log(err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchEntregasRealizadas();
    // }, [id]);

    const pruebaDatos = [
        { legajo: 303132, nombre: 'Camila', estado: 'Modificar', calificacion: 1 },
        { legajo: 313230, nombre: 'Sonia', estado: 'Aprobado', calificacion: 6 },
        { legajo: 323031, nombre: 'Lorenzo', estado: 'Modificar', calificacion: 5 }
    ]

    const columns = [
        { field: 'estado', header: 'Estado' },
        { field: 'calificacion', header: 'Calificación' }
    ];

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

        if (field === 'nota' && isPositiveInteger(newValue)){
            rowData[field] = newValue;
            /*try{
                const response = await axios.patch(`/entrega/calificar/${entrega.ID}`, { nota }, { withCredentials: true })
                console.log('Calificación', response.data)
                handleVerEntregas()
            }catch(err){
                console.log('Error al modificar la nota:', err)
            }*/
        }else{
            event.preventDefault()
        }
        // switch (field) {
        //     case 'estado':
        //         if (isNaN.test(newValue)){
        //             rowData[field] = newValue;
        //         }else{
        //             event.preventDefault();
        //             //alert('Inválido: La retroalimentación solo permite texto')
        //         }
        //         break;
        //     case 'nota':
        //         if (isPositiveInteger(newValue)){
        //             rowData[field] = newValue;
        //             try{
        //                 const response = await axios.post 
        //             }catch(err){
        //                 console.log('Error al modificar la nota:', err)
        //             }
        //         }else{
        //             event.preventDefault();
        //             //alert('Inválido: La calificación debe ser un número positivo')
        //         } 
        //         break;
        //     default:
        //         event.preventDefault();
        //         break;
        // }
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
            value={pruebaDatos} 
            editMode="cell" 
            header={header} 
            onCellEditComplete={onCellEditComplete} 
            reorderableColumns
            emptyMessage="Oops...no se hay entregas para mostrar"
            >
                <Column
                    className='columns-data-entrega-docente'
                    field="legajo"
                    header="LEGAJO"
                />
                <Column
                    className='columns-data-entrega-docente'
                    field="nombre"
                    header="NOMBRE"
                    body={(rowData) => `${rowData.apellido}, ${rowData.nombre}`}
                    sortable
                    sortField="apellido"
                />
                <Column
                    className='columns-data-entrega-docente'
                    field='estado'
                    header="ESTADO"
                /> 
                <Column
                    className='columns-data-entrega-docente'
                    field="nota"
                    header="CALIFICACIÓN"
                    editor={(options) => cellEditor(options)}
                />
                {/* {columns.map(({ field, header }) => {
                    return <Column key={field} field={field} header={header} className='columns-data-entrega-docente'
                        editor={(options) => cellEditor(options)}
                        onCellEditComplete={onCellEditComplete}
                    />;
                })} */}
                <Column
                    className='columns-data-entrega-docente'
                    header="VER"
                    body={(rowData) => (
                        <IoOpenOutline
                            onClick={() => handleVerArchivo(`/archivo/${id}`)}
                            style={{ cursor: 'pointer', color: '#007bff' }}
                            title="Ver archivo"
                        />
                    )}
                />
            </DataTable>
        </div>
    );
}
        