import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { AdminLayout } from './admin-layout';
import { TOKEN_STORAGE } from '../../core/storage/token-storage';
import { LocalTokenStorage } from '../../core/storage/local-token-storage';
import { REGISTERED_ICONS } from '../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../core/i18n/testing/provide-transloco-testing';

describe('AdminLayout', () => {
  it('should create with the sidebar collapsed toggle available', () => {
    TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [
        provideRouter([]),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
        { provide: TOKEN_STORAGE, useClass: LocalTokenStorage },
      ],
    });

    const fixture = TestBed.createComponent(AdminLayout);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.collapsed()).toBe(false);

    fixture.componentInstance.toggleCollapsed();
    expect(fixture.componentInstance.collapsed()).toBe(true);
  });
});
