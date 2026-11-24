import type { CommentDto } from '../dto/comment.dto.js';

export type CommentCategory = 'ok' | 'spam' | 'revisar';

export interface ClassificationResult {
  categoria: CommentCategory;
  motivo: string;
  gravedad: number;
}

export type ClassifiedComment = CommentDto & ClassificationResult;
