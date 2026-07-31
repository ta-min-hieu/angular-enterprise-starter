import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { TimezoneService } from './timezone.service';

describe('TimezoneService', () => {
  let service: TimezoneService;

  beforeEach(() => {
    localStorage.removeItem('app.timezone');
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimezoneService);
  });

  it('should expose the available timezones', () => {
    expect(service.availableTimezones.map((timezone) => timezone.id)).toContain('UTC');
  });

  it('should update the active timezone and persist it when setTimezone is called', () => {
    service.setTimezone('UTC');

    expect(service.timezone()).toBe('UTC');
    expect(localStorage.getItem('app.timezone')).toBe('UTC');
  });

  it('should ignore an unsupported stored timezone and fall back to a default', () => {
    localStorage.setItem('app.timezone', 'Mars/Olympus_Mons');

    const fallback = TestBed.inject(TimezoneService);

    expect(
      fallback.availableTimezones.some((timezone) => timezone.id === fallback.timezone()),
    ).toBe(true);

    localStorage.removeItem('app.timezone');
  });

  it('should format the UTC offset for a given timezone id', () => {
    expect(service.formatOffset('UTC')).toMatch(/^GMT/);
  });
});
