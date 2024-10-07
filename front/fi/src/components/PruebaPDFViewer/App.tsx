import React, { MouseEvent, useEffect, useRef, useState } from "react";
import CommentForm from "./CommentForm";
import ContextMenu, { ContextMenuProps } from "./ContextMenu";
import ExpandableTip from "./ExpandableTip";
import HighlightContainer from "./HighlightContainer";
import Sidebar from "./Sidebar";

import {
    GhostHighlight,
    Highlight,
    PdfHighlighter,
    PdfHighlighterUtils,
    PdfLoader,
    Tip,
    ViewportHighlight,
} from "react-pdf-highlighter-extended";
import "./style/App.css";
import { CommentedHighlight } from "./types";
import axios from "axios";
import {useParams} from "react-router-dom";

const PRIMARY_PDF_URL = "http://localhost:5000/api/archivo/";

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () => {
    return document.location.hash.slice("#highlight-".length); // Extrae el ID desde el hash
};

const resetHash = () => {
    document.location.hash = "";
};

const App = () => {
    const [url, setUrl] = useState<string | null>(null); // URL del PDF
    const [entrega, setEntrega] = useState<any | null>(null);
    const [highlights, setHighlights] = useState<Array<CommentedHighlight>>([]);
    const currentPdfIndexRef = useRef(0);
    const [contextMenu, setContextMenu] = useState<ContextMenuProps | null>(null);
    const highlighterUtilsRef = useRef<PdfHighlighterUtils>();
    const [archivos, setArchivos] = useState<string[]>([]); // Lista de archivos PDF
    const [isLoading, setIsLoading] = useState(true); // Estado para manejar la carga del PDF
    const [highlightPen, setHighlightPen] = useState<boolean>(false); // Controlar si el usuario está seleccionando texto para resaltar
    const [currentArchivoId, setCurrentArchivoId] = useState<string | null>(null); // Almacena el ID del archivo actual
    const [currentArchivoIndex, setCurrentArchivoIndex] = useState(0); // Índice del archivo actual
    const [error,setError] = useState<string|null>(null)
    const { id } = useParams();

    useEffect(() => {
        const fetchEntrega = async () => {
            try {
                const response = await axios.get(`/entrega/${id}`, { withCredentials: true });
                setEntrega(response.data)
            } catch (error) {
                console.error("Error al obtener la entrega:", error);
                setError(error.response.data.error.details)
            } finally {
                setIsLoading(false); // Marcar como finalizada la carga
            }
        };


        fetchEntrega();
    }, []);

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                const archivos = entrega.archivos;

                if (archivos.length > 0) {
                    setArchivos(archivos); // Guarda la lista de archivos
                    setUrl(`${PRIMARY_PDF_URL}${archivos[0]}`); // Establece la URL del primer archivo
                    await fetchComentarios(archivos[0]); // Obtén los comentarios para el primer archivo
                    setCurrentArchivoId(archivos[0]); // Almacena el ID del archivo actual
                }
            } catch (error) {
                console.error("Error al obtener la entrega:", error);
                setError(error.response.data.error.details)
            } finally {
                setIsLoading(false); // Marcar como finalizada la carga
            }
        };


        fetchPdf();
    }, [entrega]);

    // Obtener comentarios del archivo
    const fetchComentarios = async (archivoId: string) => {
        try {
            const response = await axios.get(`/archivo/comentario/${archivoId}`, { withCredentials: true });
            const comentarios = response.data;

            const mappedHighlights = comentarios.map((comment) => ({
                id: comment.ID.toString(),
                content: { text: comment.content.text, image: comment.content.image },
                type: comment.type,
                position: comment.position,
                comment: comment.comentario,
                user: comment.usuario,
                date: new Date(comment.fecha).toLocaleDateString(),
            }));
            console.log(mappedHighlights)
            setHighlights(mappedHighlights);
        } catch (error) {
            console.error("Error al obtener los comentarios:", error);
        }
    };

    // Listener para manejar el hash y navegar a un highlight
    useEffect(() => {
        const scrollToHighlightFromHash = () => {
            const highlight = getHighlightById(parseIdFromHash());

            if (highlight && highlighterUtilsRef.current) {
                highlighterUtilsRef.current.scrollToHighlight(highlight);
            }
        };

        window.addEventListener("hashchange", scrollToHighlightFromHash);

        return () => {
            window.removeEventListener("hashchange", scrollToHighlightFromHash);
        };
    }, [highlights]);

    // Función para obtener un highlight por su ID desde el hash
    const getHighlightById = (id: string) => {
        return highlights.find((highlight) => highlight.id === id);
    };

    const handleContextMenu = (
        event: MouseEvent<HTMLDivElement>,
        highlight: ViewportHighlight<CommentedHighlight>
    ) => {
        event.preventDefault();
        setContextMenu({
            xPos: event.clientX,
            yPos: event.clientY,
            deleteHighlight: () => {
                deleteHighlight(highlight);
                setContextMenu(null); // Cierra el menú contextual al eliminar
            },
            editComment: () => {
                editComment(highlight);
                setContextMenu(null); // Cierra el menú contextual al editar
            },
        });
    };

    const addHighlight = async (highlight: GhostHighlight, comment: string) => {
        const newHighlight = { ...highlight, comment, id: getNextId() };
        setHighlights([newHighlight, ...highlights]);

        // Actualizar el hash con el ID del nuevo highlight
        document.location.hash = `#highlight-${newHighlight.id}`;

        // Lógica para enviar el nuevo comentario al backend
        try {
            if (!currentArchivoId) {
                throw new Error("El ID del archivo no está disponible.");
            }

            // Determina el tipo de contenido
            const body = {
                type: highlight.type, // El tipo (text o area) se toma del highlight
                content: {
                    text: highlight.type === "text" ? highlight.content.text : "", // Solo se asigna texto si es un comentario de texto
                    image: highlight.type === "area" ? highlight.content.image : undefined, // Asigna la imagen si es un área
                },
                position: {
                    boundingRect: highlight.position.boundingRect, // Usamos la posición del highlight
                    rects: highlight.position.rects, // Si hay rectángulos, también los incluimos
                },
                comment
            };

            await axios.post(`/archivo/comentario/${currentArchivoId}`, body, { withCredentials: true });
            console.log("Comentario guardado correctamente");
        } catch (error) {
            console.error("Error al guardar el comentario:", error);
        }
    };




    const deleteHighlight = async (highlight: ViewportHighlight | Highlight) => {
        try {
            if (!currentArchivoId) {
                throw new Error("El ID del archivo no está disponible.");
            }

            await axios.delete(`/archivo/comentario/${highlight.id}`, { withCredentials: true });
            console.log("Comentario eliminado correctamente");

            // Actualiza los highlights en el estado
            setHighlights(highlights.filter((h) => h.id !== highlight.id));
            resetHash(); // Restablece el hash al eliminar un resaltado
        } catch (error) {
            console.error("Error al eliminar el comentario:", error);
        }
    };


    const editHighlight = (idToUpdate: string, edit: Partial<CommentedHighlight>) => {
        setHighlights(
            highlights.map((highlight) =>
                highlight.id === idToUpdate ? { ...highlight, ...edit } : highlight
            )
        );
    };

    const editComment = async (highlight: ViewportHighlight<CommentedHighlight>) => {
        if (!highlighterUtilsRef.current) return;

        const editCommentTip: Tip = {
            position: highlight.position,
            content: (
                <CommentForm
                    placeHolder={highlight.comment}
                    onSubmit={async (input) => {
                        try {
                            if (!currentArchivoId) {
                                throw new Error("El ID del archivo no está disponible.");
                            }

                            // Estructura del cuerpo de la solicitud para editar el comentario
                            const body = {
                                type: highlight.type,
                                content: {
                                    text: highlight.content.text, // Mantén el texto original
                                },
                                position: highlight.position,
                                comment: input, // Nuevo comentario
                            };

                            await axios.put(`/archivo/comentario/${highlight.id}`, body, { withCredentials: true });
                            console.log("Comentario editado correctamente");

                            editHighlight(highlight.id, { comment: input });
                            highlighterUtilsRef.current!.setTip(null);
                            highlighterUtilsRef.current!.toggleEditInProgress(false);
                        } catch (error) {
                            console.error("Error al editar el comentario:", error);
                        }
                    }}
                />
            ),
        };

        highlighterUtilsRef.current.setTip(editCommentTip);
        highlighterUtilsRef.current.toggleEditInProgress(true);
    };
    const toggleDocument = async () => {
        const nextIndex = (currentArchivoIndex + 1) % archivos.length; // Cambia al siguiente índice
        setCurrentArchivoIndex(nextIndex); // Actualiza el índice del archivo actual
        const nextArchivoId = archivos[nextIndex]; // Obtén el ID del siguiente archivo
        setUrl(`${PRIMARY_PDF_URL}${nextArchivoId}`); // Actualiza la URL del PDF
        await fetchComentarios(nextArchivoId); // Vuelve a obtener los comentarios para el nuevo archivo
    };


    return (
        <div className="App" style={{ display: "flex", height: "100vh" }}>
            <div
                style={{
                    height: "100vh",
                    width: "75vw",
                    overflow: "hidden",
                    position: "relative",
                    flexGrow: 1,
                }}
            >
                {!error ? !isLoading && url ? (
                    <PdfLoader document={{url:url,withCredentials:true}}>
                        {(pdfDocument) => (
                            <PdfHighlighter
                                enableAreaSelection={(event) => event.altKey}
                                pdfDocument={pdfDocument}
                                onScrollAway={resetHash}
                                utilsRef={(_pdfHighlighterUtils) => {
                                    highlighterUtilsRef.current = _pdfHighlighterUtils;
                                }}
                                textSelectionColor={highlightPen ? "rgba(255, 226, 143, 1)" : undefined}
                                onSelection={highlightPen ? (selection) => addHighlight(selection.makeGhostHighlight(), "") : undefined}
                                selectionTip={!highlightPen && <ExpandableTip addHighlight={addHighlight} />}
                                highlights={highlights}
                                style={{
                                    height: "calc(100% - 41px)",
                                }}
                            >
                                <HighlightContainer
                                    editHighlight={editHighlight}
                                    onContextMenu={handleContextMenu}
                                />
                            </PdfHighlighter>
                        )}
                    </PdfLoader>
                ) : (
                    <div className={'badge badge-primary'}>Cargando PDF...</div>
                ): <h5>{error}</h5>}
            </div>

            {contextMenu && <ContextMenu {...contextMenu} />}
            <Sidebar
                highlights={highlights}
                resetHighlights={() => setHighlights([])}
                toggleDocument={toggleDocument}
                isLoading={isLoading}
                entrega={entrega}
            />
        </div>
    );
};

export default App;
