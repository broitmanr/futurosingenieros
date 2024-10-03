
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import './DetalleEntrega.css'
import moment from 'moment';

export default function DetallaEntregaIndividual({entrega}) {
    const [isLoading, setLoading] = useState(false);
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

    const onCellEditComplete = (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;

        switch (field) {
            case 'estado':
                if (isNaN.test(newValue)){
                    rowData[field] = newValue;
                }else{
                    event.preventDefault();
                    //alert('Inválido: La retroalimentación solo permite texto')
                }
                break;
            case 'calificacion':
                if (isPositiveInteger(newValue)){
                    rowData[field] = newValue;
                }else{
                    event.preventDefault();
                    //alert('Inválido: La calificación debe ser un número positivo')
                } 
                break;
            default:
                /*if (newValue.trim().length > 0) rowData[field] = newValue;
                else */event.preventDefault();
                break;
        }
    };

    const cellEditor = (options) => {
        if (options.field === 'calificacion' || options.field === 'estado') {
            return textEditor(options);
        }
        return null
    };

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />;
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
            <DataTable className='detalle-entrega-docente' value={pruebaDatos} editMode="cell" header={header} reorderableColumns>
                <Column
                    className='columns-data-entrega-docente'
                    field="legajo"
                    header="LEGAJO"
                />
                <Column
                    className='columns-data-entrega-docente'
                    field="nombre"
                    header="NOMBRE"
                    sortable
                /> 
                {columns.map(({ field, header }) => {
                    return <Column key={field} field={field} header={header} className='columns-data-entrega-docente'
                        editor={(options) => cellEditor(options)}
                        onCellEditComplete={onCellEditComplete}
                    />;
                })}
                <Column
                    className='columns-data-entrega-docente'
                    //field="ver"
                    header="VER"
                />
            </DataTable>
        </div>
    );
}
        