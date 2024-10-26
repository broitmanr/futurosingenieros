import React, { useState, useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { useParams } from 'react-router-dom';
import { useRole } from '../../context/RolesContext';
import './Rendimiento.css'
import RendimientoAlumno from './RendimientoAlumno';
import RendimientoGrupo from './RendimientoGrupo';
import { RendimientoGrupoProfe } from './RendimientoGrupoProfe';
import { RendimientoAlumnoProfe } from './RendimientoAlumnoProfe';
import Asistencia from "./Asistencia.jsx";

function Rendimiento() {
    const { id } = useParams(); //Obtiene el id del curso pasado por parámetro
    const { role } = useRole()
    console.log('El rol del usuario logeado es: ' + role);
    const [legajo, setLegajo] = useState(''); //Estado para el legajo
    const [total_inasistencias, SetTotalInasistencias] = useState('')
    const [alumnos, setAlumnos] = useState([]); //Estado para el listado de alumnos
    const [loading, setLoading] = useState(true); //Maneja estado de la solicitud

    return (

        <div className='rendimiento-container'>
            <div>
                <TabView className="tabs-container">
                    <TabPanel className='tab-header-text' header="Alumnos">
                        {
                            role === 'D'
                                ?
                                <RendimientoAlumnoProfe />
                                :
                                <RendimientoAlumno />
                        }

                    </TabPanel>
                    <TabPanel className='tab-header-text' header="Grupos">
                        {
                            role === 'D'
                                ?
                                <RendimientoGrupoProfe />
                                :
                                <RendimientoGrupo />
                        }

                    </TabPanel>
                    {role === 'D' &&
                        <TabPanel className='tab-header-text' header="Asistencia">
                            <Asistencia />
                        </TabPanel>
                    }
                </TabView>
            </div>
        </div>
    )
}

export default Rendimiento