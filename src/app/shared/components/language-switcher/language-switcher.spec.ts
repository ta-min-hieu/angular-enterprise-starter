import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { LanguageSwitcher } from './language-switcher';
import { I18nService } from '../../../core/i18n/i18n.service';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('LanguageSwitcher', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [LanguageSwitcher],
      providers: [provideNzIcons(REGISTERED_ICONS), ...provideTranslocoTesting()],
    });
    return TestBed.createComponent(LanguageSwitcher);
  }

  it('should switch the active locale when selectLocale is called', () => {
    const fixture = setup();
    const i18nService = TestBed.inject(I18nService);
    fixture.detectChanges();

    fixture.componentInstance.selectLocale('en');

    expect(i18nService.locale()).toBe('en');
  });
});
