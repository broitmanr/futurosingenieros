import React, { useState, useEffect, useRef } from 'react';
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
import { FileUpload } from 'primereact/fileupload';
import './Recursos.css'
import { useRole } from '../../context/RolesContext';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { ProgressBar } from 'primereact/progressbar';
import { TfiFiles } from "react-icons/tfi";
import { SlCloudUpload } from "react-icons/sl";
import { RxCross2 } from "react-icons/rx";
import { IoMdCloudCircle } from "react-icons/io";


export default function Recursos() {
    const { id } = useParams()
    const { role } = useRole()
    const [selectedItems, setSelectedItems] = useState([]);
    const [files, setFiles] = useState([])
    const fileUploadRef = useRef(null)
    const [visible, setVisible] = useState(false)
    const [totalSize, setTotalSize] = useState(0)
    const handleCloseUpload = () => setVisible(false);
    const handleShowUpload = () => setVisible(true);

    const handleFileChange = (e) => {
        const selectedFiles = [...e.files];
        setFiles(selectedFiles);
        updateTotalSize(selectedFiles);
    };

    const updateTotalSize = (selectedFiles) => {
        const _totalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
        setTotalSize(_totalSize);
    };
    
    const handleSubirRecurso = async () => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try{
            const response = await axios.post(`/archivo/subirMaterial/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true})
            if(response.data){
                console.log('Agregado con éxito', response.data)
                handleCloseUpload()
            }
        }catch(err){
            console.log('No se ha logrado subir el recurso:', err)
        }
    }

    const handleRemoveFile = (file, props) => {
        const newFiles = files.filter(f => f.name !== file.name);
        setFiles(newFiles);
        updateTotalSize(newFiles);
        props.onRemove(file);
    };

    const onModalClear = () => {
        setTotalSize(0);
        setFiles([]);
    };

    const headerModal = (options) => {
        const { chooseButton, cancelButton } = options;
        return(
            <div style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                <Button icon={<SlCloudUpload />} onClick={handleSubirRecurso} className="p-button-success" />
                {cancelButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>{fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B'} / 10 MB</span>
                    <ProgressBar value={totalSize / 10000000} showValue={false} style={{ width: '10rem', height: '12px' }} />
                </div>
            </div>
        )
    };

    const itemModal = (file, props) => (
        <div className="flex align-items-center flex-wrap">
            <span className="flex flex-column text-left ml-3">{file.name}</span>
            <Button type="button" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => handleRemoveFile(file, props)}><RxCross2 /></Button>
        </div>
    );

    const emptyModal = () => (
        <div className="flex align-items-center flex-column">
            <i className="mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
            <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">Drag and Drop Files Here</span>
        </div>
    );

    const chooseOptions = { iconOnly: true, className: 'recurso-choose-btn p-button-rounded p-button-outlined', icon: <TfiFiles /> };
    const cancelOptions = { iconOnly: true, className: 'recurso-cancel-btn p-button-rounded p-button-danger p-button-outlined', icon: <RxCross2 /> };

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
                <Button className='btn-gestionar-recurso' icon={<FaPlus size={24} />} label="Subir recurso" text onClick={handleShowUpload} />
                <Modal show={visible} onHide={handleCloseUpload} style={{width: '100%'}}>
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>
                        <FileUpload
                        ref={fileUploadRef}
                        name="files"
                        multiple
                        accept="*/*"
                        maxFileSize={10000000}
                        onSelect={handleFileChange}
                        onClear={onModalClear}
                        headerTemplate={headerModal}
                        itemTemplate={itemModal}
                        emptyTemplate={emptyModal}
                        chooseOptions={chooseOptions}
                        cancelOptions={cancelOptions}
                        onError={(e) => console.error('Error al subir el archivo', e)} />
                    </Modal.Body>
                </Modal>
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