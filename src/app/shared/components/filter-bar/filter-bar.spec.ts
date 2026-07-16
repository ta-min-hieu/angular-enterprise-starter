import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { FilterBar } from './filter-bar';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('FilterBar', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [FilterBar],
      providers: [provideNzIcons(REGISTERED_ICONS), ...provideTranslocoTesting()],
    });

    const fixture = TestBed.createComponent(FilterBar);
    return fixture;
  }

  it('should disable the clear button when there are no active filters', () => {
    const fixture = setup();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button.app-filter-bar__clear');
    expect(button.disabled).toBe(true);
  });

  it('should enable the clear button and emit clear on click when filters are active', () => {
    const fixture = setup();
    fixture.componentRef.setInput('hasActiveFilters', true);
    fixture.detectChanges();

    let cleared = false;
    fixture.componentInstance.clear.subscribe(() => (cleared = true));

    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button.app-filter-bar__clear',
    );
    expect(button.disabled).toBe(false);

    button.click();
    expect(cleared).toBe(true);
  });
});
