import React, {useState, useEffect} from 'react'; 
import { TabView, TabPanel } from 'primereact/tabview';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { IconField } from 'primereact/iconfield';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { useParams } from 'react-router-dom';
import { useRole } from '../../context/RolesContext';
import axios from 'axios';
import './Rendimiento.css'

function Rendimiento() {
    const { id } = useParams(); //Obtiene el id del curso pasado por parámetro
    const { role } = useRole()
    const [legajo, setLegajo] = useState(''); //Estado para el legajo
    const [alumnos, setAlumnos] = useState([]); //Estado para el listado de alumnos
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'Persona.legajo': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        'nombreCompleto': { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [loading, setLoading] = useState(true); //Maneja estado de la solicitud
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const fetchAlumnos = async () => {
        try{
          const response = await axios.get(`/curso/${id}/miembros`, { withCredentials: true }) //Obteniene a todos los miembros
          if(response.data) {
            const soloAlumnos = response.data.filter(participante => participante.rol === 'A'); //Filtra alumnos
            const alumnosNombreCompleto = soloAlumnos.map(alumno => ({
              ...alumno,
              nombreCompleto: `${alumno.Persona.apellido}, ${alumno.Persona.nombre}`
            }))
            setAlumnos(alumnosNombreCompleto)
            setLoading(false)
          }
        } catch (err) {
          console.error('Error al obtener los alumnos', err)
          setAlumnos(dataAlumnos)
          setLoading(false)
        }
      }
      useEffect(() => {
        fetchAlumnos();
      }, [id])

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

    const onCellEditComplete = async (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;

        switch (field) {
            case 'inasistencias':
                if (isPositiveInteger(newValue)){
                    rowData[field] = newValue;
                    console.log(rowData)
                    try{
                        await axios.post(`/inasistencia/curso/${id}`, 
                            {
                                inasistencias: {[rowData.persona_id]: newValue}
                            },
                        {withCredentials: true})
                        
                    } catch (err){
                        console.log('Error al registrar asistencia:', err)
                    }
                }else{
                    event.preventDefault();
                } 
                break;
            default:
                event.preventDefault();
                break;
        }
    };

    const cellEditor = (options) => {
        if (options.field === 'inasistencias') {
            return textEditor(options);
        }
        return null
    };

    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />;
    };

    const onGlobalFilterChange = (e) => { //Buscador general
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
          <div className="table-header-asistencia">
            <IconField >
              <InputText
                className='search-input-asistencia'
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
        <div className='rendimiento-container'>
            <div>
                <TabView className="tabs-container">
                    <TabPanel className='tab-header-text' header="Alumnos">
                        <p className="m-0">
                            Acá va el rendimiento del alumno
                        </p>
                    </TabPanel>
                    <TabPanel className='tab-header-text' header="Grupos">
                        <p className="m-0">
                            Acá va el rendimiento del grupo
                        </p>
                    </TabPanel>
                    { role === 'D' &&
                    <TabPanel className='tab-header-text' header="Asistencia">
                        <DataTable
                            value={alumnos}
                            paginator rows={10}
                            dataKey="ID"
                            filters={filters}
                            globalFilterFields={['Persona.legajo', 'Persona.nombre', 'Persona.apellido']}
                            header={header}
                            loading={loading}
                            emptyMessage="Lo siento, no se encontraron alumnos."
                            className='custom-datatable-asistencia'
                            editMode="cell"
                        >
                        <Column
                            className='columns-data-asistencia'
                            field="Persona.legajo"
                            header="LEGAJO"
                        />
                        <Column
                            className='columns-data-asistencia'
                            field="nombreCompleto"
                            header="NOMBRE"
                            sortable
                        />
                        <Column
                            className='columns-data-asistencia'
                            field="inasistencias"
                            header="INASISTENCIAS"
                            editor={(options) => cellEditor(options)} onCellEditComplete={onCellEditComplete}
                        />
                        </DataTable>
                    </TabPanel>
                    }
                </TabView>
            </div>
        </div>
    )
}

export default Rendimiento