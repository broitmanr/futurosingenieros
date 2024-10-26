import './Rendimiento.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Card, Col, Row } from 'react-bootstrap';
import { PieChart } from '@mui/x-charts';
import React,{useEffect, useState} from "react";
import axios from "axios";
import {useParams} from "react-router-dom";
import moment from "moment";
import {useRole} from "../../context/RolesContext.jsx";
import { CiCalendarDate } from "react-icons/ci";
import { CiWarning } from "react-icons/ci";
import { PiUsersThreeLight } from "react-icons/pi";

const RendimientoAlumno = () => {
    const [entregas,setEntregas]=useState([])
    const [loading,setLoading]=useState(true)
    const [alumno,setAlumno] = useState(null)
    const [curso,setCurso] = useState(null)
    const [penalidades,setPenalidades] = useState(null)
    const [inasistencias,setInasistencias] = useState(null)
    const [error,setError]=useState(null)
    const {id,idAlumno} = useParams();
    const { role } = useRole()


    useEffect(() => {
        const fetchInstancias = async () => {
            try {
                let response
                if (role === 'A' ){
                    response = await axios.get(`/rendimiento/alumno/${id}`,{ withCredentials: true });
                }else {
                    response = await axios.get(`/rendimiento/alumno/${id}/${idAlumno}`,{ withCredentials: true });

                }

                setEntregas(response.data.entregasAgrupadas);
                setInasistencias(response.data.inasistencias);
                setPenalidades(response.data.penalidades);
                setCurso(response.data.curso);
                setAlumno(response.data.alumno);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los datos');
                setLoading(false);
            }
        };

        fetchInstancias();
    }, []);
  return (
    <div className='contenedor-rendimiento-alumnos'>
      <h1 className='titulo-rendimiento'>
        Rendimiento del alumno
      </h1>
    {!loading ? (
      <div className='container-informacion-catedra'>
          <Row>
              <Col>
                  <Row>
                      <Col>
                          <span className='informacion-rendimiento'>Curso: {curso.materia} {curso.comision}</span>
                      </Col>
                  </Row>
                  <Row>
                      <Col>
                          <span className='informacion-rendimiento'> {alumno.legajo} - {alumno.nombre} {alumno.apellido}</span>
                      </Col>
                  </Row>
              </Col>
          </Row>
          <Row>
              <Col className='cards-rendimiento-datos-container'>
                    <div className='card cards-rendimiento-datos'>
                        <span className='cards-rendimiento-datos-icon'><CiCalendarDate /></span>
                        <span className='cards-rendimiento-datos-text'>Inasistencias</span>
                        <span className='cards-rendimiento-datos-value'>{inasistencias}</span>
                    </div>
                    <div className='card cards-rendimiento-datos'>
                        <span className='cards-rendimiento-datos-icon'><CiWarning /></span>
                        <span className='cards-rendimiento-datos-text'>Penalidades</span>
                        <span className='cards-rendimiento-datos-value'>{penalidades}</span>
                    </div>
                    <div className='card cards-rendimiento-datos'>
                        <span className='cards-rendimiento-datos-icon'><PiUsersThreeLight /></span>
                        <span className='cards-rendimiento-datos-text'>Grupo</span>
                        <span className='cards-rendimiento-datos-value'>{alumno.grupo.numero} - {alumno.grupo.nombre}</span>
                    </div>
              </Col>
          </Row>
      </div> ) : (<span className={'badge badge-info'}>Cargando...</span>)}
        <div className={"table-rendimiento-alumno__container"}>
            <table className={"table-rendimiento-alumno"}>
                <thead>
                <tr>
                    <th scope="col">Instancias</th>
                    <th scope="col">Entregas</th>
                    <th scope="col">Fecha vto 1</th>
                    <th scope="col">Fecha vto 2</th>
                    <th scope="col">Fecha de entrega</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Calificación</th>
                    <th scope="col">Participación</th>
                </tr>
                </thead>

                {!loading ? (
                    <tbody>
                    {entregas.map((instancia) => (
                        <React.Fragment key={instancia.id}>
                            {instancia.entregas.map((entregaInfo, index) => (
                                <tr key={`${instancia.id}-${index}`}>
                                    {index === 0 && (
                                        <th
                                            rowSpan={instancia.entregas.length}
                                            className="instancia"
                                        >
                                            {instancia.nombre}
                                        </th>
                                    )}
                                    <td>{entregaInfo.entregaPactada.nombre}</td>
                                    <td>{moment(entregaInfo.entregaPactada.fechavto1).format('DD/MM/YY')}</td>
                                    <td>{entregaInfo.entregaPactada.fechavto2 ?moment(entregaInfo.entregaPactada.fechavto2).format('DD/MM/YY') : '-' }</td>
                                    <td>{entregaInfo.entrega ? moment(entregaInfo.entrega.fecha).format('DD/MM/YY') : 'No entregado'}</td>
                                    <td>{entregaInfo.estado.descripcion}</td>
                                    <td>{entregaInfo.entrega?.nota ?? '-'}</td>
                                    <td>{entregaInfo.entrega?.porcentaje_participacion ?? 'No registra'}%</td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                    </tbody>
                ) : (<span className={'badge badge-info'}>Cargando...</span>)}
            </table>
        </div>
    </div>
  );
}

export default RendimientoAlumno;
