
import { describe, expect, it } from 'vitest';

import type { CommentDto }      from '../dto/comment.dto.js';
import { RulesClassifier }      from './rules.classifier.js';

describe('RulesClassifier', () => {
  const classifier = new RulesClassifier();

  const createComment = (
    texto: string,
    reportes = 0,
  ): CommentDto => ({
    id: 1,
    usuario: 'Usuario de prueba',
    fecha: '2026-11-23',
    texto,
    reportes,
  });

  describe('Amenazas', () => {
    it('detecta amenazas explícitas', () => {
      const result = classifier.classify(
        createComment('Te voy a matar'),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(5);
    });

    it('detecta amenazas con expresiones diferentes', () => {
      const result = classifier.classify(
        createComment('Te voy a buscar y te vas a arrepentir'),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(5);
    });

    it('detecta amenazas de represalia', () => {
      const result = classifier.classify(
        createComment('Cuando te encuentre vas a pagar'),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(5);
    });

    it('no confunde una frase cotidiana con una amenaza', () => {
      const result = classifier.classify(
        createComment('Te voy a buscar el libro mañana'),
      );

      expect(result.categoria).toBe('ok');
      expect(result.gravedad).toBe(0);
    });
  });

  describe('Insultos', () => {
    it('detecta insultos directos', () => {
      const result = classifier.classify(
        createComment('Eres un tarado'),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(4);
    });

    it('detecta insultos con tildes', () => {
      const result = classifier.classify(
        createComment('Eres un imbécil'),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(4);
    });
  });

  describe('Spam', () => {
    it('detecta publicidad no solicitada', () => {
      const result = classifier.classify(
        createComment('Compra seguidores con descuento'),
      );

      expect(result.categoria).toBe('spam');
      expect(result.gravedad).toBe(1);
    });

    it('no clasifica preguntas comerciales como spam', () => {
      const result = classifier.classify(
        createComment('¿Dónde puedo comprar ese producto?'),
      );

      expect(result.categoria).toBe('ok');
      expect(result.gravedad).toBe(0);
    });
  });

  describe('Reportes y contenido', () => {
    it('envía a revisión comentarios con tres reportes', () => {
      const result = classifier.classify(
        createComment('Comentario normal', 3),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(2);
    });

    it('prioriza una amenaza sobre los reportes', () => {
      const result = classifier.classify(
        createComment('Te voy a matar', 5),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(5);
    });

    it('envía comentarios vacíos a revisión', () => {
      const result = classifier.classify(
        createComment('   '),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(2);
    });

    it('permite enlaces informativos sin señales sospechosas', () => {
      const result = classifier.classify(
        createComment('Consulta la documentación en https://angular.dev'),
      );

      expect(result.categoria).toBe('ok');
      expect(result.gravedad).toBe(0);
    });

    it('permite comentarios normales', () => {
      const result = classifier.classify(
        createComment('Muchas gracias por la información'),
      );

      expect(result.categoria).toBe('ok');
      expect(result.gravedad).toBe(0);
    });
  });


  describe('Casos adicionales de moderación', () => {
    it('detecta insultos dirigidos a un grupo', () => {
      const result = classifier.classify(
        createComment('Los que compran esta marca son unos ignorantes'),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(4);
    });

    it('detecta publicidad con enlaces', () => {
      const result = classifier.classify(
        createComment(
          'Gana dinero desde casa, entra a https://promociones.example',
        ),
      );

      expect(result.categoria).toBe('spam');
      expect(result.gravedad).toBe(1);
    });

    it('permite compartir un tutorial', () => {
      const result = classifier.classify(
        createComment(
          'El tutorial está aquí: https://www.youtube.com/watch?v=ejemplo',
        ),
      );

      expect(result.categoria).toBe('ok');
      expect(result.gravedad).toBe(0);
    });

    it('prioriza amenazas sobre publicidad', () => {
      const result = classifier.classify(
        createComment(
          'Compra seguidores ahora o te vas a arrepentir',
        ),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(5);
    });

    it('envía enlaces acortados a revisión', () => {
      const result = classifier.classify(
        createComment('Visita https://bit.ly/ejemplo'),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(3);
    });
    it('detecta un enlace acortado diferente', () => {
      const result = classifier.classify(
        createComment('Mira esto: https://cutt.ly/abc123'),
      );

      expect(result.categoria).toBe('revisar');
      expect(result.gravedad).toBe(3);
    });

    it('no considera sospechoso un enlace solo por tener dominio propio', () => {
      const result = classifier.classify(
        createComment('Documentación disponible en https://docs.example.org'),
      );

      expect(result.categoria).toBe('ok');
      expect(result.gravedad).toBe(0);
    });
  });

});
