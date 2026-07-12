import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { MultiSelectField } from './multi-select-field';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

const OPTIONS = [
  { label: 'Mới', value: 'new' },
  { label: 'Bán chạy', value: 'best-seller' },
];

describe('MultiSelectField', () => {
  it('should render the nz-select bound to the given control and options', () => {
    TestBed.configureTestingModule({
      providers: [provideNzIcons(REGISTERED_ICONS), ...provideTranslocoTesting()],
    });
    const fixture = TestBed.createComponent(MultiSelectField);
    fixture.componentRef.setInput('name', 'tags');
    fixture.componentRef.setInput('label', 'Nhãn');
    const control = new FormControl<string[]>(['new'], { nonNullable: true });
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();

    const nzSelect = fixture.nativeElement.querySelector('nz-select[nzmode="multiple"]');
    expect(nzSelect).not.toBeNull();
    expect(fixture.componentInstance.options()).toEqual(OPTIONS);
    expect(fixture.componentInstance.control().value).toEqual(['new']);
  });
});
