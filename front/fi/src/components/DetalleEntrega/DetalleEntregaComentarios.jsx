
import './DetalleEntregaComentario.css'
export const DetalleEntregaComentarios = () => {
  return (
    <>
        <div className="container">
            <div className="row fila-comentarios">
                <div className="col-8 columna-pdf">

                    <div>
                        <h2 className="titulo-pdf">Administración de recursos-MariahBee-Docker</h2>
                    </div>

                    <div className="contenedor-pdf">

                    </div>
                </div>
                <div className="col-4 columna-comentarios">
                    <h2 className="titulo-comentario">Comentarios</h2>
                    <div className="contenedor-comentarios">
                        <div className="comentario">
                            <p className="comentario-texto">No citó el párrafo</p>
                            <span className="comentario-autor">Antonio Cabrera</span>
                        </div>
                        <div className="comentario">
                            <p className="comentario-texto">Se harán los cambios correspondientes</p>
                            <span className="comentario-autor">Roman Broitman</span>
                        </div>
                    </div>

                    <button className="btn-guardar-comentario">Guardar</button>
                </div>
            </div>
        </div>
    </>
  )
}
