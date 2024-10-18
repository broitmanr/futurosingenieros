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
import './CursoInstanciasEval.css'; //Se importan los estilos
import { useRole } from '../../context/RolesContext';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { ProgressBar } from 'primereact/progressbar';
import { TfiFiles } from "react-icons/tfi";
import { SlCloudUpload } from "react-icons/sl";
import { RxCross2 } from "react-icons/rx";
import { IoMdCloudCircle } from "react-icons/io";
import {CircularProgress} from "@mui/material";
import { IoEyeSharp } from "react-icons/io5";

export default function Recursos() {
    const { id } = useParams()
    const { role } = useRole()
    const [selectedItems, setSelectedItems] = useState([]);
    const [files, setFiles] = useState([])
    const fileUploadRef = useRef(null)
    const [visible, setVisible] = useState(false)
    const [totalSize, setTotalSize] = useState(0)
    const [loading, setLoading] = useState(false); // Estado para manejar el estado de carga
    const [archivos, setArchivos] = useState([])
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
            setLoading(true)
            const response = await axios.post(`/archivo/subirMaterial/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true})
            if(response.data){
                console.log('Agregado con éxito', response.data)
                setLoading(false)
                handleVerRecursos()
                onModalClear()
                handleCloseUpload()
            }
        }catch(err){
            setLoading(false)
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
            <div className='header-modal-recursos-container'>
                {chooseButton}
                <Button icon={<SlCloudUpload color='#155724' />} onClick={handleSubirRecurso} className="p-button-success btn-header-modal-recursos" />
                {cancelButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>{fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B'} / 10 MB</span>
                    <ProgressBar value={totalSize / 10000000} showValue={false} className='progress-bar-recursos' />
                </div>
            </div>
        )
    };

    const itemModal = (file, props) => (
        <div className="flex align-items-center flex-wrap">
            <span className="flex flex-column text-left ml-3">{file.name}</span>
            <Button type="button" className="p-button-outlined p-button-danger ml-auto btn-item-modal-recursos" onClick={() => handleRemoveFile(file, props)}><RxCross2 /></Button>
        </div>
    );

    const emptyModal = () => (
        <div className="flex align-items-center flex-column recursos-drop">
            <span className="my-5 modal-recursos-drop">Arrastrá tus archivos acá</span>
        </div>
    );

    const chooseOptions = { iconOnly: true, className: 'recurso-choose-btn p-button-rounded p-button-outlined btn-header-modal-recursos', icon: <TfiFiles /> };
    const cancelOptions = { iconOnly: true, className: 'recurso-cancel-btn p-button-danger p-button-outlined btn-header-modal-recursos', icon: <RxCross2 /> };

    const handleVerRecursos = async () => {
        try {
            console.log(id)
            const response = await axios.get(`/archivo/curso/${id}`, {withCredentials: true})
            if(response.data){
                setArchivos(response.data)
            }
        } catch (err) {
            console.log('No se ha logrado obtener los recursos:', err)
        }
    }

    useEffect(() =>{
        handleVerRecursos()
    }, [id])

    const handleSelectItem = (fileId) => {
        setSelectedItems((prevSelected) => {
            if (prevSelected.includes(fileId)) {
                return prevSelected.filter((id) => id !== fileId); // Deseleccionar
            } else {
                return [...prevSelected, fileId]; // Seleccionar
            }
        });
    };

    const handleViewFile = (url) => {
        window.open(url, '_blank'); // Abre el archivo en una nueva pestaña
    };
/*
    const handleDownload = async (url, archivoNombre) => {
        try {
            const response = await axios.get(url, { responseType: 'blob' }); // Asegúrate de especificar 'blob' como responseType
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', archivoNombre); // Puedes especificar el nombre del archivo
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
        }
    };
*/
    const header = () => {
        return(
            <div className="flex flex-wrap justify-content-end gap-2">
                { role === 'D' &&
                <>
                <Button className='btn-gestionar-recurso' icon={<FaTrashAlt size={24} />} label="Eliminar recurso" text />
                <Button className='btn-gestionar-recurso' icon={<FaPlus size={24} />} label="Subir recurso" text onClick={handleShowUpload} />
                <Modal show={visible} onHide={handleCloseUpload} >
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>
                        {!loading ?
                            (<FileUpload
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
                                onError={(e) => console.error('Error al subir el archivo', e)} />)
                            : (<>
                                <CircularProgress className={'m-2'} size="3rem" /><small className={'ml-2'}>Subiendo archivos</small>
                            </>)


                        }

                    </Modal.Body>
                </Modal>
                </>
                }
            </div>
        )
    };

    const itemTemplate = (archivo, index) => {
        return (
            <div className="col-12 column-data-recursos" key={archivo.ID}>
                <div className="recurso-item flex align-items-center">
                    { role === 'D' &&
                    <Checkbox 
                        checked={selectedItems.includes(archivo.ID)} 
                        onChange={() => handleSelectItem(archivo.ID)} 
                        className='checkbox-recurso'
                    />
                    }
                    <div className="flex flex-column flex-grow-1 ml-8">
                        <div className="text-2xl font-bold text-900">{archivo.nombre} <span> </span> 
                            <IoEyeSharp onClick={() => handleViewFile(archivo.referencia)} />
                        </div>
                        <div className="flex align-items-center gap-2 mt-2">
                            <span className="font-semibold">{archivo.extension}</span>
                        </div>
                    </div>
                    <div className="flex flex-column align-items-end ml-2">
                        <Button icon={<IoDownloadOutline size={24} /*onClick={() => handleDownload(archivo.referencia, archivo.nombre)}*/ />} className="p-button-rounded btn-descargar-recurso"></Button>
                    </div>
                </div>
            </div>
        );
    };
    
    const listTemplate = (archivos) => {
        if (!archivos || archivos.length === 0) {
            return (
                <div className="no-recursos" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '50vh'
                }}>
                    <img 
                        src="../../../public/NoEncontrado.png" 
                        alt="No recursos" 
                        style={{ width: '12rem', height: 'auto', marginBottom: '1rem' }}
                    />
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                        No se encontraron recursos
                    </span>
                </div>
            );
        }
    
        return (
            <div className="grid recursos-grid">
                {archivos.map(itemTemplate)}
            </div>
        );
    };
    
    return (
        <div className="card recursos-cards">
            <DataView value={archivos} listTemplate={listTemplate} header={header()} />
        </div>
    );

}