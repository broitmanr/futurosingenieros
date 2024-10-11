import '../styles/RendimientoAlumno.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { PieChart } from '@mui/x-charts';

const RendimientoAlumno = () => {
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

        <div className="penalidades text-center">
          <PieChart className='mx-auto'
            series={[
              {
                data: [
                  { id: 0, value: 33, color: 'green'},
                  { id: 1, value: 33, color: 'red' },
                  { id: 2, value: 34, color: 'green'},
                ],
              },
            ]}
            width={200}
            height={100}
            style={{ marginBottom: '20px' }}
          />
          <h4>Penalidades: 1/3</h4>
        </div>

        <h3 className='titulo-inasistencias'
        style={{
          fontSize: "20px",
        }}>
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
