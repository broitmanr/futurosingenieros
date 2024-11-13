import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { FaPlus } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import { IoDownloadOutline } from "react-icons/io5";
import { Checkbox } from 'primereact/checkbox';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { FileUpload } from 'primereact/fileupload';
import './CursoInstanciasEval.css'; //Se importan los estilos
import { useRole } from '../../context/RolesContext';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { ProgressBar } from 'primereact/progressbar';
import { LuFileSearch } from "react-icons/lu";
import { SlCloudUpload } from "react-icons/sl";
import { RxCross2 } from "react-icons/rx";
import {CircularProgress} from "@mui/material";
import { IoEyeSharp } from "react-icons/io5";
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { CiWarning } from "react-icons/ci";
import { CiCircleCheck } from "react-icons/ci";
import { RxCrossCircled } from "react-icons/rx";
import { BreadCrumb } from 'primereact/breadcrumb';
import { AiOutlineHome } from "react-icons/ai";

export default function Recursos() {
    const { id } = useParams()
    const { role } = useRole()
    const [selectedItems, setSelectedItems] = useState([]);
    const [files, setFiles] = useState([])
    const fileUploadRef = useRef(null)
    const toast = useRef(null);
    const [visible, setVisible] = useState(false)
    const [totalSize, setTotalSize] = useState(0)
    const [loading, setLoading] = useState(false); // Estado para manejar el estado de carga
    const [archivos, setArchivos] = useState([])
    const handleCloseUpload = () => setVisible(false);
    const handleShowUpload = () => setVisible(true);
    const [curso, setCurso] = useState(null);

    useEffect(() => { // OBTENER LOS DATOS DEL CURSO
        axios.get(`/curso/${id}`, { withCredentials: true })
            .then(response => {
                setCurso(response.data)
            })
            .catch(err => {
                console.log(err)
            })
    }, [id])

    const items = curso ? [
        {template: () => 
            <Link className="item-path-recursos" to={`/curso/${curso.id}`}>
                {curso.Materium.nombre}
            </Link>}, 
        {template: () => <a className="item-path-recursos">Recursos</a>  }
    ]: [];
    const home = { icon: <AiOutlineHome size={22} color='#1a2035' />, url: ('/cursos') }

    

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
    const handleRemoveFile = async () => {
        try {
            setLoading(true)
            for (const fileId of selectedItems) {
                const response = await axios.delete(`/archivo/${fileId}`, { withCredentials: true })
                if (response.status === 204) {
                    const newFiles = files.filter(f => f.id !== fileId)
                    setFiles(newFiles)
                    updateTotalSize(newFiles)
                }
            }
            await handleVerRecursos(); // Actualizar la lista de archivos
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Archivos eliminados con éxito', life: 3000 })
        } catch (err) {
            console.log('No se ha logrado eliminar el recurso:', err)
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se ha logrado eliminar el recurso', life: 3000 })
        } finally {
            setLoading(false)
        }
    }

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

    const chooseOptions = { iconOnly: true, className: 'recurso-choose-btn p-button-rounded p-button-outlined btn-header-modal-recursos', icon: <LuFileSearch size={16} /> };
    const cancelOptions = { iconOnly: true, className: 'recurso-cancel-btn p-button-danger p-button-outlined btn-header-modal-recursos', icon: <RxCross2 /> };

    const handleVerRecursos = async () => {
        try {
            console.log(id)
            const response = await axios.get(`/archivo/curso/${id}`, { withCredentials: true });
            if (response.data) {
                setArchivos(response.data)
            } else {
                setArchivos([]) // Asegurarse de que la lista de archivos esté vacía si no hay datos
            }
        } catch (err) {
            console.log('No se ha logrado obtener los recursos:', err)
            setArchivos([])// Asegurarse de que la lista de archivos esté vacía si hay un error
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

    const handleDownload = async (archivoId, archivoNombre) => {
        try {
            // Realizar la solicitud al backend para descargar el archivo
            const response = await axios.get(`/archivo/${archivoId}`, {
                withCredentials: true,
                responseType: 'blob'
            });

            // Crear un blob a partir de los datos recibidos
            const blob = new Blob([response.data], { type: response.headers['content-type'] });

            // Crear un enlace temporal para descargar el archivo
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', archivoNombre);  // Especifica el nombre del archivo a descargar
            document.body.appendChild(link);

            // Simular el clic en el enlace para iniciar la descarga
            link.click();

            // Eliminar el enlace temporal del DOM
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
        }
    };



    const showConfirmDelete = (event) => {
        confirmPopup({
            target: event.currentTarget,
            group: 'templating',
            header: 'Confirmation',
            message: (
                <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
                    <i className="text-6xl text-primary-500"></i>
                    <CiWarning size={40} className='btn-gestionar-recurso' />
                    <span>¿Está seguro que desea eliminar el/los recurso/s?</span>
                </div>
            ),
            acceptIcon: <CiCircleCheck size={20} className='icons-delete-recurso' />,
            acceptLabel: 'Eliminar',
            rejectIcon: <RxCrossCircled size={20} className='icons-delete-recurso' />,
            rejectLabel: 'Cancelar',
            rejectClass: 'p-button-sm',
            acceptClass: 'p-button-outlined p-button-sm btn-eliminar-recurso',
            accept: handleRemoveFile // Llamar a handleRemoveFile al aceptar
        });
    };

    const header = () => {
        return(
            <div className="header-recursos-container flex flex-wrap justify-content-center gap-2">
                { role === 'D' &&
                <>
                <Toast ref={toast} />
                <ConfirmPopup group="templating" />
                <div className="flex justify-content-center">
                    <Button className='btn-gestionar-recurso' onClick={showConfirmDelete} icon={<FaTrashAlt size={24} />} label="Eliminar recurso" text />
                </div>
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
                        <Button icon={<IoDownloadOutline size={24} onClick={() => handleDownload(archivo.ID, archivo.nombre)} />} className="p-button-rounded btn-descargar-recurso"></Button>
                    </div>
                </div>
            </div>
        );
    };
    
    const listTemplate = (archivos) => {
        if (!archivos || archivos.length === 0) {
            return (
                <div className="no-recursos">
                    <img 
                        src="../../../public/NoEncontrado.png" 
                        alt="No recursos"
                    />
                    <span className='no-recursos-text'>
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
        <div className='recursos-container'>
            {curso ? (
                <>
                <BreadCrumb className='recursos-breadcrumb' model={items} home={home} />
                <div className='banner-recursos py-4'>
                    <h1 className='nombre-materia'>Recursos</h1>
                    <p className='nombre-comision'>{curso.Materium.nombre} {curso.Comision.nombre}</p>
                </div>
                </>
            ):(
                <div>Cargando...</div>
            )
            }
            
            <div>
                <DataView value={archivos} listTemplate={listTemplate} header={header()} />
            </div>
        </div>
    );

}