import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('should create with default message', () => {
    TestBed.configureTestingModule({ imports: [EmptyState] });
    const fixture = TestBed.createComponent(EmptyState);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.message()).toBe('Không có dữ liệu');
  });

  it('should render a custom message', () => {
    TestBed.configureTestingModule({ imports: [EmptyState] });
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('message', 'Chưa có đơn hàng nào');

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Chưa có đơn hàng nào');
  });
});
