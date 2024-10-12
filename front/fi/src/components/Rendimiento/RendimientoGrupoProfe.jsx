import { PieChart } from '@mui/x-charts';
import { IoAlertCircle } from "react-icons/io5";
import '../styles/RendimientoAlumno.css';
import "bootstrap/dist/css/bootstrap.min.css";


export const RendimientoGrupoProfe = () => {
    return (
        <div className='contenedor-rendimiento-alumnos'>
            <h1 className='TituloRendimiento'>
                Rendimiento del Grupo
            </h1>


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
                            <th scope="col">Grupo</th>
                            <th scope="col">Legajos</th>
                            <th scope="col">Integrantes</th>
                            <th scope="col">Email</th>
                            <th scope="col">Entrega</th>
                            <th scope="col">Fecha 1</th>
                            <th scope="col">Fecha 2</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Calificacion</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">
                                <span className='me-3'>1</span>
                                <input type="radio" name="grupo" id="" />
                            </th>
                            <td>
                                <p className="mb-0">30876</p>
                                <p className="mb-0">30280</p>
                                <p className="mb-0">30200</p>
                            </td>
                            <td>
                                <p className="mb-0">Juan Perez</p>
                                <p className="mb-0">Leslie Monges</p>
                                <p className="mb-0">Maria Rodriguez</p>
                            </td>
                            <td>
                                <p className="mb-0">juanperez@alu.frlp.utn.edu.ar</p>
                                <p className="mb-0">lesliemonges@alu.frlp.utn.edu.ar</p>
                                <p className="mb-0">Mariarodriguez@gmail.com</p>
                            </td>
                            <td>Gestion del cronograma</td>
                            <td>14/12/2024</td>
                            <td>21/12/2024</td>
                            <td>Aprobado</td>
                            <td>8</td>
                        </tr>
                        <tr>
                        <th scope="row">
                                <span className='me-3'>1</span>
                                <input type="radio" name="grupo" id="" />
                            </th>
                            <td>
                                <p className="mb-0">30876</p>
                                <p className="mb-0">30280</p>
                                <p className="mb-0">30200</p>
                            </td>
                            <td>
                                <p className="mb-0">Juan Perez</p>
                                <p className="mb-0">Leslie Monges</p>
                                <p className="mb-0">Maria Rodriguez</p>
                            </td>
                            <td>
                                <p className="mb-0">juanperez@alu.frlp.utn.edu.ar</p>
                                <p className="mb-0">lesliemonges@alu.frlp.utn.edu.ar</p>
                                <p className="mb-0">Mariarodriguez@gmail.com</p>
                            </td>
                            <td>Gestion del cronograma</td>
                            <td>14/12/2024</td>
                            <td>21/12/2024</td>
                            <td>Aprobado</td>
                            <td>8</td>
                        </tr>
                        <tr>
                        <th scope="row">
                                <span className='me-3'>1</span>
                                <input type="radio" name="grupo" id="" />
                            </th>
                            <td>
                                <p className="mb-0">30876</p>
                                <p className="mb-0">30280</p>
                                <p className="mb-0">30200</p>
                            </td>
                            <td>
                                <p className="mb-0">Juan Perez</p>
                                <p className="mb-0">Leslie Monges</p>
                                <p className="mb-0">Maria Rodriguez</p>
                            </td>
                            <td>
                                <p className="mb-0">juanperez@alu.frlp.utn.edu.ar</p>
                                <p className="mb-0">lesliemonges@alu.frlp.utn.edu.ar</p>
                                <p className="mb-0">Mariarodriguez@gmail.com</p>
                            </td>
                            <td>Gestion del cronograma</td>
                            <td>14/12/2024</td>
                            <td>21/12/2024</td>
                            <td>Aprobado</td>
                            <td>8</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
