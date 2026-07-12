import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { CheckboxField } from './checkbox-field';

describe('CheckboxField', () => {
  function setup() {
    const fixture = TestBed.createComponent(CheckboxField);
    fixture.componentRef.setInput('name', 'featured');
    return fixture;
  }

  it('should render the label text next to the checkbox', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl(false, { nonNullable: true }));
    fixture.componentRef.setInput('label', 'Sản phẩm nổi bật');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sản phẩm nổi bật');
  });

  it('should reflect the control value on the checkbox', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl(true, { nonNullable: true }));
    fixture.componentRef.setInput('label', 'Sản phẩm nổi bật');
    fixture.detectChanges();

    const checkbox = fixture.nativeElement.querySelector('.ant-checkbox') as HTMLElement;
    expect(checkbox.classList).toContain('ant-checkbox-checked');
  });

  it('should default the id to the given name when no id is provided', () => {
    const fixture = setup();
    fixture.componentRef.setInput('control', new FormControl(false, { nonNullable: true }));
    fixture.componentRef.setInput('label', 'Sản phẩm nổi bật');
    fixture.detectChanges();

    expect(fixture.componentInstance.resolvedId()).toBe('featured');
  });
});
