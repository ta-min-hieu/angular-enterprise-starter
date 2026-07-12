import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Pagination } from './pagination';

describe('Pagination', () => {
  function setup(pageIndex: number, total: number) {
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentRef.setInput('pageIndex', pageIndex);
    fixture.componentRef.setInput('total', total);
    fixture.detectChanges();
    return fixture;
  }

  it('should default pageSize to 10 when not provided', () => {
    const fixture = setup(1, 25);

    expect(fixture.componentInstance.pageSize()).toBe(10);
  });

  it('should emit pageIndexChange when the page changes', () => {
    const fixture = setup(1, 25);
    let emitted: number | undefined;
    fixture.componentInstance.pageIndexChange.subscribe((page) => (emitted = page));

    fixture.componentInstance.pageIndexChange.emit(2);

    expect(emitted).toBe(2);
  });

  it('should emit pageSizeChange when the page size changes', () => {
    const fixture = setup(1, 25);
    let emitted: number | undefined;
    fixture.componentInstance.pageSizeChange.subscribe((size) => (emitted = size));

    fixture.componentInstance.pageSizeChange.emit(20);

    expect(emitted).toBe(20);
  });
});
