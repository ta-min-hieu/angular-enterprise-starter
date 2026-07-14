import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

// Song song với HasPermissionDirective — dùng cái này trước vì backend hiện chỉ trả claim "roles"
// trong JWT (chưa có permission chi tiết), nên đây là cơ chế phân quyền Template dùng được ngay.
@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private hasView = false;

  // Nhận 1 role hoặc danh sách role — hiển thị nếu user có BẤT KỲ role nào trong đó.
  readonly appHasRole = input.required<string | readonly string[]>();

  constructor() {
    effect(() => {
      const roles = this.appHasRole();
      const isAllowed = this.authService.hasAnyRole(Array.isArray(roles) ? roles : [roles]);

      if (isAllowed && !this.hasView) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!isAllowed && this.hasView) {
        this.viewContainerRef.clear();
        this.hasView = false;
      }
    });
  }
}
