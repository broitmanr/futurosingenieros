import "bootstrap/dist/css/bootstrap.min.css";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { FaSearch } from 'react-icons/fa';
import { PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FilterMatchMode } from "primereact/api";
import './Rendimiento.css';

const Asistencia = () => {
    const { id } = useParams(); // Obtiene el id del curso pasado por parámetro
    const [alumnos, setAlumnos] = useState([]); // Estado para el listado de alumnos
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        'Persona.legajo': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        'nombreCompleto': { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [loading, setLoading] = useState(true); // Estado de carga inicial
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [loadingRow, setLoadingRow] = useState(null); // Para identificar la fila en proceso

    // Cargar los alumnos al montar el componente
    useEffect(() => {
        const fetchAlumnos = async () => {
            try {
                const response = await axios.get(`/curso/${id}/miembros`, { withCredentials: true });
                if (response.data) {
                    const alumnosData = response.data
                        .filter(participante => participante.rol === 'A') // Filtrar solo alumnos
                        .map(alumno => ({
                            ...alumno,
                            nombreCompleto: `${alumno.Persona.apellido}, ${alumno.Persona.nombre}`,
                            inasistencias: alumno.Persona.total_inasistencias,
                        }));
                    setAlumnos(alumnosData);
                }
            } catch (err) {
                console.error('Error al obtener los alumnos', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlumnos();
    }, [id]);

    const isPositiveInteger = (val) => /^[1-9]\d*$/.test(val); // Validar que sea un entero positivo

    // Manejo de edición de celda
    const onCellEditComplete = async (e) => {
        const { rowData, newValue, field, originalEvent: event } = e;

        if (field === 'inasistencias' && isPositiveInteger(newValue)) {
            const oldValue = rowData[field];
            try {
                const response = await axios.patch(
                    `/inasistencia/editar`,
                    {
                        curso_id: id,
                        persona_id: rowData.persona_id,
                        cantidad: newValue
                    },
                    { withCredentials: true }
                );

                if (response.status === 200) {
                    // Actualizar el estado de `alumnos` en lugar de modificar `rowData` directamente
                    setAlumnos(prevAlumnos =>
                        prevAlumnos.map(alumno =>
                            alumno.persona_id === rowData.persona_id
                                ? { ...alumno, [field]: newValue }
                                : alumno
                        )
                    );
                } else {
                    event.preventDefault(); // Evita la actualización visual si falla
                }
            } catch (err) {
                console.error("Error al registrar asistencia:", err);
                event.preventDefault(); // Revertir el valor en caso de error
            }
        } else {
            event.preventDefault(); // Evita valores no válidos
        }
    };

    // Editor de celda personalizado para el campo `inasistencias`
    const textEditor = (options) => (
        <InputText
            type="text"
            value={options.value}
            onChange={(e) => options.editorCallback(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
        />
    );

    // Manejo de click en el botón "Agregar" para incrementar inasistencias
    const handleAddClick = async (rowData) => {
        setLoadingRow(rowData.persona_id); // Bloquear la fila
        try {
            const response = await axios.post(
                `/inasistencia/incrementar`,
                {
                    curso_id: id,
                    persona_id: rowData.persona_id,
                },
                { withCredentials: true }
            );

            if (response.status === 200) {
                setAlumnos(prevAlumnos =>
                    prevAlumnos.map(alumno =>
                        alumno.persona_id === rowData.persona_id
                            ? { ...alumno, inasistencias: response.data.inasistencia }
                            : alumno
                    )
                );
            }
        } catch (error) {
            console.error("Error al incrementar la inasistencia:", error);
        } finally {
            setLoadingRow(null); // Desbloquea el botón después de la respuesta
        }
    };

    // Botón de incremento con spinner de carga
    const addButtonTemplate = (rowData) => {
        const isRowLoading = loadingRow === rowData.persona_id;
        return (
            <div
                onClick={() => handleAddClick(rowData)}
                disabled={isRowLoading}
                style={{ cursor: isRowLoading ? "not-allowed" : "pointer" }}
            >
                {isRowLoading ? <ProgressSpinner style={{ width: '1.5rem', height: '1.5rem' }} /> : <PlusIcon />}
            </div>
        );
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters((prevFilters) => ({
            ...prevFilters,
            global: { ...prevFilters.global, value },
        }));
        setGlobalFilterValue(value);
    };

    const renderHeader = () => (
        <div className="table-header-asistencia">
            <span className="p-input-icon-left">
                <FaSearch />
                <InputText
                    className="input-search-alumnos"
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Buscador general"
                />
            </span>
        </div>
    );

    const header = renderHeader();

    return (
        <div className="contenedor-rendimiento-alumnos">
            <h1 className="titulo-rendimiento">Asistencia de los alumnos</h1>
            <DataTable
                value={alumnos}
                paginator rows={10}
                dataKey="persona_id"
                filters={filters}
                globalFilterFields={['Persona.legajo', 'nombreCompleto']}
                header={header}
                loading={loading}
                emptyMessage="Lo siento, no se encontraron alumnos."
                className="custom-datatable-asistencia"
                editMode="cell"
            >
                <Column
                    className="columns-data-asistencia"
                    field="Persona.legajo"
                    header="LEGAJO"
                />
                <Column
                    className="columns-data-asistencia"
                    field="nombreCompleto"
                    header="NOMBRE"
                    sortable
                />
                <Column
                    className="columns-data-asistencia"
                    field="inasistencias"
                    header="INASISTENCIAS"
                    body={(rowData) => rowData.inasistencias}
                    editor={(options) => textEditor(options)}
                    onCellEditComplete={onCellEditComplete}
                    sortable
                />
                <Column
                    className="columns-data-asistencia__sum"
                    header="AGREGAR"
                    align="center"
                    body={addButtonTemplate}
                />
            </DataTable>
        </div>
    );
};

export default Asistencia;
