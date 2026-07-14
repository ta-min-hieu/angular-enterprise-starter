import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { HasRoleDirective } from './has-role.directive';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-has-role-host',
  imports: [HasRoleDirective],
  template: `<span *appHasRole="role">secret</span>`,
})
class HostComponent {
  role: string | readonly string[] = 'ADMIN';
}

describe('HasRoleDirective', () => {
  function setup(hasAnyRole: (roles: readonly string[]) => boolean) {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: AuthService, useValue: { hasAnyRole } }],
    });
    return TestBed.createComponent(HostComponent);
  }

  it('should render the content when the user has the required role', () => {
    const fixture = setup((roles) => roles.includes('ADMIN'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('secret');
  });

  it('should not render the content when the user lacks the required role', () => {
    const fixture = setup(() => false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('secret');
  });

  it('should accept an array of roles and pass it through as-is', () => {
    let received: readonly string[] | undefined;
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            hasAnyRole: (roles: readonly string[]) => {
              received = roles;
              return true;
            },
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.role = ['ADMIN', 'MANAGER'];
    fixture.detectChanges();

    expect(received).toEqual(['ADMIN', 'MANAGER']);
  });
});
