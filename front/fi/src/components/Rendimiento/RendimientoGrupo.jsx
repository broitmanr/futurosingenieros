import { PieChart } from '@mui/x-charts';
import '../styles/RendimientoAlumno.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { IoAlertCircle } from "react-icons/io5";



export const RendimientoGrupo = () => {

    return (
        <div className='contenedor-rendimiento-alumnos'>
            <h1 className='TituloRendimiento'>
                Rendimiento del Grupo
            </h1>

            <div className="info-grupo d-flex justify-content-between" style={{
                padding:"1rem",
                border:"1px solid"
            }}>

                <div className="info-fechas">
                    <p><IoAlertCircle style={{ marginRight: '5px', fontSize: '36px' }} />Próxima entrega: <span>04/11/2024</span></p>
                    <p style={{
                                border: '2px solid black', // Borde de todos los lados
                                backgroundColor: '#001f3f', // Relleno azul oscuro
                                padding: '10px', // Espaciado interno (relleno)
                                color: 'white' // Texto en blanco para contrastar con el fondo oscuro
                    }}>Días restantes: <span>8</span></p>
                </div>



                <div className="integrantes">
                    <h4>Integrantes:</h4>
                    <p>Juan Perez (384041)</p>
                    <p>Camila Sevilla (303132)</p>
                </div>

                <div className="penalidades">
                    <h4>Penalidades: 0/3</h4>
                    <PieChart
                        series={[
                            {
                                data: [
                                    { id: 0, value: 30, label: 'series A' },
                                    { id: 1, value: 30, label: 'series B' },
                                    { id: 2, value: 40, label: 'series C' },
                                ],
                            },
                        ]}
                        width={200}
                        height={100}
                    />
                </div>

            </div>

            <div className='containerFaltas'>
                <h3 className='catedraProyecto'
                    style={{
                        fontSize: "16px",
                        textAlign: 'left',    // Alineado a la izquierda
                        color: 'black',       // Color de texto negro
                        marginTop: '10px'
                    }}>
                    Catedra: Proyecto Final</h3>

            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Entrega</th>
                            <th scope="col">Fecha 1</th>
                            <th scope="col">Fecha 2</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Calificacion</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">Parcial Inicio</th>
                            <td>14/12/2024</td>
                            <td>21/12/2024</td>
                            <td>Aprobado</td>
                            <td>8</td>
                        </tr>
                        <tr>
                            <th scope="row">Trabajo Integrador</th>
                            <td>14/12/2024</td>
                            <td>21/12/2024</td>
                            <td>Aprobado</td>
                            <td>8</td>
                        </tr>
                        <tr>
                            <th scope="row">Parcial Ejecucion</th>
                            <td>14/12/2024</td>
                            <td>21/12/2024</td>
                            <td>Aprobado</td>
                            <td>8</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
