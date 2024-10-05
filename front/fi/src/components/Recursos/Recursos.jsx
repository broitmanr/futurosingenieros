import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import { classNames } from 'primereact/utils';
import { FaPlus } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import { BsTrash } from "react-icons/bs";
import { IoDownloadOutline } from "react-icons/io5";
import { Checkbox } from 'primereact/checkbox';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
        
import './Recursos.css'
import { useRole } from '../../context/RolesContext';

export default function Recursos() {
    const { role } = useRole()
    const [selectedItems, setSelectedItems] = useState([]);
    const recursos = [
        {
            id: 1,
            nombre: 'Plantilla Informe 1',
            extension: 'DOCX',
            estado: 'SIN DESCARGAR',
            enlace: 'https://frlp.cvg.utn.edu.ar'
        },
        {
            id: 2,
            nombre: 'Guía de TP',
            extension: 'PDF',
            estado: 'SIN DESCARGAR',
            enlace: 'https://frlp.cvg.utn.edu.ar'
        },
        {
            id: 3,
            nombre: 'roject.iso',
            extension: 'ISO',
            estado: 'DESCARGADO',
            enlace: 'https://microsoft.com'
        }
    ];

    const getSeverity = (recurso) => {
        switch (recurso.estado) {
            case 'SIN DESCARGAR':
                return 'success';

            case 'DESCARGADO':
                return 'danger';

            default:
                return null;
        }
    };

    const handleSelectItem = (recursoId) => {
        setSelectedItems((prevSelected) => {
            if (prevSelected.includes(recursoId)) {
                return prevSelected.filter((id) => id !== recursoId); // Deseleccionar
            } else {
                return [...prevSelected, recursoId]; // Seleccionar
            }
        });
    };

    const header = () => {
        return(
            <div className="flex flex-wrap justify-content-end gap-2">
                { role === 'D' &&
                <>
                <Button className='btn-gestionar-recurso' icon={<FaTrashAlt size={24} />} label="Eliminar recurso" text />
                <Button className='btn-gestionar-recurso' icon={<FaPlus size={24} />} label="Subir recurso" text />
                </>
                }
            </div>
        )
    };

    const itemTemplate = (recurso, index) => {
        return (
            <div className="col-12" key={recurso.id}>
                <div className="recurso-item flex align-items-center">
                    <Checkbox 
                        checked={selectedItems.includes(recurso.id)} 
                        onChange={() => handleSelectItem(recurso.id)} 
                        className='checkbox-recurso'
                    />
                    <div className="flex flex-column flex-grow-1 ml-8">
                        <div className="text-2xl font-bold text-900">{recurso.nombre}</div>
                        <div className="flex align-items-center gap-2 mt-2">
                            <span className="font-semibold">{recurso.extension}</span>
                            <Tag value={recurso.estado} severity={getSeverity(recurso)}></Tag>
                        </div>
                    </div>
                    <div className="flex flex-column align-items-end ml-2">
                        <Button icon={<IoDownloadOutline size={24} />} className="p-button-rounded btn-descargar-recurso"></Button>
                        {/*<span className="text-2xl font-semibold mt-2">{recurso.enlace}</span>*/}
                    </div>
                </div>
            </div>
        );
    };
    
    const listTemplate = (items) => {
        if (!items || items.length === 0) return null;
    
        return (
            <div className="grid">
                {items.map(itemTemplate)}
            </div>
        );
    };
    
    return (
        <div className="card recursos-cards">
            <DataView value={recursos} listTemplate={listTemplate} header={header()} />
        </div>
    );

}