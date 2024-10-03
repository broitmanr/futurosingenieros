import '../styles/RendimientoAlumno.css';
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
        <div className='containerFaltas'>
        <h3
        style={{
          textAlign:'right',           // Alineado a la derecha
          color: 'black',
          backgroundColor: '#193B70',  // Fondo claro
          padding: '20px 20px',        // Espacio interno
          border: '2px solid #4A90E2', // Borde azul
          borderRadius: '15px',        // Bordes redondeados
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Sombra
          display: 'inline-block',     // Para ajustar el recuadro al tamaño del texto
          margin: '10px 0'             // Margen superior e inferior
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
