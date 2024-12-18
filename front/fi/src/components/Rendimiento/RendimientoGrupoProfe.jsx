import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import './Rendimiento.css';
import axios from "axios";

export const RendimientoGrupoProfe = () => {
    const [grupos, setGrupos] = useState([]);
    const [curso,setCurso] = useState(null)
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [loading, setLoading] = useState(true);
    const dt = useRef(null);
    const navigate = useNavigate();
    const { id } = useParams();

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setGlobalFilterValue(value);
        dt.current.filter(value, 'global', 'contains');
    };

    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const response = await axios.get(`rendimiento/grupos/${id}`, { withCredentials: true });
                if (!response) {
                    throw new Error('Network response was not ok');
                }
                const data = response.data;
                setGrupos(data.grupos);
                setCurso(data.curso)
                setLoading(false);
            } catch (error) {
                console.error('Error fetching grupos:', error);
                setLoading(false);
            }
        };

        fetchGrupos();
    }, [id]);

    const header = (
        <>
            <h1 className='titulo-rendimiento'>Rendimiento de los grupos</h1>

            <div className='container-informacion-catedra'>
               {!loading ? (<h3 className='catedra-proyecto'>
                    <div>{curso.materia}</div>
                    <div>{curso.comision}</div>
                </h3>): '' }
                <span className="p-input-icon-left">
                    <FaSearch />
                    <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Buscar..."
                        className='input-search-alumnos'
                    />
                </span>
            </div>
        </>
    );

    const integrantesTemplate = (rowData) => {
        return rowData.integrantes.map(integrante => integrante.nombreAbreviado).join(', ');
    };

    const onRowClick = (event) => {
        navigate(`/rendimiento/grupo/${id}/${event.data.grupoID}`);
    };

    return (
        <div className='contenedor-rendimiento-alumnos'>
            {loading ? (
                <span className='badge badge-info'>Cargando...</span>
            ) : grupos.length === 0 ? (
                <span>No se encontraron grupos disponibles.</span>
            ) : (
            <DataTable
                ref={dt}
                value={grupos}
                paginator
                rows={10}
                dataKey="grupoID"
                globalFilterFields={['grupoNumero', 'grupoNombre', 'integrantes', 'cantidadEntregas', 'promedioPonderado', 'promedioEquiponderado']}
                loading={grupos.length === 0}
                header={header}
                emptyMessage="No se encontraron grupos"
                onRowClick={onRowClick}
                style={{ cursor: 'pointer' }}
            >
                <Column field="grupoNumero" header="Número" sortable />
                <Column field="grupoNombre" header="Nombre" sortable />
                <Column field="integrantes" header="Integrantes" body={integrantesTemplate} />
                <Column field="cantidadEntregas" header="Entregas" sortable />
                <Column field="promedioPonderado" header="Promedio Ponderado" sortable />
                <Column field="promedioEquiponderado" header="Promedio Equiponderado" sortable />
            </DataTable>
            )}
        </div>
    );
};

export default RendimientoGrupoProfe;