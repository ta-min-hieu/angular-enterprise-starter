import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { DateField, DATE_FORMAT, DATE_TIME_FORMAT } from './date-field';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('DateField', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideNzIcons(REGISTERED_ICONS),
        provideNzI18n(en_US),
        ...provideTranslocoTesting(),
      ],
    });
    const fixture = TestBed.createComponent(DateField);
    fixture.componentRef.setInput('name', 'releaseDate');
    fixture.componentRef.setInput('label', 'Ngày phát hành');
    return fixture;
  }

  it('should default to the date-only format when showTime is not set', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl<Date | null>(null));
    fixture.detectChanges();

    expect(fixture.componentInstance.resolvedFormat()).toBe(DATE_FORMAT);
  });

  it('should default to the date-time format when showTime is set', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl<Date | null>(null));
    fixture.componentRef.setInput('showTime', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.resolvedFormat()).toBe(DATE_TIME_FORMAT);
  });

  it('should use an explicitly provided format over the default', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl<Date | null>(null));
    fixture.componentRef.setInput('format', 'yyyy-MM-dd');
    fixture.detectChanges();

    expect(fixture.componentInstance.resolvedFormat()).toBe('yyyy-MM-dd');
  });
});
