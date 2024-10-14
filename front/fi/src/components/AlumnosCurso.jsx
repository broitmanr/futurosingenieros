import React, { useState, useEffect } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { FloatLabel } from 'primereact/floatlabel'; //Se importa componente para agregar al alumno
import { Button } from 'primereact/button';
import { InputOtp } from 'primereact/inputotp';
import { Dialog } from 'primereact/dialog';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { AlumnosDatos } from './shared/dataAlumnos'; //Se importan los datos de prueba
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import './styles/AlumnosCurso.css' //Se importan los estilos
import { useParams } from 'react-router-dom';
import { PiUserCirclePlusBold } from "react-icons/pi";
import { FaRegFileExcel } from "react-icons/fa";
import { FileUpload } from 'primereact/fileupload';
import { PiCopyBold } from "react-icons/pi";
import axios from 'axios';

function AlumnosCurso() {
  //Estados para agregar un alumno
  const { id } = useParams(); //Obtiene el id del curso pasado por parámetro
  const [legajo, setLegajo] = useState(''); //Estado para el legajo
  const [codigoVinculacion, setCodigoVinculacion] = useState(''); //Estado para el código de vinculación
  const [alumnos, setAlumnos] = useState([]); //Estado para el listado de alumnos
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'Persona.legajo': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    /*'Persona.nombre': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'Persona.apellido': { value: null, matchMode: FilterMatchMode.STARTS_WITH },*/
    'nombreCompleto': { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [loading, setLoading] = useState(true); //Maneja estado de la solicitud
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [visible, setVisible] = useState(false); //Manejo del Dialog

  const handleScroll = () => { //Manejo del desplazo a la sección Agregar Alumnos
    document.getElementById('agregarAlumnos').scrollIntoView({ behavior: 'smooth'})
  };

  const [error, setError] = useState('');

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

  /*const handleCargarAlumnosExcel = async (e) => { //Cargar alumnos desde un archivo excel
    const file = e.target.files[0];
    if (!file) {
      console.log('No se seleccionó un archivo')
      //alert('Por favor, selecciona un archivo.');
      return;
    }
    //e.preventDefault();
    const formData = new FormData();
    formData.append('excel', file);
    console.log ('info form data', file)
    
    const allowedExtensions = /(\.xls|\.xlsx)$/;
    if (!allowedExtensions.exec(file.name)) {
        console.log('Archivo inválido')
        //alert('Por favor, selecciona un archivo válido (.xls o .xlsx).');
        return;
    }

    try {
      const response = await axios.post(`/curso/${id}/estudiantesExcel`, formData, { withCredentials: true });
      console.log('info de response', response.data)
      if (response.status === 200) {
        fetchAlumnos(); // Actualiza lista de estudiantes
      }
    }catch (err) {
      console.error('Error al agregar alumnos', err);
    }
  }*/

  useEffect(() => {
    fetchAlumnos();
  }, [id])

  const handleAgregarAlumnoConLegajo = async (e) => { //Agregar alumno con el legajo
    e.preventDefault();
    if(legajo) {
      try {
        const response = await axios.post(`/curso/${id}/estudiante`, {
        legajo: legajo }, { withCredentials: true })
        if (response.status === 201) {
          setVisible(true)
          fetchAlumnos(); //Actualiza lista de estudiantes
        }
      } catch (err) {
        console.log('Error al agregar al alumno', err)
      }
    } else {
      console.log('Por favor, ingrese un legajo')
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
  }

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
      <div className="table-header">
        {/* Icono que desplaza hacia abajo y su descripción */}
        <div>
          <OverlayTrigger overlay={
            <Tooltip id="tooltip-agregar-alumno" className='tooltip-agregar-alumno'>Agregar alumno</Tooltip>}>
            <span className="d-inline-block">
              <PiUserCirclePlusBold className='table-header-agregar-alumno-icon' data-tip='Agregar alumno' onClick={handleScroll} color='#e2ebf7' size={38}/>
            </span>
          </OverlayTrigger>
          <OverlayTrigger overlay={
            <Tooltip id="tooltip-cargar-alumnos" className='tooltip-cargar-alumnos'>Cargar alumnos</Tooltip>}>
            <span className="d-inline-block">
              <label htmlFor="file-upload" className="custom-file-upload">
                <FaRegFileExcel data-tip='Cargar alumnos' color='#e2ebf7' size={30} />
              </label>
              <input 
                  id="file-upload"
                  name='excel'
                  type="file" 
                  accept=".xlsx, .xls" 
                  style={{ display: 'none' }} 
                  //onChange={handleCargarAlumnosExcel} 
              />
            </span>
          </OverlayTrigger>
        </div>
        <IconField >
          <InputText
            className='search-input'
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
      <h5 className="text-title">Listado de alumnos</h5>
      {error && <p>{error}</p>}
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
          className='columns-data'
          field="Persona.legajo"
          header="LEGAJO"
          filter
          filterPlaceholder="Buscar por Legajo"
          filterElement={
            <input
              className='inputsFilters'
              type='text' 
              onKeyPress={handleKeyPressLegajo} 
              inputMode='numeric' 
              onChange={(e) => onFilterChange(e, 'Persona.legajo')}
            />
          }
        />
        <Column
          className='columns-data'
          field="nombreCompleto"
          header="NOMBRE COMPLETO"
          filter
          filterPlaceholder="Buscar por Nombre completo"
          filterElement={
            <input
              className='inputsFilters'
              type='text' 
              onKeyPress={handleKeyNombreApellido} 
              inputMode='text'
              onChange={(e) => onFilterChange(e, 'nombreCompleto')}
            />
          }
          sortable
        />
        <Column
            className='columns-data'
            field="mail"
            header="MAIL"
            filter
            filterPlaceholder="Buscar por mail"
            filterElement={
              <input
                  className='inputsFilters'
                  type='text'
                  inputMode='text'
              />
            }
            sortable
        />
      </DataTable>
      <h5 className="text-title">Agregar alumno</h5>
      <div className='agregar-alumnos-container' id='agregarAlumnos'>
        <div className="card-agregar-alumnos-container">
          {/* Agregar alumno manualmente */}
          <h5 className='text-description-agregar-alumno'>Con Legajo</h5>
          <FloatLabel className="input-agregar-alumnos">
            <InputText className="input-item" id="legajo" value={legajo} onKeyPress={handleKeyPressLegajo} onChange={(e) => setLegajo(e.target.value)} />
            <label className="text-input-item" htmlFor="legajo">Legajo</label>
          </FloatLabel>
          <Button className="btn-agregar-alumno" onClick={handleAgregarAlumnoConLegajo} label="Agregar" />
          <Dialog className='dialog-agregar-alumno' header="Alumno agregado" visible={visible} onHide={() => setVisible(false)}
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}>
            <p className="m-0">
              ¡Alumno con legajo {legajo} agregado con éxito!
            </p>
          </Dialog>
        </div>
        <div className="card-agregar-alumnos-container">
          {/* Generar código de vinculación */}
          <h5 className="text-description-agregar-alumno">Con código de vinculación</h5>
          <div className='generar-codigo-container'>
            { !codigoVinculacion && <InputOtp className="input-item" disabled /> }
            { codigoVinculacion && 
              <>
                <InputOtp className="input-item" readOnly value={codigoVinculacion} />
                <PiCopyBold className='clipboard-codigo-generado' onClick={copiarCodigo} size={24} />
              </>
            }
          </div>
          <Button className="btn-generar-codigo" onClick={handleGenerarCodigo} label="Generar" />
        </div>
      </div>
    </div>
  );
}

export default AlumnosCurso