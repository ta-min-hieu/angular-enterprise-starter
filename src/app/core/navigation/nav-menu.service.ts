import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { NavMenuItem } from './nav-menu-item.model';
import { NAV_MENU_ITEMS } from './nav-menu-items.token';

@Injectable({ providedIn: 'root' })
export class NavMenuService {
  private readonly authService = inject(AuthService);
  private readonly registeredGroups = inject(NAV_MENU_ITEMS, { optional: true }) ?? [];

  readonly visibleItems = computed<readonly NavMenuItem[]>(() => {
    this.authService.currentUser();
    return this.registeredGroups.flat().filter((item) => this.isVisible(item));
  });

  private isVisible(item: NavMenuItem): boolean {
    return !item.permission || this.authService.hasPermission(item.permission);
  }
}
