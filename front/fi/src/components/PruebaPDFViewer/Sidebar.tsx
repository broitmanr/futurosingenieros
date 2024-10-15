import React, {useEffect, useState} from "react";
import type { Highlight } from "react-pdf-highlighter-extended";
import "./style/Sidebar.css";
import { CommentedHighlight } from "./types";
import moment from "moment/moment";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import axios from "axios";

interface SidebarProps {
  highlights: Array<CommentedHighlight>;
  resetHighlights: () => void;
  toggleDocument: () => void;
}


const updateHash = (highlight: Highlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};


// @ts-ignore
const Sidebar = ({
  highlights,
  toggleDocument,
  resetHighlights, 
  isLoading, 
  entrega
}: SidebarProps) => {
  const [nota, setNota] = useState('');
  const hasNextEntrega = entrega && entrega.nextEntrega; 

  const handleCalificar = async () => {
    try{
      const response = await axios.patch(`/entrega/calificar/${entrega.ID}`, { nota }, { withCredentials: true })
      console.log('Calificado', response.data)
    }catch(err){
      console.log('Error al calificar la entrega:', err)
    }
  }

  useEffect(() => {
    handleCalificar()
  }, [])

  return (
    <div className="sidebar" style={{ width: "30vw", maxWidth: "500px" }}>
      {/* Description section */}
      <div className="description" style={{ padding: "1rem" }}>

        {!isLoading && entrega ? (
            <>
              <h2 style={{ marginBottom: "1rem" }}>
                {entrega.nombre}
              </h2>
              <h5 className={'text-muted'} style={{fontStyle:"italic"}}>{entrega.descripcion}</h5>
              <b>Fecha de entrega: {moment(entrega.fecha).format('DD/MM/YY')}</b>
              {!entrega.nota ? (
                <>
                <div className="entrega-sincalificar-container" style={{display: 'flex', flexDirection: 'row'}}>
                  <FloatLabel style={{marginLeft: 0, marginTop: '1.5rem', margin: '1rem'}}>
                    <InputText id="nota" value={nota} onChange={(e) => setNota(e.target.value)} />
                    <label htmlFor="nota">Calificar</label>
                  </FloatLabel>
                  <Button label='Calificar' onClick={handleCalificar} style={{ marginTop: '1rem', height: '50%', backgroundColor: '#1a2035', borderRadius: '0.2rem' }} />
                </div>
                </>
              ):(
                <>
                <div className="entrega-calificada-container" style={{marginTop: '1rem', display: 'flex', flexDirection: 'column'}}>
                  <label htmlFor="nota">Calificación</label>
                  <InputText id="nota" readOnly value={entrega.nota} />
                </div>
                </>
              )}
            </>

        ) :(<h3>Cargando entrega...</h3>)}


        <p className={'mt-2'}>
          <small>
            Para marcar un area especifica mantené apretado alt y selecciona dicha area
          </small>
        </p>
      </div>
      {!isLoading && hasNextEntrega && (
        <div style={{ padding: "0.5rem" }}>
          <button onClick={toggleDocument} className="sidebar__toggle">
            Siguiente Entrega
          </button>
        </div>
      )}

      {/* Highlights list */}
      {highlights && (
        <ul className="sidebar__highlights">
          {highlights.map((highlight, index) => (
            <li
              key={index}
              className="sidebar__highlight"
              onClick={() => {
                updateHash(highlight);
              }}
            >
              <div>
                {/* Highlight comment and text */}
                <strong>{highlight.comment}</strong>
                {highlight.content.text && (
                  <blockquote style={{ marginTop: "0.5rem" }}>
                    {`${highlight.content.text.slice(0, 90).trim()}…`}
                  </blockquote>
                )}

                {/* Highlight image */}
                {highlight.content.image && (
                  <div
                    className="highlight__image__container"
                    style={{ marginTop: "0.5rem" }}
                  >
                    <img
                      src={highlight.content.image}
                      alt={"Screenshot"}
                      className="highlight__image"
                    />
                  </div>
                )}
              </div>

              <div className="container d-flex justify-content-between">
                <div className="highlight__user">
                  - {highlight.user}
                </div>
                <div className="highlight__date">
                  {highlight.date}
                </div>
              </div>
              <div className="highlight__location">
                Page {highlight.position.boundingRect.pageNumber}
              </div>
            </li>
          ))}
        </ul>
      )}



   {/*   {highlights && highlights.length > 0 && (
        <div style={{ padding: "0.5rem" }}>
          <button onClick={resetHighlights} className="sidebar__reset">
            Reset highlights
          </button>
        </div>
      )}*/}
    </div>
  );
};

export default Sidebar;
