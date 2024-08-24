import React, { useState, useEffect } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { FloatLabel } from 'primereact/floatlabel'; //Se importa componente para agregar al alumno
import { Button } from 'primereact/button';
import { AlumnosDatos } from './dataAlumnos'; //Se importan los datos de prueba
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import './AlumnosCurso.css' //Se importan los estilos

function AlumnosCurso() {
  //Estados para agregar un alumno
  const [legajo, setLegajo] = useState(''); //Estado para el legajo
  const [nombre, setNombre] = useState(''); //Estado para el nombre
  const [apellido, setApellido] = useState(''); //Estado para el apellido
  const [alumnos, setAlumnos] = useState(null); //Estado para el listado de alumnos
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    legajo: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    apellido: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  useEffect(() => {
    try{
      const data = AlumnosDatos.getData();
      setAlumnos(data);
    } catch (error) {
      console.log('Error', error);
    }finally{
      setLoading(false);
    }
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="table-header">
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
      <h5 className="text-title">Agregar alumno</h5>
      <div className="card-agregar-alumnos-container">
        <FloatLabel className="inputs-agregar-alumnos">
          <InputText className="input-item" id="legajo" value={legajo} onChange={(e) => setLegajo(e.target.value)} />
          <label className="text-input-item" for="legajo">Legajo</label>
        </FloatLabel>
        <FloatLabel className="inputs-agregar-alumnos">
          <InputText className="input-item" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <label className="text-input-item" for="nombre">Nombre</label>
        </FloatLabel>
        <FloatLabel className="inputs-agregar-alumnos">
          <InputText className="input-item" id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          <label className="text-input-item" for="apellido">Apellido</label>
        </FloatLabel>
        <Button className="btn-agregar-alumno" label="Agregar" icon="pi pi-check" />
      </div>
      <h5 className="text-title">Listado de alumnos</h5>
      <DataTable
        value={alumnos}
        paginator rows={10}
        dataKey="id"
        filters={filters}
        filterDisplay="row"
        loading={loading}
        globalFilterFields={['legajo', 'nombre', 'apellido']}
        header={header}
        emptyMessage="Lo siento, no se encontraron alumnos."
        className='custom-datatable'
      >
        <Column
          className='columns-data'
          field="legajo"
          header="Legajo"
          filter
          filterPlaceholder="Buscar por Legajo"
        />
        <Column
          className='columns-data'
          field="nombre"
          header="Nombre"
          filter
          filterPlaceholder="Buscar por Nombre"
          sortable
        />
        <Column
          className='columns-data'
          field="apellido"
          header="Apellido"
          filter
          filterPlaceholder="Buscar por Apellido"
          sortable
        />
      </DataTable>
    </div>
  );
}

export default AlumnosCurso