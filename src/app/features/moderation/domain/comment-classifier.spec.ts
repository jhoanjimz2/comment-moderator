import { describe, expect, it } from 'vitest';

import { Comment }              from '../../../core/models/comment.model';
import { classifyComment }      from './comment-classifier';
import commentsData             from '../../../../../public/data/comentarios.json';

describe('classifyComment', () => {
  const createComment = (
    texto: string,
    reportes = 0
  ): Comment => ({
    id: 1,
    usuario: 'usuario_prueba',
    fecha: '2026-11-17T10:00:00',
    texto,
    reportes
  });

  it('permite comentarios normales', () => {
    const result = classifyComment(
      createComment('Excelente explicación, muchas gracias')
    );

    expect(result.categoria).toBe('ok');
  });

  it('detecta publicidad explícita', () => {
    const result = classifyComment(
      createComment('Gana dinero desde casa')
    );

    expect(result.categoria).toBe('spam');
  });

  it('detecta amenazas', () => {
    const result = classifyComment(
      createComment('Te voy a encontrar')
    );

    expect(result.categoria).toBe('revisar');
  });

  it('detecta insultos', () => {
    const result = classifyComment(
      createComment('Eres un idiota')
    );

    expect(result.categoria).toBe('revisar');
  });

  it('detecta comentarios vacíos', () => {
    const result = classifyComment(
      createComment('   ')
    );

    expect(result.categoria).toBe('revisar');
  });

  it('detecta números de teléfono', () => {
    const result = classifyComment(
      createComment('Mi número es 3001234567')
    );

    expect(result.categoria).toBe('revisar');
  });

  it('envía enlaces ambiguos a revisión', () => {
    const result = classifyComment(
      createComment('¿Qué opinan de dinero-facil.xyz?')
    );

    expect(result.categoria).toBe('revisar');
  });

  it('no penaliza automáticamente enlaces legítimos', () => {
    const result = classifyComment(
      createComment('La documentación está en https://angular.dev')
    );

    expect(result.categoria).toBe('ok');
  });

  it('envía comentarios con múltiples reportes a revisión', () => {
    const result = classifyComment(
      createComment('No estoy de acuerdo con esta decisión', 6)
    );

    expect(result.categoria).toBe('revisar');
  });

  it('conserva los datos originales', () => {
    const comment = createComment('Hola');

    const result = classifyComment(comment);

    expect(result.id).toBe(comment.id);
    expect(result.usuario).toBe(comment.usuario);
    expect(result.texto).toBe(comment.texto);
  });

  it('no modifica el comentario original', () => {
    const comment = createComment('Hola');

    classifyComment(comment);

    expect(comment).not.toHaveProperty('categoria');
  });

  it('detecta promociones con ofertas repetidas', () => {
    const result = classifyComment(
      createComment(
        'OFERTA OFERTA OFERTA cupón del 90% de descuento en ofertas-hoy.net',
        3
      )
    );

    expect(result.categoria).toBe('spam');
  });

  it('detecta teléfonos con espacios', () => {
    const result = classifyComment(
      createComment('Mi número es 310 555 1234')
    );

    expect(result.categoria).toBe('revisar');
  });

  it('prioriza spam sobre teléfonos de contacto', () => {
    const result = classifyComment(
      createComment(
        'Compra seguidores baratos!!! Escríbeme al WhatsApp +57 300 000 0000',
        2
      )
    );

    expect(result.categoria).toBe('spam');
  });
});

describe('Clasificación del conjunto de datos original', () => {
  const expectedCategories = new Map<number, string>([
    [1, 'ok'],
    [2, 'spam'],
    [3, 'ok'],
    [4, 'revisar'],
    [5, 'ok'],
    [6, 'spam'],
    [7, 'revisar'],
    [8, 'revisar'],
    [9, 'ok'],
    [10, 'ok'],
    [11, 'ok'],
    [12, 'spam'],
    [13, 'revisar'],
    [14, 'ok'],
    [15, 'revisar'],
    [16, 'revisar'],
    [17, 'spam'],
    [18, 'revisar'],
    [19, 'ok'],
    [20, 'ok']
  ]);

  it('clasifica correctamente los 20 comentarios', () => {
    const results = commentsData.map(classifyComment);

    expect(results).toHaveLength(20);

    const mismatches = results
      .filter(comment =>
        comment.categoria !== expectedCategories.get(comment.id)
      )
      .map(comment => ({
        id: comment.id,
        usuario: comment.usuario,
        esperado: expectedCategories.get(comment.id),
        recibido: comment.categoria,
        motivo: comment.motivo
      }));

    expect(mismatches).toEqual([]);
  });

  it('genera los totales esperados por categoría', () => {
    const results = commentsData.map(classifyComment);
    const totals = {
      ok: results.filter(c => c.categoria === 'ok').length,
      spam: results.filter(c => c.categoria === 'spam').length,
      revisar: results.filter(c => c.categoria === 'revisar').length
    };

    expect(totals).toEqual({
      ok: 9,
      spam: 4,
      revisar: 7
    });
  });
});
