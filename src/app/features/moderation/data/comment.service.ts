import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable }         from 'rxjs';

import { ClassifiedComment }  from '../../../core/models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly http = inject(HttpClient);

  getComments(): Observable<ClassifiedComment[]> {
    return this.http.get<ClassifiedComment[]>(
      '/api/moderation/comments',
    );
  }
}
