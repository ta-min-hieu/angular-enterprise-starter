import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nService } from './i18n.service';
import { provideTranslocoTesting } from './testing/provide-transloco-testing';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideTranslocoTesting()],
    });
    service = TestBed.inject(I18nService);
  });

  it('should default to vi when nothing is stored', () => {
    expect(service.resolveInitialLocale('vi')).toBe('vi');
  });

  it('should expose the available locales', () => {
    expect(service.availableLocales.map((locale) => locale.code)).toEqual(['vi', 'en']);
  });

  it('should update the active locale when setLocale is called', () => {
    service.setLocale('en');

    expect(service.locale()).toBe('en');
  });

  it('should ignore an unsupported stored locale', () => {
    localStorage.setItem('app.locale', 'fr');

    expect(service.resolveInitialLocale('vi')).toBe('vi');

    localStorage.removeItem('app.locale');
  });
});
