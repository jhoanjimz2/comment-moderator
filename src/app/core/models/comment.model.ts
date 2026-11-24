export type CommentCategory = 'ok' | 'spam' | 'revisar';

export interface Comment {
  id: number;
  usuario: string;
  fecha: string;
  texto: string;
  reportes: number;
}

export interface ClassifiedComment extends Comment {
  categoria: CommentCategory;
  motivo: string;
  gravedad: number;
}
