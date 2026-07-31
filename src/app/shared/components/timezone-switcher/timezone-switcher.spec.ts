import { TestBed } from '@angular/core/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { TimezoneSwitcher } from './timezone-switcher';
import { TimezoneService } from '../../../core/timezone/timezone.service';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';

describe('TimezoneSwitcher', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [TimezoneSwitcher],
      providers: [provideNzIcons(REGISTERED_ICONS)],
    });
    return TestBed.createComponent(TimezoneSwitcher);
  }

  it('should switch the active timezone when selectTimezone is called', () => {
    const fixture = setup();
    const timezoneService = TestBed.inject(TimezoneService);
    fixture.detectChanges();

    fixture.componentInstance.selectTimezone('UTC');

    expect(timezoneService.timezone()).toBe('UTC');
  });
});
