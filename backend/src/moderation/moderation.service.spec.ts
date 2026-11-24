
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService }                        from '@nestjs/config';

import { ModerationService }                    from './moderation.service.js';
import { RulesClassifier }                      from './classifiers/rules.classifier.js';
import { OllamaProvider }                       from './providers/ollama.provider.js';
import { CommentsRepository }                   from './comments.repository.js';

import type { CommentDto }                      from './dto/comment.dto.js';

describe('ModerationService', () => {
  let service: ModerationService;

  const createComment = (
    id: number,
    texto: string,
    reportes = 0,
  ): CommentDto => ({
    id,
    usuario: `usuario_${id}`,
    fecha: '2026-11-23',
    texto,
    reportes,
  });

  beforeEach(() => {
    const config = {
      get: vi.fn().mockReturnValue('rules'),
    } as unknown as ConfigService;

    const rules = new RulesClassifier();

    const ollama = {
      classify: vi.fn(),
    } as unknown as OllamaProvider;

    const repository = {
      findAll: vi.fn(),
    } as unknown as CommentsRepository;

    service = new ModerationService(
      config,
      rules,
      ollama,
      repository,
    );
  });

  it('ordena amenazas antes que insultos y reportes', async () => {
    const comments = [
      createComment(1, 'Comentario normal'),
      createComment(2, 'Comentario reportado', 4),
      createComment(3, 'Eres un tarado'),
      createComment(4, 'Te voy a matar'),
    ];

    const result = await service.classify(comments);

    expect(result.map(comment => comment.id)).toEqual([
      4, 3, 2, 1,
    ]);

    expect(result.map(comment => comment.gravedad)).toEqual([
      5, 4, 2, 0,
    ]);
  });

  it('mantiene los comentarios para revisión antes que los demás', async () => {
    const comments = [
      createComment(1, 'Gana dinero desde casa'),
      createComment(2, 'Gracias por la ayuda'),
      createComment(3, 'Comentario reportado', 3),
    ];

    const result = await service.classify(comments);

    expect(result[0].id).toBe(3);
    expect(result[0].categoria).toBe('revisar');
  });

  it('conserva todos los comentarios después de ordenarlos', async () => {
    const comments = [
      createComment(1, 'Gracias'),
      createComment(2, 'Eres un tarado'),
      createComment(3, 'Compra seguidores'),
    ];

    const result = await service.classify(comments);

    expect(result).toHaveLength(3);
    expect(result.map(comment => comment.id).sort()).toEqual([
      1, 2, 3,
    ]);
  });

  it('devuelve una lista vacía cuando no hay comentarios', async () => {
    const result = await service.classify([]);

    expect(result).toEqual([]);
  });
});
