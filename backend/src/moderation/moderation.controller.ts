import { Body, Controller, Get, Post } from '@nestjs/common';
import { ModerationService }           from './moderation.service.js';

interface CommentDto {
  id: number;
  usuario: string;
  fecha: string;
  texto: string;
  reportes: number;
}

@Controller('api/moderation')
export class ModerationController {
  constructor(
    private readonly moderationService: ModerationService,
  ) {}

  @Post('classify')
  classify(@Body() comments: CommentDto[]) {
    return this.moderationService.classify(comments);
  }

  @Get('comments')
  findAll() {
    return this.moderationService.findAll();
  }
}
