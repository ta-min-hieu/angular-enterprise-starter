import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { initializeLocale } from './i18n.initializer';
import { I18nService } from './i18n.service';

describe('initializeLocale', () => {
  it('resolves only after the translation for the resolved locale has loaded', async () => {
    const setLocale = vi.fn();
    const load = vi.fn().mockReturnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: I18nService,
          useValue: { resolveInitialLocale: () => 'en', setLocale },
        },
        { provide: TranslocoService, useValue: { load } },
      ],
    });

    await TestBed.runInInjectionContext(() => initializeLocale());

    expect(setLocale).toHaveBeenCalledWith('en');
    expect(load).toHaveBeenCalledWith('en');
  });
});
