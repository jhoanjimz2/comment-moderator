import {
  Comment,
  ClassifiedComment,
  CommentCategory
} from '../../../core/models/comment.model';

import {
  isEmpty,
  containsThreat,
  containsInsult,
  containsPromotion,
  containsPhoneNumber,
  containsUrl,
  isQuestion
} from './classification-rules';

export function classifyComment(comment: Comment): ClassifiedComment {
  const text = comment.texto;

  let categoria: CommentCategory = 'ok';
  let motivo = 'Comentario permitido';

  if (isEmpty(text)) {
    categoria = 'revisar';
    motivo = 'Comentario sin contenido';
  } else if (containsThreat(text)) {
    categoria = 'revisar';
    motivo = 'Posible amenaza detectada';
  } else if (containsInsult(text)) {
    categoria = 'revisar';
    motivo = 'Posible lenguaje ofensivo';
  } else if (containsPromotion(text) && !isQuestion(text)) {
    categoria = 'spam';
    motivo = 'Posible publicidad no solicitada';
  } else if (containsPhoneNumber(text)) {
    categoria = 'revisar';
    motivo = 'Posible información de contacto personal';
  } else if (containsUrl(text) && isQuestion(text)) {
    categoria = 'revisar';
    motivo = 'Enlace que requiere verificación';
  } else if (comment.reportes >= 3) {
    categoria = 'revisar';
    motivo = 'Comentario con múltiples reportes';
  }

  return { ...comment, categoria, motivo };
}
