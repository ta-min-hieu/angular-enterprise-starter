import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, map } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { Menu, MenuInput } from './menu.model';
import { MenuDto } from './menu-api.model';
import { flattenMenuDtoTree, toMenu, toMenuPayload } from './menu.mapper';

// GET /v1/rbac/menus trả về CÂY LỒNG NHAU, không phân trang — làm phẳng ngay khi tải (xem
// menu.mapper.ts#flattenMenuDtoTree) rồi giữ dạng phẳng ở signal, để buildMenuTree() dựng lại cây
// khi cần hiển thị (menus-page, menu-form, role-menu-assign).
@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly apiService = inject(ApiService);

  private readonly menusSignal = signal<readonly Menu[]>([]);
  private readonly loadingSignal = signal(false);

  readonly menus = this.menusSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  load(): Observable<readonly Menu[]> {
    this.loadingSignal.set(true);

    return this.apiService.get<MenuDto[]>('rbac/menus').pipe(
      map((tree) => {
        const menus = flattenMenuDtoTree(tree).map(toMenu);
        this.menusSignal.set(menus);
        return menus;
      }),
      finalize(() => this.loadingSignal.set(false)),
    );
  }

  getById(id: string): Observable<Menu> {
    return this.apiService.get<MenuDto>(`rbac/menus/${id}`).pipe(map(toMenu));
  }

  add(input: MenuInput): Observable<Menu> {
    return this.apiService.post<MenuDto>('rbac/menus', toMenuPayload(input)).pipe(map(toMenu));
  }

  update(id: string, input: MenuInput): Observable<Menu> {
    return this.apiService.put<MenuDto>(`rbac/menus/${id}`, toMenuPayload(input)).pipe(map(toMenu));
  }

  remove(id: string): Observable<void> {
    return this.apiService.delete<void>(`rbac/menus/${id}`);
  }
}
