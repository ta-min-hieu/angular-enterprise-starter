import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CompactPagination } from './compact-pagination';

describe('CompactPagination', () => {
  function setup(pageIndex: number, totalPages: number) {
    const fixture = TestBed.createComponent(CompactPagination);
    fixture.componentRef.setInput('pageIndex', pageIndex);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.detectChanges();
    return fixture;
  }

  it('should render nothing when there is only one page', () => {
    const fixture = setup(1, 1);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.app-compact-pagination')).toBeNull();
  });

  it('should show all pages without ellipsis when the page count is small', () => {
    const fixture = setup(2, 4);

    expect(fixture.componentInstance.pageItems()).toEqual([1, 2, 3, 4]);
  });

  it('should collapse the middle into a single ellipsis on both sides', () => {
    const fixture = setup(5, 16);

    expect(fixture.componentInstance.pageItems()).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 16]);
  });

  it('should not show a leading ellipsis when the current page is near the start', () => {
    const fixture = setup(1, 16);

    expect(fixture.componentInstance.pageItems()).toEqual([1, 2, 'ellipsis', 16]);
  });

  it('should not show a trailing ellipsis when the current page is near the end', () => {
    const fixture = setup(16, 16);

    expect(fixture.componentInstance.pageItems()).toEqual([1, 'ellipsis', 15, 16]);
  });

  it('should emit pageIndexChange when a page button is clicked', () => {
    const fixture = setup(5, 16);
    let emitted: number | undefined;
    fixture.componentInstance.pageIndexChange.subscribe((page) => (emitted = page));

    fixture.componentInstance.goTo(6);

    expect(emitted).toBe(6);
  });

  it('should not emit when the target page is out of range or unchanged', () => {
    const fixture = setup(5, 16);
    let emitted = false;
    fixture.componentInstance.pageIndexChange.subscribe(() => (emitted = true));

    fixture.componentInstance.goTo(5);
    fixture.componentInstance.goTo(0);
    fixture.componentInstance.goTo(17);

    expect(emitted).toBe(false);
  });
});
