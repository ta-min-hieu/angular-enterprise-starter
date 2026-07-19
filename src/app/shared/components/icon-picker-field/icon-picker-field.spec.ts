import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { IconPickerField } from './icon-picker-field';
import { NAV_ICON_OPTIONS } from './nav-icon.constants';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('IconPickerField', () => {
  function setup(initialValue = '') {
    TestBed.configureTestingModule({
      providers: [provideNzIcons(REGISTERED_ICONS), ...provideTranslocoTesting()],
    });
    const fixture = TestBed.createComponent(IconPickerField);
    fixture.componentRef.setInput('name', 'icon');
    fixture.componentRef.setInput('label', 'Icon');
    fixture.componentRef.setInput('control', new FormControl(initialValue, { nonNullable: true }));
    fixture.detectChanges();
    return fixture;
  }

  it('offers every registered nav icon as a selectable option', () => {
    const fixture = setup();

    expect(fixture.componentInstance.options).toEqual(NAV_ICON_OPTIONS);
    expect(fixture.componentInstance.options.length).toBeGreaterThan(0);
  });

  it('shows a placeholder preview icon when no icon is selected', () => {
    const fixture = setup('');

    expect(fixture.componentInstance.control().value).toBe('');
    const preview = fixture.nativeElement.querySelector('.app-icon-picker-field__preview');
    expect(preview.querySelector('[aria-label="appstore"]')).not.toBeNull();
  });

  it('shows the selected icon in the preview', () => {
    const fixture = setup('shopping');

    const preview = fixture.nativeElement.querySelector('.app-icon-picker-field__preview');
    expect(preview.querySelector('[aria-label="shopping"]')).not.toBeNull();
  });

  it('defaults required to false, unlike other field components', () => {
    const fixture = setup();

    expect(fixture.componentInstance.required()).toBe(false);
  });

  it('resolves the id from name when no explicit id is provided', () => {
    const fixture = setup();

    expect(fixture.componentInstance.resolvedId()).toBe('icon');
  });
});
