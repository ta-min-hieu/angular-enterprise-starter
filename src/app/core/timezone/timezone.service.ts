import { Injectable, inject, signal } from '@angular/core';
import { BrowserService } from '../browser/browser.service';
import { TimezoneOption } from './timezone-option.model';

const TIMEZONE_STORAGE_KEY = 'app.timezone';
const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

export const AVAILABLE_TIMEZONES: readonly TimezoneOption[] = [
  { id: 'Pacific/Honolulu', label: 'Honolulu' },
  { id: 'America/Los_Angeles', label: 'Los Angeles' },
  { id: 'America/Denver', label: 'Denver' },
  { id: 'America/Chicago', label: 'Chicago' },
  { id: 'America/New_York', label: 'New York' },
  { id: 'UTC', label: 'UTC' },
  { id: 'Europe/London', label: 'London' },
  { id: 'Europe/Paris', label: 'Paris' },
  { id: 'Europe/Moscow', label: 'Moscow' },
  { id: 'Asia/Dubai', label: 'Dubai' },
  { id: 'Asia/Kolkata', label: 'Kolkata' },
  { id: 'Asia/Bangkok', label: 'Bangkok' },
  { id: 'Asia/Ho_Chi_Minh', label: 'Hồ Chí Minh' },
  { id: 'Asia/Shanghai', label: 'Thượng Hải' },
  { id: 'Asia/Singapore', label: 'Singapore' },
  { id: 'Asia/Tokyo', label: 'Tokyo' },
  { id: 'Australia/Sydney', label: 'Sydney' },
];

@Injectable({ providedIn: 'root' })
export class TimezoneService {
  private readonly browserService = inject(BrowserService);

  private readonly timezoneSignal = signal<string>(this.resolveInitialTimezone());

  readonly timezone = this.timezoneSignal.asReadonly();
  readonly availableTimezones = AVAILABLE_TIMEZONES;

  setTimezone(id: string): void {
    this.timezoneSignal.set(id);
    this.browserService.setLocalStorageItem(TIMEZONE_STORAGE_KEY, id);
  }

  // shortOffset tự tính đúng giờ DST theo ngày hiện tại (vd America/New_York ra UTC-05:00 hay
  // UTC-04:00 tuỳ mùa) — không hardcode offset tĩnh vào AVAILABLE_TIMEZONES vì sẽ sai theo mùa.
  formatOffset(id: string): string {
    if (!this.browserService.isBrowser) {
      return '';
    }

    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: id,
        timeZoneName: 'shortOffset',
      }).formatToParts(new Date());
      return parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
    } catch {
      return '';
    }
  }

  private resolveInitialTimezone(): string {
    const stored = this.browserService.getLocalStorageItem(TIMEZONE_STORAGE_KEY);
    if (stored && AVAILABLE_TIMEZONES.some((timezone) => timezone.id === stored)) {
      return stored;
    }

    // Chỉ auto-detect timezone trình duyệt ở client — Node server (SSR) có timezone riêng của
    // host, không phản ánh timezone thật của người dùng, dùng sẽ gây lệch nội dung server/client
    // (giống cách ThemeService bỏ qua matchMedia lúc SSR).
    if (this.browserService.isBrowser) {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (AVAILABLE_TIMEZONES.some((timezone) => timezone.id === detected)) {
        return detected;
      }
    }

    return DEFAULT_TIMEZONE;
  }
}
