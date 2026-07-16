import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { BrowserService } from '../../core/browser/browser.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { NavMenuItem } from '../../core/navigation/nav-menu-item.model';
import { NavMenuService } from '../../core/navigation/nav-menu.service';
import { ThemeToggle } from '../../shared/components/theme-toggle/theme-toggle';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';

const SIDER_WIDTH_STORAGE_KEY = 'app.sider_width';
const SIDER_MIN_WIDTH = 180;
const SIDER_MAX_WIDTH = 360;
const SIDER_DEFAULT_WIDTH = 200;

@Component({
  selector: 'app-admin-layout',
  imports: [
    FormsModule,
    RouterOutlet,
    RouterLink,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    NzDropDownModule,
    NzAvatarModule,
    TranslocoPipe,
    ThemeToggle,
    LanguageSwitcher,
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  protected readonly authService = inject(AuthService);
  protected readonly navMenuService = inject(NavMenuService);
  private readonly router = inject(Router);
  private readonly i18nService = inject(I18nService);
  private readonly browserService = inject(BrowserService);

  readonly collapsed = signal(false);
  readonly menuSearchTerm = signal('');
  readonly siderWidth = signal(this.resolveInitialSiderWidth());
  readonly resizing = signal(false);

  // Lọc theo label ĐÃ DỊCH (không phải i18n key) — người dùng gõ theo chữ họ nhìn thấy trên menu.
  // Item cha khớp trực tiếp -> giữ nguyên toàn bộ children; cha không khớp nhưng có children khớp
  // -> chỉ giữ lại đúng những children khớp (thu gọn danh sách con, cha vẫn hiện làm nhãn nhóm).
  readonly filteredMenuItems = computed<readonly NavMenuItem[]>(() => {
    const term = this.menuSearchTerm().trim().toLowerCase();
    const items = this.navMenuService.visibleItems();
    if (!term) {
      return items;
    }

    const result: NavMenuItem[] = [];
    for (const item of items) {
      if (this.labelMatches(item.label, term)) {
        result.push(item);
        continue;
      }

      const matchedChildren = item.children?.filter((child) =>
        this.labelMatches(child.label, term),
      );
      if (matchedChildren?.length) {
        result.push({ ...item, children: matchedChildren });
      }
    }

    return result;
  });

  // nz-submenu tự quản lý trạng thái mở/đóng nội bộ, KHÔNG tự mở lại theo route đang active — nếu
  // không bind [nzOpen] tường minh, submenu cha sẽ đóng lại ngay sau khi điều hướng sang menu con
  // bên trong nó (trải nghiệm xấu: bấm "Hệ thống" -> chọn "Người dùng" -> submenu tự đóng).
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  // Route của submenu mà người dùng đã tự tay đóng lại — ưu tiên hơn trạng thái "auto-open vì có
  // menu con đang active", để họ vẫn thu gọn được submenu đang chứa trang hiện tại nếu muốn.
  private readonly manuallyClosedSubmenus = signal<ReadonlySet<string>>(new Set());

  toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  // Kéo-thả tự viết vì nz-sider chỉ có collapse 2 nấc (nzWidth/nzCollapsedWidth cố định), không có
  // resize liên tục. Gắn mousemove/mouseup thẳng vào document (qua BrowserService, không phải
  // (mousemove) trên template) vì cần theo dõi chuột cả khi nó ra khỏi vùng resize handle — đúng
  // hành vi resizer chuẩn (VS Code, mọi split-pane UI khác).
  onResizeHandleMouseDown(event: MouseEvent): void {
    const document = this.browserService.getDocument();
    if (!document) {
      return;
    }

    event.preventDefault();
    const startX = event.clientX;
    const startWidth = this.siderWidth();
    this.resizing.set(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const onMouseMove = (moveEvent: MouseEvent): void => {
      const next = startWidth + (moveEvent.clientX - startX);
      this.siderWidth.set(Math.min(SIDER_MAX_WIDTH, Math.max(SIDER_MIN_WIDTH, next)));
    };

    const onMouseUp = (): void => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      this.resizing.set(false);
      this.browserService.setLocalStorageItem(SIDER_WIDTH_STORAGE_KEY, String(this.siderWidth()));
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  onMenuSearchTermChange(value: string): void {
    this.menuSearchTerm.set(value);
  }

  isSubmenuOpen(item: NavMenuItem): boolean {
    // Đang search thì luôn mở — filteredMenuItems() đã đảm bảo item này còn hiển thị nghĩa là có
    // ít nhất 1 menu con khớp từ khoá, thu gọn lại sẽ khiến người dùng không thấy được kết quả.
    if (this.menuSearchTerm().trim()) {
      return true;
    }

    if (this.manuallyClosedSubmenus().has(item.route)) {
      return false;
    }

    const url = this.currentUrl();
    return (
      item.children?.some((child) => url === child.route || url.startsWith(`${child.route}/`)) ??
      false
    );
  }

  private labelMatches(labelKey: string, term: string): boolean {
    return this.i18nService.translate(labelKey).toLowerCase().includes(term);
  }

  private resolveInitialSiderWidth(): number {
    const stored = Number(this.browserService.getLocalStorageItem(SIDER_WIDTH_STORAGE_KEY));
    return stored >= SIDER_MIN_WIDTH && stored <= SIDER_MAX_WIDTH ? stored : SIDER_DEFAULT_WIDTH;
  }

  onSubmenuOpenChange(item: NavMenuItem, open: boolean): void {
    this.manuallyClosedSubmenus.update((closed) => {
      const next = new Set(closed);
      if (open) {
        next.delete(item.route);
      } else {
        next.add(item.route);
      }
      return next;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
