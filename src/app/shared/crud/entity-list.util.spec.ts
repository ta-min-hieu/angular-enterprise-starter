import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEntityListState } from './entity-list.util';
import { AppError } from '../../core/error/app-error';
import { ErrorCategory } from '../../core/error/error-category';
import { provideTranslocoTesting } from '../../core/i18n/testing/provide-transloco-testing';

interface Item {
  readonly id: string;
  readonly name: string;
}

const ITEMS: readonly Item[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
];

const SOME_ERROR: AppError = {
  category: ErrorCategory.Unexpected,
  code: 'ERR',
  message: 'boom',
  retryable: false,
};

describe('createEntityListState', () => {
  const messageService = { success: vi.fn(), error: vi.fn() };

  beforeEach(() => {
    messageService.success.mockReset();
    messageService.error.mockReset();
    TestBed.configureTestingModule({
      providers: [
        ...provideTranslocoTesting(),
        { provide: NzMessageService, useValue: messageService },
      ],
    });
  });

  function setup(load = vi.fn().mockReturnValue(of(undefined))) {
    const items = signal(ITEMS);
    const remove = vi.fn().mockReturnValue(of(undefined));

    const state = TestBed.runInInjectionContext(() =>
      createEntityListState({
        items,
        load,
        remove,
        matches: (item, keyword) => item.name.toLowerCase().includes(keyword),
      }),
    );

    return { state, items, load, remove };
  }

  it('loads immediately on creation', () => {
    const { load } = setup();

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('returns all items when there is no keyword', () => {
    const { state } = setup();

    expect(state.filteredItems()).toEqual(ITEMS);
  });

  it('filters items case-insensitively via the matches predicate', () => {
    const { state } = setup();

    state.onKeywordChange('BETA');

    expect(state.filteredItems()).toEqual([ITEMS[1]]);
  });

  it('sets the error signal when load fails', () => {
    const load = vi.fn().mockReturnValue(throwError(() => SOME_ERROR));
    const { state } = setup(load);

    expect(state.error()).toEqual(SOME_ERROR);
  });

  it('clears a previous error and reloads on refresh()', () => {
    const firstLoad$ = new Subject<unknown>();
    const load = vi.fn().mockReturnValueOnce(firstLoad$).mockReturnValue(of(undefined));
    const { state } = setup(load);
    firstLoad$.error(SOME_ERROR);
    expect(state.error()).toEqual(SOME_ERROR);

    state.refresh();

    expect(state.error()).toBeNull();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('removes by id, shows a success notification and refreshes on delete', () => {
    const { state, remove, load } = setup();

    state.onDelete('1');

    expect(remove).toHaveBeenCalledWith('1');
    expect(messageService.success).toHaveBeenCalled();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('shows an error notification and does not refresh when delete fails', () => {
    const items = signal(ITEMS);
    const load = vi.fn().mockReturnValue(of(undefined));
    const remove = vi.fn().mockReturnValue(throwError(() => SOME_ERROR));

    const state = TestBed.runInInjectionContext(() =>
      createEntityListState({
        items,
        load,
        remove,
        matches: (item, keyword) => item.name.toLowerCase().includes(keyword),
      }),
    );

    state.onDelete('1');

    expect(messageService.error).toHaveBeenCalled();
    expect(load).toHaveBeenCalledTimes(1);
  });
});
