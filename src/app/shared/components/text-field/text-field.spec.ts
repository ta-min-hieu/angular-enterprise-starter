import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { TextField } from './text-field';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('TextField', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [...provideTranslocoTesting()] });
    const fixture = TestBed.createComponent(TextField);
    fixture.componentRef.setInput('name', 'name');
    fixture.componentRef.setInput('label', 'Tên sản phẩm');
    return fixture;
  }

  it('should mark the field as required when the control has a required validator', () => {
    const fixture = setup();
    fixture.componentRef.setInput(
      'control',
      new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.required()).toBe(true);
  });

  it('should not mark the field as required when the control has no required validator', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.required()).toBe(false);
  });

  it('should bind the control to the native input', () => {
    const fixture = setup();
    const control = new FormControl('Bàn phím', { nonNullable: true });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Bàn phím');
  });

  it('should default the id to the given name when no id is provided', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.id).toBe('name');
  });

  it('should use an explicitly provided id over the default', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
    fixture.componentRef.setInput('id', 'custom-id');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.id).toBe('custom-id');
  });

  it('should derive a default placeholder and error message from the label', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.resolvedPlaceholder()).toBe('Nhập Tên sản phẩm');
    expect(fixture.componentInstance.resolvedErrorMessage()).toBe('Vui lòng nhập Tên sản phẩm');
  });
});
