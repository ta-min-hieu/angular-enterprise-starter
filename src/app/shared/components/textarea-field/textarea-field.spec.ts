import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { TextareaField } from './textarea-field';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('TextareaField', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [...provideTranslocoTesting()] });
    const fixture = TestBed.createComponent(TextareaField);
    fixture.componentRef.setInput('name', 'description');
    fixture.componentRef.setInput('label', 'Mô tả');
    return fixture;
  }

  it('should bind the control value to the textarea', () => {
    const fixture = setup();
    fixture.componentRef.setInput(
      'control',
      new FormControl('Mô tả sản phẩm', { nonNullable: true }),
    );
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Mô tả sản phẩm');
  });

  it('should apply the configured rows attribute', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
    fixture.componentRef.setInput('rows', 5);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(5);
  });

  it('should default the id to the given name when no id is provided', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl('', { nonNullable: true }));
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.id).toBe('description');
  });
});
