
import { Injectable }      from '@nestjs/common';
import { readFile }        from 'node:fs/promises';
import { join }            from 'node:path';

import type { CommentDto } from './dto/comment.dto.js';

@Injectable()
export class CommentsRepository {
  async findAll(): Promise<CommentDto[]> {
    const filePath = join(
      process.cwd(),
      'data',
      'comentarios.json',
    );

    const content = await readFile(filePath, 'utf-8');

    return JSON.parse(content) as CommentDto[];
  }
}
