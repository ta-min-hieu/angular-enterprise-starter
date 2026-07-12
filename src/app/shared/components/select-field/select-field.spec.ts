import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { SelectField } from './select-field';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

const OPTIONS = [
  { label: 'Phụ kiện', value: 'accessories' },
  { label: 'Màn hình', value: 'monitors' },
];

describe('SelectField', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [provideNzIcons(REGISTERED_ICONS), ...provideTranslocoTesting()],
    });
    const fixture = TestBed.createComponent(SelectField);
    fixture.componentRef.setInput('name', 'category');
    fixture.componentRef.setInput('label', 'Danh mục');
    return fixture;
  }

  it('should render the nz-select bound to the given control and options', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl('accessories', { nonNullable: true }));
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();

    const nzSelect = fixture.nativeElement.querySelector('nz-select');
    expect(nzSelect).not.toBeNull();
    expect(fixture.componentInstance.options()).toEqual(OPTIONS);
    expect(fixture.componentInstance.control().value).toBe('accessories');
  });

  it('should mark the field as required when the control has a required validator', () => {
    const fixture = setup();
    fixture.componentRef.setInput(
      'control',
      new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    );
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();

    expect(fixture.componentInstance.required()).toBe(true);
  });
});
