import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { RadioGroupField } from './radio-group-field';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('RadioGroupField', () => {
  it('should render a radio button for each provided option', () => {
    TestBed.configureTestingModule({ providers: [...provideTranslocoTesting()] });
    const fixture = TestBed.createComponent(RadioGroupField);
    fixture.componentRef.setInput('name', 'status');
    fixture.componentRef.setInput('label', 'Trạng thái');
    fixture.componentRef.setInput('control', new FormControl('active', { nonNullable: true }));
    fixture.componentRef.setInput('options', [
      { label: 'Đang bán', value: 'active' },
      { label: 'Ngừng bán', value: 'inactive' },
    ]);
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('label[nz-radio-button]');
    expect(labels.length).toBe(2);
  });
});
