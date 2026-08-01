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

  // KHÔNG so sánh offset "hiện tại" (formatOffset) giữa các mục — múi giờ có DST ở 1 trong 2 bán
  // cầu luôn trùng offset với 1 múi giờ cố định khác vào 1 thời điểm nào đó trong năm (vd Sydney
  // DST +11 mùa hè trùng Nouméa +11 quanh năm) — đó là vật lý DST thật, không phải lỗi dữ liệu, nên
  // assert "không bao giờ trùng" sẽ luôn flaky theo ngày chạy test. Chỉ đảm bảo không có 2 dòng
  // TRÙNG HẲN (copy-paste nhầm) — đúng loại lỗi ban đầu bị phát hiện (Bangkok/Hồ Chí Minh, Thượng
  // Hải/Singapore từng là 2 dòng khác id nhưng luôn cùng offset cố định quanh năm).
  it('should not list two entries with the same id or the same label', () => {
    const ids = service.availableTimezones.map((timezone) => timezone.id);
    const labels = service.availableTimezones.map((timezone) => timezone.label);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
