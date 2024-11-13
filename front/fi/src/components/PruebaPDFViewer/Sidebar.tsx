import React, { useEffect, useState, useRef } from "react";
import type { Highlight } from "react-pdf-highlighter-extended";
import "./style/Sidebar.css";
import { CommentedHighlight } from "./types";
import moment from "moment/moment";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import axios from "axios";
import { useRole } from "../../context/RolesContext";
import Avatar from "@mui/material/Avatar";
import { TextareaAutosize } from "@mui/material";
import { Toast } from 'primereact/toast';

interface SidebarProps {
  highlights: Array<CommentedHighlight>;
  resetHighlights: () => void;
  toggleDocument: () => void;
  isLoading: boolean;
  entrega: any;
  onHighlightsUpdate: (highlights: Array<CommentedHighlight>) => void; // Nueva prop
}

interface ReplyState {
  highlightId: string | null;
  replyText: string;
}

const updateHash = (highlight: Highlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

const Sidebar = ({
                   highlights,
                   toggleDocument,
                   resetHighlights,
                   isLoading,
                   entrega,
                   onHighlightsUpdate // Nueva prop
                 }: SidebarProps) => {
  const [nota, setNota] = useState('');
  const [replyState, setReplyState] = useState<ReplyState>({
    highlightId: null,
    replyText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasNextEntrega = entrega && entrega.nextEntrega;
  const { role } = useRole();
  const toastRef = useRef(null)

  const handleCalificar = async () => {
    try {
      const response = await axios.patch(
          `/entrega/calificar/${entrega.ID}`,
          { nota },
          { withCredentials: true }
      )
      if(response.status===200){
        toastRef.current.show({ severity: 'success', summary: 'Éxito', detail: 'Entrega calificada con éxito', life: 3000 })
      }
      console.log('Calificado', response.data);
    } catch (err) {
      console.log('Error al calificar la entrega:', err);
    }
  };

  const handleReplyClick = (highlightId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setReplyState(prev => ({
      highlightId: prev.highlightId === highlightId ? null : highlightId,
      replyText: ''
    }));
  };

  const handleReplySubmit = async (highlightId: string) => {
    if (!replyState.replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
          `/archivo/comentario/responder/${highlightId}`,
          { comment: replyState.replyText },
          { withCredentials: true }
      );

      // Crear el nuevo objeto de respuesta
      const newAnswer = {
        id: response.data.ID, // Asegúrate de que coincida con la estructura de tu respuesta
        comentario: replyState.replyText,
        usuario: response.data.usuario,
        mine: true,
        fecha: response.data.fecha
      };

      // Crear nueva lista de highlights actualizada
      const updatedHighlights = highlights.map(highlight => {
        if (highlight.id === highlightId) {
          return {
            ...highlight,
            answers: [...(highlight.answers || []), newAnswer]
          };
        }
        return highlight;
      });

      // Actualizar los highlights usando la prop onHighlightsUpdate
      onHighlightsUpdate(updatedHighlights);

      // Limpiar el formulario
      setReplyState({
        highlightId: null,
        replyText: ''
      });
    } catch (err) {
      console.error('Error al enviar la respuesta:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReplyForm = (highlightId: string) => {
    if (replyState.highlightId !== highlightId) return null;

    return (
        <div className="reply-form" onClick={(e) => e.stopPropagation()}>
          <TextareaAutosize
              value={replyState.replyText}
              onChange={(e) => setReplyState(prev => ({ ...prev, replyText: e.target.value }))}
              placeholder="Tu respuesta..."
              className="answer__input mb-2"
          />
          <div className="flex justify-end gap-2">
            <Button
                icon="pi pi-times"
                rounded
                className="answer__cancelar"
                onClick={(e) => {
                  e.stopPropagation();
                  setReplyState({ highlightId: null, replyText: '' });
                }}
            />
            <Button
                rounded
                icon="pi pi-check"
                label="Enviar"
                className="answer__confirmar"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplySubmit(highlightId);
                }}
                loading={isSubmitting}
            />
          </div>
        </div>
    );
  };

  return (
      <>
      <Toast ref={toastRef} />
      <div className="sidebar">
        {/* Description section */}
        <div className="sidebar-descripcion">
          {!isLoading && entrega ? (
              <>
                <h2 className="sidebar-entrega-nombre">
                  {entrega.nombre}
                </h2>
                <h5 className='sidebar-entrega-descripcion'>{entrega.descripcion}</h5>
                <b>Fecha de entrega: {moment(entrega.fecha).format('DD/MM/YY')}</b>
                {role === 'D' && !entrega.nota ? (
                    <>
                      <div className="entrega-sincalificar-container">
                        <FloatLabel className='entrega-sin-calificar-floatlabel'>
                          <InputText id="nota" value={nota} onChange={(e) => setNota(e.target.value)} />
                          <label htmlFor="nota">Calificar</label>
                        </FloatLabel>
                        <Button className="entrega-sin-calificar-btn" label='Calificar' onClick={handleCalificar} />
                      </div>
                    </>
                ): role === 'D' && (
                    <>
                      <div className="entrega-calificada-container">
                        <label htmlFor="nota">Calificación</label>
                        <InputText id="nota" readOnly value={entrega.nota} />
                      </div>
                    </>
                )}
              </>
          ) :(<h3>Cargando entrega...</h3>)}
          <p className={'mt-2'}>
            <small>
              Para marcar un área en específico mantené apretado alt y seleccioná dicha área
            </small>
          </p>
        </div>
        {!isLoading && entrega && (entrega.archivos.length > 1) && (
            <div className="siguiente-entrega-container">
              <button onClick={toggleDocument} className="sidebar__toggle">
                Siguiente Entrega
              </button>
            </div>
        )}

        {highlights && (
            <ul className="sidebar__highlights">
              {highlights.map((highlight) => (
                  <li
                      key={highlight.id}
                      className="sidebar__highlight comment-bubble-container"
                      onClick={() => updateHash(highlight)}
                  >
                    <div className={`comment-bubble ${highlight.mine ? 'mine' : 'not-mine'}`}>
                      <div className="comment-header">
                        <Avatar
                            className="user-avatar"
                            style={{ width: '1.3em', height: '1.3em' }}
                        />
                        <span className="user-name">{highlight.user}</span>
                      </div>
                      <div className="comment-content">
                        <strong>{highlight.comment}</strong>
                        {highlight.content.text && (
                            <blockquote>
                              {`${highlight.content.text.slice(0, 90).trim()}…`}
                            </blockquote>
                        )}

                        {highlight.content.image && (
                            <div className="highlight__image__container">
                              <img
                                  src={highlight.content.image}
                                  alt="Screenshot"
                                  className="highlight__image"
                              />
                            </div>
                        )}
                      </div>

                      <div className="comment-footer">
                        <div className="highlight__date">{highlight.date}</div>
                        <div
                            className="highlight__responder"
                            onClick={(e) => handleReplyClick(highlight.id, e)}
                        >
                          <span>Responder</span>
                        </div>
                        <div className="highlight__location">
                          Page {highlight.position.boundingRect.pageNumber}
                        </div>
                      </div>

                      {renderReplyForm(highlight.id)}

                      {highlight.answers && highlight.answers.length > 0 && (
                          <div className="comment-footer">
                            <ul className="answers">
                              {highlight.answers.map((answer) => (
                                  <li key={answer.id} className="answer-bubble-container">
                                    <div
                                        className={`answer-bubble ${
                                            answer.mine ? 'mine' : 'not-mine'
                                        }`}
                                    >
                                      <div className="answer-header">
                              <span className="user-name__answer">
                                {answer.usuario}
                              </span>
                                        <span className="answer__date">
                                {new Date(answer.fecha).toLocaleString()}
                              </span>
                                      </div>
                                      <div className="answer-content">
                                        <span>{answer.comentario}</span>
                                      </div>
                                    </div>
                                  </li>
                              ))}
                            </ul>
                          </div>
                      )}
                    </div>
                  </li>
              ))}
            </ul>
        )}
      </div>
    </>
  );
};

export default Sidebar;