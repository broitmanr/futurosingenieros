import React, { MouseEvent, useEffect, useRef, useState } from "react";
import CommentForm from "./CommentForm";
import ContextMenu, { ContextMenuProps } from "./ContextMenu";
import ExpandableTip from "./ExpandableTip";
import HighlightContainer from "./HighlightContainer";
import Sidebar from "./Sidebar";
import {ProgressSpinner} from "primereact/progressspinner";
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
import { useParams } from "react-router-dom";
import moment from "moment/moment";

const PRIMARY_PDF_URL = "http://localhost:5000/api/archivo/";

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () => {
    return document.location.hash.slice("#highlight-".length);
};

const resetHash = () => {
    document.location.hash = "";
};

const App = () => {
    const [url, setUrl] = useState<string | null>(null);
    const [entrega, setEntrega] = useState<any | null>(null);
    const [highlights, setHighlights] = useState<Array<CommentedHighlight>>([]);
    const currentPdfIndexRef = useRef(0);
    const [contextMenu, setContextMenu] = useState<ContextMenuProps | null>(null);
    const highlighterUtilsRef = useRef<PdfHighlighterUtils>();
    const [archivos, setArchivos] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [highlightPen, setHighlightPen] = useState<boolean>(false);
    const [currentArchivoId, setCurrentArchivoId] = useState<string | null>(null);
    const [currentArchivoIndex, setCurrentArchivoIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams();

    // Efecto para cargar la entrega
    useEffect(() => {
        const fetchEntrega = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`/entrega/${id}`, { withCredentials: true });
                setEntrega(response.data);
            } catch (error) {
                console.error("Error al obtener la entrega:", error);
                setError(error.response?.data?.error?.details || "Error desconocido");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEntrega();
    }, [id]);

    // Efecto para cargar el PDF y comentarios cuando `entrega` cambia
    useEffect(() => {
        if (!entrega) return;


        const fetchPdf = async () => {
            setIsLoading(true);
            try {
                const archivos = entrega.archivos;
                if (archivos && archivos.length > 0) {
                    setArchivos(archivos);
                    setUrl(`${PRIMARY_PDF_URL}${archivos[0]}`);
                    setCurrentArchivoId(archivos[0]);
                    await fetchComentarios(archivos[0]);
                }
            } catch (error) {
                console.error("Error al obtener el PDF:", error);
                setError(error.response?.data?.error?.details || "Error desconocido");
            } finally{
                setIsLoading(false)
            }
        };

        fetchPdf();
    }, [entrega]);

    // Función para obtener comentarios del archivo actual
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
                mine: comment.mine,
                answers: comment.answers,
            }));

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
                setContextMenu(null);
            },
            editComment: () => {
                editComment(highlight);
                setContextMenu(null);
            },
        });
    };

    const addHighlight = async (highlight: GhostHighlight, comment: string) => {
        const newHighlight = { ...highlight, comment, id: getNextId(), user: 'Vos', date: moment().format('DD/MM/YYYY'), mine: true };
        setHighlights([newHighlight, ...highlights]);

        document.location.hash = `#highlight-${newHighlight.id}`;

        try {
            if (!currentArchivoId) throw new Error("El ID del archivo no está disponible.");

            const body = {
                type: highlight.type,
                content: {
                    text: highlight.type === "text" ? highlight.content.text : "",
                    image: highlight.type === "area" ? highlight.content.image : undefined,
                },
                position: {
                    boundingRect: highlight.position.boundingRect,
                    rects: highlight.position.rects,
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
            if (!currentArchivoId) throw new Error("El ID del archivo no está disponible.");

            await axios.delete(`/archivo/comentario/${highlight.id}`, { withCredentials: true });
            setHighlights(highlights.filter((h) => h.id !== highlight.id));
            resetHash();
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
                            if (!currentArchivoId) throw new Error("El ID del archivo no está disponible.");

                            const body = {
                                type: highlight.type,
                                content: { text: highlight.content.text },
                                position: highlight.position,
                                comment: input,
                            };

                            await axios.put(`/archivo/comentario/${highlight.id}`, body, { withCredentials: true });
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
        setIsLoading(true)
        const nextIndex = (currentArchivoIndex + 1) % archivos.length;
        setCurrentArchivoIndex(nextIndex);
        const nextArchivoId = archivos[nextIndex];
        setUrl(`${PRIMARY_PDF_URL}${nextArchivoId}`);
        await fetchComentarios(nextArchivoId);
        setIsLoading(false)
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
                    <PdfLoader document={{ url: url, withCredentials: true }}>
                        {(pdfDocument) => (
                            <PdfHighlighter
                                enableAreaSelection={(event) => event.altKey}
                                pdfDocument={pdfDocument}
                                onScrollAway={resetHash}
                                utilsRef={(ref) => {
                                    highlighterUtilsRef.current = ref;
                                }}
                                textSelectionColor={highlightPen ? "rgba(255, 226, 143, 1)" : undefined}
                                onSelection={highlightPen ? (selection) => addHighlight(selection.makeGhostHighlight(), "") : undefined}
                                selectionTip={!highlightPen && <ExpandableTip addHighlight={addHighlight} />}
                                highlights={highlights}
                                style={{ height: "calc(100% - 41px)" }}
                            >
                                <HighlightContainer
                                    editHighlight={editHighlight}
                                    onContextMenu={handleContextMenu}
                                />
                            </PdfHighlighter>
                        )}
                    </PdfLoader>
                ) : (
                    <>
                        <ProgressSpinner />
                    </>
                ) : <h5>{error}</h5>}
            </div>

            {contextMenu && <ContextMenu {...contextMenu} />}
            <Sidebar
                highlights={highlights}
                onHighlightsUpdate={setHighlights}
                toggleDocument={toggleDocument}
                isLoading={isLoading}
                entrega={entrega}
            />
        </div>
    );
};

export default App;
