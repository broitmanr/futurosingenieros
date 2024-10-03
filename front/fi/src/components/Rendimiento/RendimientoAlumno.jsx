import '../styles/RendimientoAlumno.css'
import "bootstrap/dist/css/bootstrap.min.css";

export const RendimientoAlumno = () => {
  return (
    <div>
        <h1 className='TituloRendimiento'>
            Rendimiento del alumno
        </h1>
        <h3 className='catedraProyecto'
        style={{
          textAlign: 'left',    // Alineado a la izquierda
          color: 'black',       // Color de texto negro
          marginTop: '10px'
      }}>
        Catedra: Proyecto Final</h3>
        <h3 className='catedraProyecto'
        style={{
          textAlign: 'right',    // Alineado a la derecha
          color: 'black',       // Color de texto negro
        }}>
          Cantidad de Faltas</h3>
          
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
  );
}

export default RendimientoAlumno;
