import React, {useState, useEffect, useRef} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import {useNavigate, useParams} from 'react-router-dom';
import { FaSearch, FaPlus, FaCalculator, FaCheckSquare } from 'react-icons/fa';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

import axios from "axios";
import {FilterMatchMode} from "primereact/api";

export const RendimientoAlumnoProfe = () => {
    const [alumnos, setAlumnos] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [curso,setCurso] = useState(null)
    const [loading, setLoading] = useState(true);
    const dt = useRef(null);
    const navigate = useNavigate();
    const {id} = useParams()

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setGlobalFilterValue(value);
        dt.current.filter(value, 'global', 'contains');
    };

    useEffect(() => {
        const fetchAlumnos = async () => {
            try {
                const response = await axios.get(`rendimiento/alumnos/${id}`,{withCredentials:true})
                if (!response) {
                    throw new Error('Network response was not ok');
                }
                const data = response.data
                setAlumnos(data.alumnos)
                setCurso(data.curso)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching alumnos:', error);
                setLoading(false)

            }
        };

        fetchAlumnos();
    }, []);

    const header = (
        <>
            <h1 className='TituloRendimiento' style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '20px', color: '#344474' }}>Rendimiento del alumno</h1>

            <div className='containerFaltas' 
                style={{ 
                    backgroundColor: '#ccdcf1', 
                    display: 'flex', 
                    width: '100%', 
                    border: 'transparent', 
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
                    padding: '20px', 
                    borderRadius: '8px'
                }}>

                {!loading ? (<h3 className='catedraProyecto' 
                style={{ 
                    fontSize: "18px", 
                    textAlign: 'left', 
                    color: '#333', 
                    marginTop: '10px',
                    fontWeight: 'bold', 
                    alignSelf: 'center'
                }}>
                    <div>{curso.materia}</div>
                    <div>{curso.comision}</div>
                </h3>): '' }
                <span className="p-input-icon-left">
                    <FaSearch/>
                    <InputText
                        style={{marginLeft:'2em'}}
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Buscar..."

                    />
                 </span>
            </div>

        </>


    );

    const nombreCompletoTemplate = (rowData) => {
        return `${rowData.apellido}, ${rowData.nombre}`;
    };

    const onRowClick = (event) => {
        navigate(`/rendimiento/alumno/${id}/${event.data.ID}`);
    };

    return (
        <div className='contenedor-rendimiento-alumnos'>

            <DataTable
                ref={dt}
                value={alumnos}
                paginator
                rows={10}
                dataKey="ID"
                globalFilterFields={['legajo', 'nombre', 'apellido', 'notaParcialPonderada', 'notaParcialEquiponderada', 'penalidades']}
                loading={alumnos.length === 0}
                header={header}
                emptyMessage="No se encontraron alumnos"
                onRowClick={onRowClick}
                style={{cursor: 'pointer'}}
            >
                <Column field="legajo" header="Legajo" />
                <Column field="nombreCompleto" header="Nombre completo" body={nombreCompletoTemplate} sortable sortField="apellido" />
                <Column field="notaParcialPonderada" header="Nota Parcial Ponderada" sortable />
                <Column field="notaParcialEquiponderada" header="Nota Parcial Equiponderada" sortable />
                <Column field="penalidades" header="Penalidades" />
            </DataTable>
        </div>
    );
};
export default RendimientoAlumnoProfe;