import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { NumberField } from './number-field';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('NumberField', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [...provideTranslocoTesting()] });
    const fixture = TestBed.createComponent(NumberField);
    fixture.componentRef.setInput('name', 'price');
    fixture.componentRef.setInput('label', 'Giá');
    return fixture;
  }

  it('should default to required when the required input is not provided', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl(0, { nonNullable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.required()).toBe(true);
  });

  it('should not mark the field as required when required is explicitly set to false', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl(0, { nonNullable: true }));
    fixture.componentRef.setInput('required', false);
    fixture.detectChanges();

    expect(fixture.componentInstance.required()).toBe(false);
  });

  it('should apply a custom formatter when provided', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl(1000, { nonNullable: true }));
    fixture.componentRef.setInput('formatter', (value: number) => `${value} đ`);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('1000 đ');
  });

  it('should default the id to the given name when no id is provided', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl(0, { nonNullable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.resolvedId()).toBe('price');
  });
});
