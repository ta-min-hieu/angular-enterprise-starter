import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { Permission, PermissionInput } from './permission.model';
import { PermissionDto } from './permission-api.model';
import { toPermission, toPermissionPayload } from './permission.mapper';

// GET /v1/rbac/permissions không phân trang, không có query param — trả toàn bộ danh sách.
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly apiService = inject(ApiService);

  private readonly permissionsSignal = signal<readonly Permission[]>([]);
  private readonly loadingSignal = signal(false);

  readonly permissions = this.permissionsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  load(): Observable<readonly Permission[]> {
    this.loadingSignal.set(true);

    return this.apiService.get<PermissionDto[]>('rbac/permissions').pipe(
      map((items) => {
        const permissions = items.map(toPermission);
        this.permissionsSignal.set(permissions);
        return permissions;
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  getById(id: string): Observable<Permission> {
    return this.apiService.get<PermissionDto>(`rbac/permissions/${id}`).pipe(map(toPermission));
  }

  add(input: PermissionInput): Observable<Permission> {
    return this.apiService
      .post<PermissionDto>('rbac/permissions', toPermissionPayload(input))
      .pipe(map(toPermission));
  }

  update(id: string, input: PermissionInput): Observable<Permission> {
    return this.apiService
      .put<PermissionDto>(`rbac/permissions/${id}`, toPermissionPayload(input))
      .pipe(map(toPermission));
  }

  remove(id: string): Observable<void> {
    return this.apiService.delete<void>(`rbac/permissions/${id}`);
  }
}
