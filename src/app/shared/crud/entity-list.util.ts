import { Signal, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AppError } from '../../core/error/app-error';
import { NotificationService } from '../../core/notification/notification.service';

export interface EntityListState<T> {
  readonly keyword: Signal<string>;
  readonly error: Signal<AppError | null>;
  readonly filteredItems: Signal<readonly T[]>;
  onKeywordChange(value: string): void;
  onDelete(id: string): void;
  refresh(): void;
}

export interface EntityListConfig<T> {
  readonly items: Signal<readonly T[]>;
  readonly load: () => Observable<unknown>;
  readonly remove: (id: string) => Observable<unknown>;
  readonly matches: (item: T, keyword: string) => boolean;
}

// State dùng chung cho các màn list CRUD lọc phía client (roles/permissions/users — backend không
// hỗ trợ query param tìm kiếm). Gọi trong injection context (constructor/field initializer của
// component), vì bên trong dùng inject(); tự load() ngay khi tạo, giữ đúng hành vi constructor cũ.
export function createEntityListState<T>(config: EntityListConfig<T>): EntityListState<T> {
  const notificationService = inject(NotificationService);

  const keyword = signal('');
  const error = signal<AppError | null>(null);

  const filteredItems = computed(() => {
    const currentKeyword = keyword().trim().toLowerCase();
    const all = config.items();
    if (!currentKeyword) {
      return all;
    }
    return all.filter((item) => config.matches(item, currentKeyword));
  });

  function refresh(): void {
    error.set(null);
    config.load().subscribe({ error: (err: AppError) => error.set(err) });
  }

  function onKeywordChange(value: string): void {
    keyword.set(value);
  }

  function onDelete(id: string): void {
    config.remove(id).subscribe({
      next: () => {
        notificationService.success('common.notification.delete_success');
        refresh();
      },
      error: () => notificationService.error('common.notification.delete_error'),
    });
  }

  refresh();

  return { keyword, error, filteredItems, onKeywordChange, onDelete, refresh };
}
