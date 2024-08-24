import React, { useState, useEffect } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { AlumnosDatos } from './dataAlumnos'; //Se importan los datos de prueba
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import './AlumnosCurso.css' //Se importan los estilos

function AlumnosCurso() {
  const [alumnos, setAlumnos] = useState(null);
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