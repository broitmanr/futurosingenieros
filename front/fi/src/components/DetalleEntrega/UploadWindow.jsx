import React, { useRef, useState } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import './UploadWindow.css';  // Importar el archivo CSS correspondiente

const uploadIconUrl = '/Upload-FI.png';  // Asegúrate de que la ruta sea correcta

export default function UploadWindow({ entregaPactadaId, onUploadSuccess }) {
    const [totalSize, setTotalSize] = useState(0);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileUploadRef = useRef(null);
    const toast = useRef(null);

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
        if (!entregaPactadaId) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Entrega pactada ID no está definido', life: 3000 });
            return;
        }

        if (files.length === 0) {
            toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Debe seleccionar al menos un archivo para subir', life: 3000 });
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            files.forEach(file => {
                formData.append('pdfs', file);
            });
            formData.append('entregaPactadaId', entregaPactadaId);

            const response = await axios.post(`http://localhost:5000/api/entrega/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Entrega creada con éxito', life: 3000 });

            setLoading(false);
            setFiles([]);
            setTotalSize(0);
            fileUploadRef.current.clear();

            // Agregar un retraso antes de llamar a onUploadSuccess
            setTimeout(() => {
                onUploadSuccess(); // Llamar a la función de éxito de subida
            }, 3000); // 3 segundos de retraso

        } catch (err) {
            setLoading(false);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al subir los archivos', life: 3000 });
        }
    };

    const handleRemoveFile = (file, props) => {
        const newFiles = files.filter(f => f.name !== file.name);
        setFiles(newFiles);
        updateTotalSize(newFiles);
        props.onRemove(file);
    };

    const onTemplateClear = () => {
        setTotalSize(0);
        setFiles([]);
    };

    const headerTemplate = (options) => {
        const { chooseButton, cancelButton } = options;
        return (
            <div className="upload-header">
                {chooseButton}
                <Button icon="fa-solid fa-check" onClick={handleSubirRecurso} className="p-button-success" />
                {cancelButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>{fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B'} / 10 MB</span>
                    <ProgressBar value={totalSize / 10000000} showValue={false} style={{ width: '10rem', height: '12px' }} />
                </div>
            </div>
        );
    };

    const itemTemplate = (file, props) => (
        <div className="p-fileupload-row flex align-items-center flex-wrap">
            <div className="flex align-items-center" style={{ width: '30%' }}>
                <img alt={file.name} role="presentation" src={uploadIconUrl} width={100} /> {/* Icono PNG personalizado */}
                <span className="flex flex-column text-left ml-3 file-name">
                    {file.name}
                    <small>{new Date().toLocaleDateString()}</small>
                </span>
            </div>
            <Tag value={props.formatSize} severity="warning" className="px-3 py-2 file-size" />
            <Button type="button" icon="fa-solid fa-xmark" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => handleRemoveFile(file, props)} />
        </div>
    );

    const emptyTemplate = () => (
        <div className="d-flex align-items-center drop-area">
            <span style={{ fontSize: '1.5em', color: 'var(--text-color-secondary)' }} className="my-5">
                Suelte sus archivos aquí para subir
            </span>
        </div>
    );

    const chooseOptions = { icon: 'fa-solid fa-upload', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
    const cancelOptions = { icon: 'fa-solid fa-xmark', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

    return (
        <div>
            <Toast ref={toast} />
            <FileUpload ref={fileUploadRef} name="pdfs" multiple accept="application/pdf" maxFileSize={10000000}
                onSelect={handleFileChange} onClear={onTemplateClear}
                headerTemplate={headerTemplate} itemTemplate={itemTemplate} emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions} cancelOptions={cancelOptions} onError={(e) => console.error('UploadWindow: Error al subir el archivo', e)} />
        </div>
    );
}