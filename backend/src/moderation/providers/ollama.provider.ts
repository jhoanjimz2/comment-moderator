import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService }             from '@nestjs/config';

import type { CommentDto }           from '../dto/comment.dto.js';
import type { ClassificationResult } from '../interfaces/classification.interface.js';
import { MODERATION_PROMPT }         from '../prompts/moderation.prompt.js';

@Injectable()
export class OllamaProvider {
  private readonly url: string;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.url = this.config.get<string>('OLLAMA_URL')
      ?? 'http://localhost:11434';

    this.model = this.config.get<string>('OLLAMA_MODEL')
      ?? 'qwen2.5:3b';
  }

  async classify(
    comment: CommentDto,
  ): Promise<ClassificationResult> {
    let response: Response;

    try {
      response = await fetch(`${this.url}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(60_000),
        body: JSON.stringify({
          model: this.model,
          stream: false,
          format: 'json',
          options: {
            temperature: 0,
          },
          messages: [
            {
              role: 'system',
              content: MODERATION_PROMPT,
            },
            {
              role: 'user',
              content: JSON.stringify({
                texto: comment.texto,
                reportes: comment.reportes,
              }),
            },
          ],
        }),
      });
    } catch {
      throw new ServiceUnavailableException(
        'No fue posible conectar con Ollama',
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Ollama respondió con HTTP ${response.status}`,
      );
    }

    try {
      const data = (await response.json()) as {
        message?: { content?: string };
      };

      const parsed: unknown = JSON.parse(
        data.message?.content ?? '',
      );

      if (!this.isValidClassification(parsed)) {
        throw new Error('Respuesta inválida');
      }

      return parsed;
    } catch {
      throw new InternalServerErrorException(
        'Ollama devolvió una clasificación inválida',
      );
    }
  }

  private isValidClassification(
    value: unknown,
  ): value is ClassificationResult {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const result = value as Record<string, unknown>;

    return (
      ['ok', 'spam', 'revisar'].includes(
        result['categoria'] as string,
      ) &&
      typeof result['motivo'] === 'string' &&
      Number.isInteger(result['gravedad']) &&
      (result['gravedad'] as number) >= 0 &&
      (result['gravedad'] as number) <= 5
    );
  }
}
