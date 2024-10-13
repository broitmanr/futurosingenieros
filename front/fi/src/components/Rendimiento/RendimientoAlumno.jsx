import '../styles/RendimientoAlumno.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { PieChart } from '@mui/x-charts';
import React,{useEffect, useState} from "react";
import axios from "axios";
import {useParams} from "react-router-dom";
import moment from "moment";
import {useRole} from "../../context/RolesContext.jsx";

const RendimientoAlumno = () => {
    const [entregas,setEntregas]=useState([])
    const [loading,setLoading]=useState(true)
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

                setEntregas(response.data);
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
      <h1 className='TituloRendimiento'>
        Rendimiento del alumno
      </h1>

      <div className='containerFaltas'>
        <h3 className='catedraProyecto'
          style={{
            fontSize: "24px",
            textAlign: 'left',    // Alineado a la izquierda
            color: 'black',       // Color de texto negro
            marginTop: '10px',
          }}>
          Catedra: Proyecto Final</h3>

        {/*<div className="penalidades text-center">*/}
        {/*  <PieChart className='mx-auto'*/}
        {/*    series={[*/}
        {/*      {*/}
        {/*        data: [*/}
        {/*          { id: 0, value: 40, color: 'green'},*/}
        {/*          { id: 1, value: 10, color: 'red' },*/}
        {/*          { id: 2, value: 50, color: 'green'},*/}
        {/*        ],*/}
        {/*      },*/}
        {/*    ]}*/}
        {/*    width={200}*/}
        {/*    height={100}*/}
        {/*    style={{ marginBottom: '20px' }}*/}
        {/*  />*/}
        {/*  <h4>Penalidades: 1/3</h4>*/}
        {/*</div>*/}

        <h3 className='titulo-inasistencias'
        style={{
          fontSize: "20px",
        }}>
          Cantidad de Inasistencias: 9</h3>
      </div>
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
                                    <td>{entregaInfo.entregaPactada.fechavto2 ?moment(entregaInfo.entregaPactada.fechavto1).format('DD/MM/YY') : '-' }</td>
                                    <td>{entregaInfo.entrega ? moment(entregaInfo.entrega.fecha).format('DD/MM/YY') : 'No entregado'}</td>
                                    <td>{entregaInfo.estado.descripcion}</td>
                                    <td>{entregaInfo.entrega?.nota ?? '-'}</td>
                                    <td>{entregaInfo.entrega?.porcentaje_participacion ?? 'N/A'}%</td>
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
