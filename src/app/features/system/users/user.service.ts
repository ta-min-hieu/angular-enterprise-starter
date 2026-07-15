import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { CreateUserInput, UpdateUserInput, User } from './user.model';
import { UserDto } from './user-api.model';
import { toCreateUserPayload, toUpdateUserPayload, toUser } from './user.mapper';

// GET /v1/rbac/users không phân trang, không có query param — trả toàn bộ danh sách (giống
// Role/Permission/Menu).
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiService = inject(ApiService);

  private readonly usersSignal = signal<readonly User[]>([]);
  private readonly loadingSignal = signal(false);

  readonly users = this.usersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  load(): Observable<readonly User[]> {
    this.loadingSignal.set(true);

    return this.apiService.get<UserDto[]>('rbac/users').pipe(
      map((items) => {
        const users = items.map(toUser);
        this.usersSignal.set(users);
        return users;
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  getById(id: string): Observable<User> {
    return this.apiService.get<UserDto>(`rbac/users/${id}`).pipe(map(toUser));
  }

  add(input: CreateUserInput): Observable<User> {
    return this.apiService
      .post<UserDto>('rbac/users', toCreateUserPayload(input))
      .pipe(map(toUser));
  }

  update(id: string, input: UpdateUserInput): Observable<User> {
    return this.apiService
      .put<UserDto>(`rbac/users/${id}`, toUpdateUserPayload(input))
      .pipe(map(toUser));
  }

  remove(id: string): Observable<void> {
    return this.apiService.delete<void>(`rbac/users/${id}`);
  }

  // Thay thế TOÀN BỘ danh sách role đang gán — CreateUserRequest/UpdateUserRequest không có
  // roleIds, gán role luôn là bước riêng sau khi tạo/sửa user (xem UserFormPage.onSave()).
  updateRoles(id: string, roleIds: readonly string[]): Observable<void> {
    return this.apiService.put<void>(`rbac/users/${id}/roles`, { roleIds: roleIds.map(Number) });
  }
}
