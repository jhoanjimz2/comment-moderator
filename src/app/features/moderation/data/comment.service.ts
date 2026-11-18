import { inject, Injectable } from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { Observable }         from 'rxjs';

import { Comment }            from '../../../core/models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly http = inject(HttpClient);
  private readonly url = '/data/comentarios.json';

  getComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.url);
  }
}
