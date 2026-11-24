
import { Injectable }             from '@nestjs/common';
import { ConfigService }          from '@nestjs/config';

import type { CommentDto }        from './dto/comment.dto.js';
import type { ClassifiedComment } from './interfaces/classification.interface.js';

import { RulesClassifier }        from './classifiers/rules.classifier.js';
import { OllamaProvider }         from './providers/ollama.provider.js';
import { CommentsRepository }     from './comments.repository.js';

@Injectable()
export class ModerationService {

  constructor(
    private readonly config: ConfigService,
    private readonly rulesClassifier: RulesClassifier,
    private readonly ollamaProvider: OllamaProvider,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async classify(
    comments: CommentDto[],
  ): Promise<ClassifiedComment[]> {
    const provider = this.config.get<string>(
      'MODERATION_PROVIDER',
      'rules',
    );

    const results: ClassifiedComment[] = [];

    for (const comment of comments) {
      const classification =
        provider === 'ollama'
          ? await this.ollamaProvider.classify(comment)
          : this.rulesClassifier.classify(comment);

      results.push({
        ...comment,
        ...classification,
      });
    }

    return results.sort((a, b) => {
      if (a.categoria === 'revisar' && b.categoria !== 'revisar') {
        return -1;
      }

      if (a.categoria !== 'revisar' && b.categoria === 'revisar') {
        return 1;
      }

      return b.gravedad - a.gravedad;
    });
  }
  async findAll(): Promise<ClassifiedComment[]> {
    const comments = await this.commentsRepository.findAll();

    return this.classify(comments);
  }
}
