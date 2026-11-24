import { Module }               from '@nestjs/common';

import { ModerationController } from './moderation.controller.js';
import { ModerationService }    from './moderation.service.js';
import { RulesClassifier }      from './classifiers/rules.classifier.js';
import { OllamaProvider }       from './providers/ollama.provider.js';
import { CommentsRepository }   from './comments.repository.js';

@Module({
  controllers: [ModerationController],
  providers: [
    ModerationService,
    RulesClassifier,
    OllamaProvider,
    CommentsRepository,
  ],
})
export class ModerationModule {}
