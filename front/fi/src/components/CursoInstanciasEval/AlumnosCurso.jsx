import React, { useState, useEffect, useRef } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { FloatLabel } from 'primereact/floatlabel'; //Se importa componente para agregar al alumno
import { Button } from 'primereact/button';
import { InputOtp } from 'primereact/inputotp';
import { Checkbox } from 'primereact/checkbox';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { AlumnosDatos } from '../shared/dataAlumnos'; //Se importan los datos de prueba
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import './CursoInstanciasEval.css'; //Se importan los estilos
import { useParams, Link } from 'react-router-dom';
import { PiUserCirclePlusBold } from "react-icons/pi";
import { FaRegFileExcel } from "react-icons/fa";
import { FileUpload } from 'primereact/fileupload';
import { PiCopyBold } from "react-icons/pi";
import { BsTrash } from "react-icons/bs";
import { CiWarning } from "react-icons/ci";
import { CiCircleCheck } from "react-icons/ci";
import { RxCrossCircled } from "react-icons/rx";
import { BreadCrumb } from 'primereact/breadcrumb';
import { AiOutlineHome } from "react-icons/ai";
import axios from 'axios';
import {IoDownloadOutline} from "react-icons/io5";

function AlumnosCurso() {
  //Estados para agregar un alumno
  const { id } = useParams(); //Obtiene el id del curso pasado por parámetro
  const [curso, setCurso] = useState(null);
  const [legajo, setLegajo] = useState(''); //Estado para el legajo
  const [codigoVinculacion, setCodigoVinculacion] = useState(''); //Estado para el código de vinculación
  const [alumnos, setAlumnos] = useState([]); //Estado para el listado de alumnos
  const [selectedAlumnos, setSelectedAlumnos] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'Persona.legajo': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'nombreCompleto': { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [loading, setLoading] = useState(true); //Maneja estado de la solicitud
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [isAdding, setIsAdding] = useState(false); // Estado para manejar el estado de agregar alumnos
  const handleScroll = () => { //Manejo del desplazo a la sección Agregar Alumnos
    document.getElementById('agregarAlumnos').scrollIntoView({ behavior: 'smooth'})
  };
  const [error, setError] = useState('');
  const toast = useRef(null);

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
    {template: () => <a className="item-path-recursos">Alumnos</a>  }
  ]: [];
  const home = { icon: <AiOutlineHome size={22} color='#1a2035' />, url: ('/cursos') }

  const handleCargarAlumnosExcel = async (e) => { //Cargar alumnos desde un archivo excel
    const file = e.target.files[0];
    if (!file) {
      console.log('No se seleccionó un archivo')
      //alert('Por favor, selecciona un archivo.');
        setLoading(false)
      return;
    }
    const formData = new FormData();
    formData.append('excel', file);
    console.log ('info form data', file)
    
    const allowedExtensions = /(\.xls|\.xlsx)$/;
    if (!allowedExtensions.exec(file.name)) {
        console.log('Archivo inválido')
        //alert('Por favor, selecciona un archivo válido (.xls o .xlsx).');
        setLoading(false)
        return;
    }

    try {

      const response = await axios.post(`/curso/${id}/estudiantesExcel`, formData, { withCredentials: true });
      if (response.status === 204) {
        console.log('Estudiantes agregados con éxito', response.data)
        fetchAlumnos()
        setLoading(false)
      }
    }catch (err) {
      console.error('Error al agregar alumnos', err);
      setLoading(false)
    }
  }

  const fetchAlumnos = async () => {
    try{
      const response = await axios.get(`/curso/${id}/miembros`, { withCredentials: true }) //Obteniene a todos los miembros
      if(response.data) {
        const soloAlumnos = response.data.filter(participante => participante.rol === 'A'); //Filtra alumnos
        const alumnosNombreCompleto = soloAlumnos.map(alumno => ({
          ...alumno,
          nombreCompleto: `${alumno.Persona.apellido}, ${alumno.Persona.nombre}`,
          mail: alumno.Persona.mail ?? 'No registrado'
        }))
        setAlumnos(alumnosNombreCompleto)
        setLoading(false)
      }
    } catch (err) {
      console.error('Error al obtener los alumnos', err)
      const dataAlumnos = AlumnosDatos.getData();
      setAlumnos(dataAlumnos)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlumnos();
  }, [id])

  const handleAgregarAlumnoConLegajo = async (e) => { //Agregar alumno con el legajo
    e.preventDefault();
    if (isAdding) return; // Evitar múltiples clics
    setIsAdding(true);
    if (legajo) {
        try {
            const response = await axios.post(`/curso/${id}/estudiante`, {
                legajo: legajo
            }, { withCredentials: true });
            if (response.status === 201) {
                fetchAlumnos(); // Actualiza lista de estudiantes
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: `¡Alumno con legajo ${legajo} agregado con éxito!`, life: 3000 });
            }
        } catch (err) {
            if (err.response.status === 409) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: `El alumno con legajo ${legajo} ya pertenece al curso`, life: 3000 });
            } else if (err.response.status === 404) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: `Alumno con ${legajo} no encontrado, por favor, revise nuevamente el legajo ingresado`, life: 3500 });
            } else {
                console.log('Error al agregar al alumno', err);
            }
        } finally {
            setIsAdding(false);
        }
    } else {
        console.log('Por favor, ingrese un legajo');
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Debe ingresar un legajo', life: 3000 });
        setIsAdding(false);
    }
}

  const handleGenerarCodigo = async (e) => { //Generar código de vinculación
    e.preventDefault();
    axios.post('/curso/generar-codigo', {
      cursoId: id 
    }, { withCredentials: true })
    .then(response => {
      console.log('Código generado con éxito', response.data.codigoVinculacion)
      setCodigoVinculacion(response.data.codigoVinculacion)
    })
    .catch (err => console.log('Error al generar código', err))
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoVinculacion)
    toast.current.show({ severity: 'info', summary: 'Información', detail: 'Se ha copiado el código', life: 3000 });
  }

  const handleSelectAlumno = (AlumnoId) => {
    setSelectedAlumnos((prevSelected) => {
      if (prevSelected.includes(AlumnoId)) {
          return prevSelected.filter((id) => id !== AlumnoId); // Deseleccionar
      } else {
          return [...prevSelected, AlumnoId]; // Seleccionar
      }
    });
  }
  
  const handleDeleteAlumno = async () => {
    try{
      if (selectedAlumnos.length === 0){
          toast.current.show({ severity: 'warn', summary: 'Atención', detail: 'Seleccione al menos un alumno', life: 3000 });
          return;
      }
      const response = await axios.delete(`/curso/${id}/estudiantes`, {
      data: { estudiantes: selectedAlumnos }, withCredentials: true })
      if (response.status === 204) {
        fetchAlumnos();
        setSelectedAlumnos([])
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Alumno/s eliminado/s con éxito', life: 3000 });
      }
    } catch (err) {
        if (err.response) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: err.response.data.error.details, life: 3000 })
        } else {
            console.log('Error al eliminar al alumno:', err)
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al eliminar al alumno', life: 3000 })
        }
    }
}

  const showConfirmDelete = (e) => {
    confirmPopup({
        target: e.currentTarget,
        group: 'templating',
        header: 'Confirmation',
        message: (
            <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
                <i className="text-6xl text-primary-500"></i>
                <CiWarning size={40} className='btn-gestionar-recurso' />
                <span>¿Está seguro que desea eliminar el/los alumno/s?</span>
            </div>
        ),
        className: 'confirm-delete-popup',
        accept: () => handleDeleteAlumno(),
        acceptIcon: <CiCircleCheck size={20} className='icons-delete-recurso' />,
        acceptLabel: 'Eliminar',
        rejectIcon: <RxCrossCircled size={20} className='icons-delete-recurso' />,
        rejectLabel: 'Cancelar',
        rejectClass: 'p-button-sm',
        acceptClass: 'p-button-outlined p-button-sm btn-eliminar-recurso'
    });
  };

  const onGlobalFilterChange = (e) => { //Buscador general
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const onFilterChange = (e, field) => { //Filtros individuales
    const value = e.target.value;
    let _filters = {...filters }
    _filters[field].value = value
    setFilters(_filters)
  }

  const handleKeyPressLegajo = (e) => { //No acepta texto
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault()
    }
  }

  const handleKeyNombreApellido = (e) => { //No acepta números
    if (!/[a-zA-Z\s]/.test(e.key)) {
      e.preventDefault()
    }
  }

  const renderHeader = () => {
    return (
      <div className="table-header-alumnos">
        {/* Icono que desplaza hacia abajo y su descripción */}
        <div>
          <OverlayTrigger overlay={
            <Tooltip id="tooltip-agregar-alumno" className='tooltip-agregar-alumno'>Agregar alumno</Tooltip>}>
            <span className="d-inline-block">
              <PiUserCirclePlusBold className='table-header-agregar-alumno-icon' data-tip='Agregar alumno' onClick={handleScroll} color='#a8c6e8' size={36}/>
            </span>
          </OverlayTrigger>
          <OverlayTrigger overlay={
            <Tooltip id="tooltip-cargar-alumnos" className='tooltip-cargar-alumnos'>Cargar alumnos</Tooltip>}>
            <span className="d-inline-block">
              <label htmlFor="file-upload" className="custom-file-upload">
                <FaRegFileExcel className='table-header-cargar-alumno-icon' data-tip='Cargar alumnos' color='#6dbb7c' size={29} />
              </label>
              <input 
                  id="file-upload"
                  name='excel'
                  type="file" 
                  accept=".xlsx, .xls" 
                  style={{ display: 'none' }} 
                  onChange={(e)=>{
                      setLoading(true);
                      handleCargarAlumnosExcel(e);
                  }}
              />
            </span>
          </OverlayTrigger>
          <OverlayTrigger overlay={
            <Tooltip id="tooltip-eliminar-alumno" className='tooltip-eliminar-alumno'>Eliminar alumno</Tooltip>}>
            <div className="d-inline-block" style={{verticalAlign:'bottom'}}>
              <ConfirmPopup group="templating" />
                <Button className='btn-eliminar-alumno-icon' icon={<BsTrash className='table-header-eliminar-alumno-icon' data-tip='Eliminar alumno' color='#e6838c' size={32}/>} onClick={showConfirmDelete}></Button>
            </div>
          </OverlayTrigger>
        </div>
        <IconField >
          <InputText
            className='search-input-alumnos'
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscador general"
          />
        </IconField>
      </div>
    );
  };

  const header = renderHeader();      

  return (
    <div className="alumnos-container">
      {curso ? (
        <>
        <div className='breadscrumb-container'>
          <BreadCrumb className='recursos-breadcrumb' model={items} home={home} />
        </div>
        <div className='banner-recursos py-4'>
          <h1 className='nombre-materia'>Alumnos</h1>
          <p className='nombre-comision'>{curso.Materium.nombre} {curso.Comision.nombre}</p>
        </div>
        </>
      ):(
        <div>Cargando...</div>
      )}
      <div className='alumnos-components-container'>
        {error && <p>{error}</p>}
        <Toast ref={toast} />
        <DataTable
          value={alumnos}
          paginator rows={10}
          dataKey="ID"
          filters={filters}
          filterDisplay="row"
          loading={loading}
          globalFilterFields={['Persona.legajo', 'Persona.nombre', 'Persona.apellido']}
          header={header}
          emptyMessage="Lo siento, no se encontraron alumnos."
          className='custom-datatable-alumnos'
        >
          <Column
            body={(rowData) => (
              <Checkbox 
                checked={selectedAlumnos.includes(rowData.persona_id)} 
                onChange={() => handleSelectAlumno(rowData.persona_id)} 
              />
            )}
          />
          <Column
            className='columns-data-alumnos'
            field="Persona.legajo"
            header="LEGAJO"
            filter
            filterPlaceholder="Buscar por Legajo"
            filterElement={
              <input
                className='inputs-filters-alumnos'
                type='text' 
                onKeyPress={handleKeyPressLegajo} 
                inputMode='numeric' 
                onChange={(e) => onFilterChange(e, 'Persona.legajo')}
              />
            }
          />
          <Column
            className='columns-data-alumnos'
            field="nombreCompleto"
            header="NOMBRE COMPLETO"
            filter
            filterPlaceholder="Buscar por Nombre completo"
            filterElement={
              <input
                className='inputs-filters-alumnos'
                type='text' 
                onKeyPress={handleKeyNombreApellido} 
                inputMode='text'
                onChange={(e) => onFilterChange(e, 'nombreCompleto')}
              />
            }
            sortable
          />
          <Column
              className='columns-data-alumnos'
              field="mail"
              header="MAIL"
              filter
              filterPlaceholder="Buscar por mail"
              filterElement={
                <input
                    className='inputs-filters-alumnos'
                    type='text'
                    inputMode='text'
                />
              }
              sortable
          />
        </DataTable>
        <h5 className="text-title-alumnos">Agregar alumno</h5>
        <div className='agregar-alumnos-container' id='agregarAlumnos'>
          <div className="card-agregar-alumnos-container">
            {/* Agregar alumno manualmente */}
            <h5 className='text-description-agregar-alumno'>Con Legajo</h5>
            <FloatLabel className="input-agregar-alumnos">
              <InputText className="input-item-alumnos" id="legajo" value={legajo} onKeyPress={handleKeyPressLegajo} onChange={(e) => setLegajo(e.target.value)} />
              <label className="text-input-item" htmlFor="legajo">Legajo</label>
            </FloatLabel>
            <Button className="btn-agregar-alumno" onClick={handleAgregarAlumnoConLegajo} label="Agregar" />
          </div>
          <div className="card-agregar-alumnos-container" data-cy="generar-codigo">
            {/* Generar código de vinculación */}
            <h5 className="text-description-agregar-alumno">Con código de vinculación</h5>
            <div className='generar-codigo-container'>
              { !codigoVinculacion && <InputOtp className="input-item-alumnos" disabled data-cy="input-codigo-vinculacion-disabled"/> }
              { codigoVinculacion && 
                <div  className="codigo-container flex items-center space-x-2" data-cy="codigo-container">
                  <InputOtp 
                    className="input-item-alumnos" 
                    readOnly 
                    value={codigoVinculacion} 
                    inputClassName="otp-input"
                    data-cy="input-codigo-vinculacion"
                  />
                  <PiCopyBold 
                    className='clipboard-codigo-generado'  
                    onClick={copiarCodigo} 
                    size={24} 
                    data-cy="copiar-codigo"
                  />
                </div>
              }
            </div>
            <Button className="btn-generar-codigo" onClick={handleGenerarCodigo} label="Generar" data-cy="btn-generar-codigo"/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlumnosCurso