import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { ThemeToggle } from './theme-toggle';
import { ThemeService } from '../../../core/theme/theme.service';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';

describe('ThemeToggle', () => {
  it('should toggle the theme when clicked', () => {
    TestBed.configureTestingModule({
      imports: [ThemeToggle],
      providers: [provideNzIcons(REGISTERED_ICONS)],
    });
    const fixture = TestBed.createComponent(ThemeToggle);
    const themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();

    const initialTheme = themeService.theme();
    fixture.componentInstance.toggle();

    expect(themeService.theme()).not.toBe(initialTheme);
  });
});
