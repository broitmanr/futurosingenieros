import { Highlight, Content } from "react-pdf-highlighter-extended";

export interface CommentedHighlight extends Highlight {
  content: Content;
  comment?: string;
  user?: string;
  date?: string;
  mine?: boolean;
  answers?: Array<{
    id: string;
    comentario: string;
    usuario: string;
    mine: boolean;
    fecha: string;
  }>;
}
