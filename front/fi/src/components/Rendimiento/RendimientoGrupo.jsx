import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import {pieArcLabelClasses, PieChart} from '@mui/x-charts';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import '../styles/RendimientoAlumno.css';
import {useRole} from "../../context/RolesContext.jsx";


const RendimientoGrupo = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id,idGrupo } = useParams();
    const { role } = useRole()

    useEffect(() => {
        const fetchData = async () => {
            try {

                let response
                if (role === 'A' ){
                    response = await axios.get(`/rendimiento/grupo/${id}`, { withCredentials: true });
                }else {
                    response = await axios.get(`/rendimiento/grupo/${id}/${idGrupo}`,{ withCredentials: true });

                }

                setData(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los datos');
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <span className="badge badge-info">Cargando...</span>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return null;

    const { curso, grupo, alumnos, entregasAgrupadas } = data;

    // Datos para el gráfico de participación individual
    const participacionData = alumnos.map((alumno, index) => ({
        id: index,
        value: alumno.promedioParticipacion,
        label: alumno.nombre,
    }));



    // Calcular el total de participación
    const totalParticipacion = participacionData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className='contenedor-rendimiento-alumnos'>
            <h1 className='TituloRendimiento'>Rendimiento del Grupo</h1>

            <div >
                <Row>
                    <Col md={5}>
                        <Row>
                            <Col>
                                <span style={{
                                    fontSize: "1.3rem",
                                    textAlign: 'left',
                                    color: 'black',
                                    marginTop: '10px',
                                }}>Curso: {curso.materia} {curso.comision}</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <span style={{
                                    fontSize: "1.2rem",
                                    textAlign: 'left',
                                    color: 'black',
                                    marginTop: '10px',
                                }}>Grupo: {grupo.numero} - {grupo.nombre}</span>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col>
                                <h3>Integrantes del Grupo</h3>
                                <ul>
                                    {alumnos.map((alumno, index) => (
                                        <li key={alumno.id} style={{color: participacionData[index].color,fontSize:'1rem',listStyle:'none'}}>
                                            {alumno.legajo} - {alumno.nombre} {alumno.apellido}
                                        </li>
                                    ))}
                                </ul>
                            </Col>
                        </Row>
                    </Col>
                    <Col md={7}>
                        <Card>
                            <Card.Body>
                                <Card.Title>Participación</Card.Title>
                                <PieChart
                                    series={[{
                                        data: participacionData,
                                        highlightScope: { faded: 'global', highlighted: 'item' },
                                        faded: { innerRadius: 50, additionalRadius: -20 },
                                        arcLabel: (item) => `${item.value}%`,
                                        outerRadius: 80,
                                        cornerRadius:10,
                                        innerRadius:5
                                    }]}

                                    height={160}
                                    width={500}
                                    margin={{ top: 20, bottom: 20, left: 200, right: 300 }}

                                />

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            <div className="table-rendimiento-alumno__container mt-4">
                <table className="table-rendimiento-alumno">
                    <thead>
                    <tr>
                        <th scope="col">Instancias</th>
                        <th scope="col">Entregas</th>
                        <th scope="col">Fecha vto 1</th>
                        <th scope="col">Fecha vto 2</th>
                        <th scope="col">Fecha de entrega</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Calificación</th>
                    </tr>
                    </thead>
                    <tbody>
                    {entregasAgrupadas.map((instancia) => (
                        <React.Fragment key={instancia.id}>
                            {instancia.entregaPactada ? (
                                <tr>
                                    <th rowSpan={1} className="instancia">{instancia.nombre}</th>
                                    <td>{instancia.entregaPactada.nombre}</td>
                                    <td>{moment(instancia.entregaPactada.fechavto1).format('DD/MM/YY')}</td>
                                    <td>{instancia.entregaPactada.fechavto2 ? moment(instancia.entregaPactada.fechavto2).format('DD/MM/YY') : '-'}</td>
                                    <td>
                                        {instancia.entregas.length > 0
                                            ? moment(instancia.entregas[0].fecha).format('DD/MM/YY')
                                            : 'No entregado'}
                                    </td>
                                    <td>{instancia.estado.descripcion}</td>
                                    <td>
                                        {instancia.entregas.length > 0 ? instancia.entregas[0].nota : '-'}
                                    </td>
                                </tr>
                            ) : (
                                instancia.entregas.map((entregaInfo, index) => (
                                    <tr key={`${instancia.id}-${index}`}>
                                        {index === 0 && <th rowSpan={instancia.entregas.length} className="instancia">{instancia.nombre}</th>}
                                        <td>{entregaInfo.entregaPactada.nombre}</td>
                                        <td>{moment(entregaInfo.entregaPactada.fechavto1).format('DD/MM/YY')}</td>
                                        <td>{entregaInfo.entregaPactada.fechavto2 ? moment(entregaInfo.entregaPactada.fechavto2).format('DD/MM/YY') : '-'}</td>
                                        <td>{entregaInfo.entrega ? moment(entregaInfo.entrega.fecha).format('DD/MM/YY') : 'No entregado'}</td>
                                        <td>{entregaInfo.estado.descripcion}</td>
                                        <td>{entregaInfo.entrega?.nota ?? '-'}</td>
                                    </tr>
                                ))
                            )}
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RendimientoGrupo;