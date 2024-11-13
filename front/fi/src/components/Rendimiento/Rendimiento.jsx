import React, { useState, useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import {Link, useParams} from 'react-router-dom';
import { useRole } from '../../context/RolesContext';
import './Rendimiento.css'
import RendimientoAlumno from './RendimientoAlumno';
import RendimientoGrupo from './RendimientoGrupo';
import { RendimientoGrupoProfe } from './RendimientoGrupoProfe';
import { RendimientoAlumnoProfe } from './RendimientoAlumnoProfe';
import Asistencia from "./Asistencia.jsx";
import {BreadCrumb} from "primereact/breadcrumb";
import axios from "axios";
import {AiOutlineHome} from "react-icons/ai";

function Rendimiento() {
    const { id } = useParams(); //Obtiene el id del curso pasado por parámetro
    const [curso, setCurso] = useState(null);
    const { role } = useRole()
    console.log('El rol del usuario logeado es: ' + role);
    const [legajo, setLegajo] = useState(''); //Estado para el legajo
    const [total_inasistencias, SetTotalInasistencias] = useState('')
    const [alumnos, setAlumnos] = useState([]); //Estado para el listado de alumnos
    const [loading, setLoading] = useState(true); //Maneja estado de la solicitud

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
        {template: () => <a className="item-path-recursos">Rendimiento</a>  }
    ]: [];
    const home = { icon: <AiOutlineHome size={22} color='#1a2035' />, url: ('/cursos') }

    return (
        <div className='rendimiento-container'>
            {curso ? (
                <>
                    <div className='breadscrumb-container'>
                        <BreadCrumb className='entrega-detalle-breadcrumb' model={items} home={home} />
                    </div>
                    <div className='banner-recursos py-4'>
                        <h1 className='nombre-materia'>Rendimiento</h1>
                        <p className='nombre-comision'>{curso.Materium.nombre} {curso.Comision.nombre}</p>
                    </div>
                </>
            ):(
                <div>Cargando...</div>
            )}
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