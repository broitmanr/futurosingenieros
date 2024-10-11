import '../styles/RendimientoAlumno.css';
import "bootstrap/dist/css/bootstrap.min.css";


export const RendimientoAlumnoProfe = () => {
    return (
        <div className='contenedor-rendimiento-alumnos'>
            <h1 className='TituloRendimiento'>
                Rendimiento del alumno
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



            <div className='contenedor-acciones d-flex justify-content-between p-2'>
                <div className='buscador'>
                    <form action="" className='form-busqueda d-flex'>
                        <input type="text" name="busqueda" className='form-control' />
                        <button className='btn-buscar'><i class="fa-solid fa-magnifying-glass"></i></button>
                    </form>
                </div>
                <div className='agregar-nota'>
                    <i class="fa-solid fa-circle-plus"></i>
                    <span>Agregar Nota</span>
                </div>
                <div className='sugerir-nota'>
                    <i class="fa-solid fa-calculator"></i>
                    <span>Sugerir Nota</span>
                </div>
                <div className='cargar-asistencia'>
                    <i class="fa-regular fa-circle-play"></i>
                    <span>Cargar Asistencia</span>
                </div>
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Legajo</th>
                            <th scope="col">Nombre completo</th>
                            <th scope="col">Trabajo Integrador</th>
                            <th scope="col">Parcial</th>
                            <th scope="col">Exposicion</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">30280</th>
                            <td>MONGES LUNA, LESLIE</td>
                            <td>8</td>
                            <td>10</td>
                            <td>7</td>

                        </tr>
                        <tr>
                            <th scope="row">31086</th>
                            <td>CÁNGARO, IGNACIO GABRIEL</td>
                            <td>8</td>
                            <td>10</td>
                            <td>7</td>
                        </tr>
                        <tr>
                            <th scope="row">30735</th>
                            <td>CEJAS, AGUSTIN ARIEL</td>
                            <td>8</td>
                            <td>10</td>
                            <td>7</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
