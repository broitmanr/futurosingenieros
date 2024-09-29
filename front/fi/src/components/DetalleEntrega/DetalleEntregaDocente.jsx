
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import moment from 'moment';

export default function DetallaEntregaIndividual({entrega}) {
    const [isLoading, setLoading] = useState(false);
    const pruebaDatos = [
        { legajo: 303132, nombre: 'Camila', email: '@', estado: 'Modificar', calificacion: 1 },
        { legajo: 313230, nombre: 'Sonia', email: '@', estado: 'Aprobado', calificacion: 6 },
        { legajo: 323031, nombre: 'Lorenzo', email: '@', estado: 'Modificar', calificacion: 5 }
    ]

    const columns = [
        { field: 'legajo', header: 'Legajo' },
        { field: 'nombre', header: 'Nombre' },
        { field: 'email', header: 'Email' },
        { field: 'estado', header: 'Estado' },
        { field: 'calificacion', header: 'Calificación' },
        { field: 'archivo', header: 'Archivo' }
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
            <div className="table-header" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
                { isLoading ? (
                    <p className='text-danger text-center'>Cargando</p>
                    ) : (
                        entrega.nombre && (
                        <>
                            <div >
                                <h5 className="nombre-materia" style={{ color: '#1a2035', fontSize: '1.8rem' }}>{entrega.nombre} <span>{entrega.numero}</span></h5>
                                <p style={{ fontSize: '1.2rem' }}>{entrega.descripcion}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.09rem' }}>
                                    <p style={{ marginRight: '1rem' }}>
                                        <span style={{ fontWeight: 'bold', color: '#1a2035' }}>F. vencimiento:</span> {moment(entrega.fechavto1).format('DD/MM/YY')}
                                    </p>
                                    { entrega.fechavto2 && <p>
                                        <span style={{ fontWeight: 'bold', color: '#1a2035' }}>F. vencimiento 2:</span> {moment(entrega.fechavto2).format('DD/MM/YY')}
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
            <DataTable className='detalle-entrega-individual-docente' value={pruebaDatos} editMode="cell" tableStyle={{ minWidth: '50rem' }} header={header} reorderableColumns>
                {columns.map(({ field, header }) => {
                    return <Column key={field} field={field} header={header} style={{ width: '25%' }} 
                        editor={(options) => {
                            if (field === 'nombre' || field === 'legajo' || field === 'email' || field === 'archivo'){
                                return <InputText value={options.value} readOnly />
                            }else{
                                return cellEditor(options)
                            }
                        }}
                        onCellEditComplete={onCellEditComplete} 
                        sortable={field === 'nombre'} />;
                })}
            </DataTable>
        </div>
    );
}
        