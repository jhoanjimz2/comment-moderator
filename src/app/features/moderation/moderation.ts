import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { DatePipe }                      from '@angular/common';
import { toSignal }                      from '@angular/core/rxjs-interop';
import { catchError, finalize, map, of } from 'rxjs';

import { CommentService }                from './data/comment.service';
import { classifyComment }               from './domain/comment-classifier';
import { normalizeText }                 from './domain/classification-rules';

import {
  ClassifiedComment,
  CommentCategory
} from '../../core/models/comment.model';

type CategoryFilter = CommentCategory | 'todos';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './moderation.html',
  styleUrl: './moderation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Moderation {
  private readonly commentService = inject(CommentService);

  readonly selectedCategory = signal<CategoryFilter>('todos');
  readonly searchTerm = signal('');
  readonly isLoading = signal(true);
  readonly loadError = signal(false);

  readonly comments = toSignal(
    this.commentService.getComments().pipe(
      map(comments => comments.map(classifyComment)),
      catchError(() => {
        this.loadError.set(true);
        return of([] as ClassifiedComment[]);
      }),
      finalize(() => this.isLoading.set(false))
    ),
    { initialValue: [] as ClassifiedComment[] }
  );

  readonly filteredComments = computed(() => {
    const category = this.selectedCategory();
    const search = normalizeText(this.searchTerm());

    return this.comments().filter(comment => {
      const matchesCategory =
        category === 'todos' || comment.categoria === category;

      const matchesSearch =
        !search ||
        normalizeText(comment.usuario).includes(search) ||
        normalizeText(comment.texto).includes(search);

      return matchesCategory && matchesSearch;
    });
  });

  readonly stats = computed(() => {
    const comments = this.comments();

    return {
      total: comments.length,
      ok: comments.filter(c => c.categoria === 'ok').length,
      spam: comments.filter(c => c.categoria === 'spam').length,
      revisar: comments.filter(c => c.categoria === 'revisar').length
    };
  });

  filterBy(category: CategoryFilter): void {
    this.selectedCategory.set(category);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  clearFilters(): void {
    this.selectedCategory.set('todos');
    this.searchTerm.set('');
  }
}
