import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, of, shareReplay, switchMap } from 'rxjs';

export interface EntityByIdLoaderConfig<T> {
  readonly id: Signal<string | undefined>;
  readonly getById: (id: string) => Observable<T>;
  readonly onNotFound: () => void;
}

// Tải entity theo id (route param) cho các form-page CRUD: id rỗng -> null (chế độ tạo mới); id
// không tồn tại/backend lỗi -> onNotFound() (thường là điều hướng về trang list) rồi trả về null.
// shareReplay vì một số form-page (RoleFormPage) subscribe entity$ nhiều lần (assignedPermissionIds,
// assignedMenuIds) — không share thì mỗi subscriber tự kích lại GET, gọi trùng nhiều lần.
export function createEntityByIdLoader<T>(config: EntityByIdLoaderConfig<T>): Signal<T | null> {
  const entity$ = toObservable(config.id).pipe(
    switchMap((id) => {
      if (!id) {
        return of(null);
      }

      return config.getById(id).pipe(
        catchError(() => {
          config.onNotFound();
          return of(null);
        }),
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  return toSignal(entity$, { initialValue: null });
}
