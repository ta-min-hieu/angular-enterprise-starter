import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { Role, RoleInput } from './role.model';
import { RoleDto } from './role-api.model';
import { toRole, toRolePayload } from './role.mapper';
import { Permission } from '../permissions/permission.model';
import { PermissionDto } from '../permissions/permission-api.model';
import { toPermission } from '../permissions/permission.mapper';
import { Menu } from '../menus/menu.model';
import { MenuDto } from '../menus/menu-api.model';
import { toMenu } from '../menus/menu.mapper';

// GET /v1/rbac/roles không phân trang, không có query param — trả toàn bộ danh sách (giống Menu).
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly apiService = inject(ApiService);

  private readonly rolesSignal = signal<readonly Role[]>([]);
  private readonly loadingSignal = signal(false);

  readonly roles = this.rolesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  load(): Observable<readonly Role[]> {
    this.loadingSignal.set(true);

    return this.apiService.get<RoleDto[]>('rbac/roles').pipe(
      map((items) => {
        const roles = items.map(toRole);
        this.rolesSignal.set(roles);
        return roles;
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  getById(id: string): Observable<Role> {
    return this.apiService.get<RoleDto>(`rbac/roles/${id}`).pipe(map(toRole));
  }

  add(input: RoleInput): Observable<Role> {
    return this.apiService.post<RoleDto>('rbac/roles', toRolePayload(input)).pipe(map(toRole));
  }

  update(id: string, input: RoleInput): Observable<Role> {
    return this.apiService.put<RoleDto>(`rbac/roles/${id}`, toRolePayload(input)).pipe(map(toRole));
  }

  remove(id: string): Observable<void> {
    return this.apiService.delete<void>(`rbac/roles/${id}`);
  }

  getPermissions(id: string): Observable<readonly Permission[]> {
    return this.apiService
      .get<PermissionDto[]>(`rbac/roles/${id}/permissions`)
      .pipe(map((items) => items.map(toPermission)));
  }

  updatePermissions(
    id: string,
    permissionIds: readonly string[],
  ): Observable<readonly Permission[]> {
    return this.apiService
      .put<PermissionDto[]>(`rbac/roles/${id}/permissions`, {
        permissionIds: permissionIds.map(Number),
      })
      .pipe(map((items) => items.map(toPermission)));
  }

  getMenus(id: string): Observable<readonly Menu[]> {
    return this.apiService
      .get<MenuDto[]>(`rbac/roles/${id}/menus`)
      .pipe(map((items) => items.map(toMenu)));
  }

  updateMenus(id: string, menuIds: readonly string[]): Observable<readonly Menu[]> {
    return this.apiService
      .put<MenuDto[]>(`rbac/roles/${id}/menus`, { menuIds: menuIds.map(Number) })
      .pipe(map((items) => items.map(toMenu)));
  }
}
