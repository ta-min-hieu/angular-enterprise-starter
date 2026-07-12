import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { ThemeToggle } from './theme-toggle';
import { ThemeService } from '../../../core/theme/theme.service';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('ThemeToggle', () => {
  it('should toggle the theme when clicked', () => {
    TestBed.configureTestingModule({
      imports: [ThemeToggle],
      providers: [provideNzIcons(REGISTERED_ICONS), ...provideTranslocoTesting()],
    });
    const fixture = TestBed.createComponent(ThemeToggle);
    const themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();

    const initialTheme = themeService.theme();
    fixture.componentInstance.toggle();

    expect(themeService.theme()).not.toBe(initialTheme);
  });
});
