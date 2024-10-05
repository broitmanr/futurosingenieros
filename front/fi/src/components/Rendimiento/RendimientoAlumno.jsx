import '../styles/RendimientoAlumno.css';
import "bootstrap/dist/css/bootstrap.min.css";

export const RendimientoAlumno = () => {
  return (
    <div className='contenedor-rendimiento-alumnos'>
      <h1 className='TituloRendimiento'>
        Rendimiento del alumno
      </h1>

      <div className='containerFaltas'>
        <h3 className='catedraProyecto'
          style={{
            fontSize:"16px",
            textAlign: 'left',    // Alineado a la izquierda
            color: 'black',       // Color de texto negro
            marginTop: '10px'
          }}>
          Catedra: Proyecto Final</h3>
        <h3 className='titulo-inasistencias'>
          Cantidad de Inasistencias: 9</h3>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Instancias</th>
              <th scope="col">Estado</th>
              <th scope="col">Calificacion</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Parcial Inicio</th>
              <td>Aprobado</td>
              <td>8</td>
            </tr>
            <tr>
              <th scope="row">Trabajo Integrador</th>
              <td>Modificar</td>
              <td>Sin calificar</td>
            </tr>
            <tr>
              <th scope="row">Parcial Ejecucion</th>
              <td>desaprobado</td>
              <td>2</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RendimientoAlumno;
