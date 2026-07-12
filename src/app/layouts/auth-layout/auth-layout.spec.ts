import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { AuthLayout } from './auth-layout';
import { REGISTERED_ICONS } from '../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../core/i18n/testing/provide-transloco-testing';

describe('AuthLayout', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [AuthLayout],
      providers: [
        provideRouter([]),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
      ],
    });

    const fixture = TestBed.createComponent(AuthLayout);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
