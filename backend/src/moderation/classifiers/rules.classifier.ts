
import { Injectable }      from '@nestjs/common';

import type { CommentDto } from '../dto/comment.dto.js';
import type {
  ClassificationResult,
} from '../interfaces/classification.interface.js';

@Injectable()
export class RulesClassifier {
  classify(comment: CommentDto): ClassificationResult {
    const text = this.normalize(comment.texto);

    if (!text) {
      return this.result('revisar', 'Comentario vacío', 2);
    }

    if (this.isThreat(text)) {
      return this.result('revisar', 'Posible amenaza', 5);
    }

    if (this.isInsult(text)) {
      return this.result('revisar', 'Insulto u ofensa', 4);
    }

    if (this.hasPersonalContact(comment.texto)) {
      return this.result('revisar', 'Información de contacto', 3);
    }

    if (this.isSpam(text)) {
      // Los reportes no convierten automáticamente
      // una publicidad en una amenaza.
      return this.result('spam', 'Publicidad no solicitada', 1);
    }

    if (this.hasSuspiciousLink(text)) {
      return this.result('revisar', 'Enlace sospechoso', 3);
    }

    if (comment.reportes >= 3) {
      return this.result('revisar', 'Múltiples reportes', 2);
    }

    return this.result('ok', 'Comentario permitido', 0);
  }

  private isThreat(text: string): boolean {
    const patterns = [
      /\bte voy a (matar|golpear|hacer dano)\b/,
      /\bte vas a arrepentir\b/,
      /\bvas a pagar por (esto|lo que hiciste)\b/,
      /\bcuando te (encuentre|agarre)\b.*\b(pagar|arrepentir|golpear)\b/,
      /\bte voy a (buscar|encontrar)\b.*\b(arrepentir|golpear|matar|pagar)\b/,
      /\bvas a ver lo que te pasa\b/,
    ];

    return patterns.some(pattern => pattern.test(text));
  }

  private isInsult(text: string): boolean {
    const directInsults = [
      /\b(eres|sos|usted es)\s+(un\s+|una\s+)?(idiota|imbecil|tarado|estupido|ignorante|tonto|inutil|burro)\b/,
      /\b(son|sois)\s+(unos?\s+|unas?\s+)?(idiotas|imbeciles|tarados|estupidos|ignorantes|tontos|inutiles|burros)\b/,
      /\b(nadie te pregunto)\b.*\b(idiota|imbecil)\b/,
    ];

    return directInsults.some(pattern => pattern.test(text));
  }

  private isSpam(text: string): boolean {
    const promotionalPatterns = [
      /\b(gana|ganar)\s+dinero\b/,
      /\b(compra|comprar)\s+seguidores\b/,
      /\b(cupon|cupones)\b.*\bdescuento\b/,
      /\b(promocion|oferta)\s+exclusiva\b/,
      /\b(oferta)\s+\1\b/,
      /\b(ingresos)\s+(faciles|rapidos)\b/,
    ];

    const isQuestion =
      /[?¿]/.test(text) ||
      /\b(donde|como|cuando|cuanto|sera verdad)\b/.test(text);

    return (
      !isQuestion &&
      promotionalPatterns.some(pattern => pattern.test(text))
    );
  }

  private hasSuspiciousLink(text: string): boolean {
    const urls = text.match(
      /(?:https?:\/\/|www\.)[^\s<>"']+/gi,
    );

    if (!urls) {
      return false;
    }

    return urls.some(url => {
      let hostname: string;

      try {
        const parsed = new URL(
          url.startsWith('www.') ? `https://${url}` : url,
        );

        hostname = parsed.hostname.toLowerCase();
      } catch {
        return false;
      }

      const shortenedDomains = new Set([
        'bit.ly',
        'tinyurl.com',
        't.co',
        'is.gd',
        'cutt.ly',
      ]);

      const isShortened = shortenedDomains.has(hostname);

      const suspiciousLanguage =
        /\b(verifica tu cuenta|confirma tu contrasena|ingresa tus datos|premio garantizado|dinero facil)\b/
          .test(text);

      return isShortened || suspiciousLanguage;
    });
  }


  private hasPersonalContact(text: string): boolean {
    return /(?:\+?\d[\d\s().-]{7,}\d)/.test(text);
  }

  private normalize(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private result(
    categoria: ClassificationResult['categoria'],
    motivo: string,
    gravedad: number,
  ): ClassificationResult {
    return { categoria, motivo, gravedad };
  }
}
