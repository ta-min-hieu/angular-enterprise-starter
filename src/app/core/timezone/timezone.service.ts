import { Injectable, inject, signal } from '@angular/core';
import { BrowserService } from '../browser/browser.service';
import { TimezoneOption } from './timezone-option.model';

const TIMEZONE_STORAGE_KEY = 'app.timezone';
const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

// DANH SÁCH NÀY DÙNG OFFSET SỐNG (formatOffset tính theo DST hiện tại), nên 1 múi giờ có DST chỉ
// thực sự "che phủ" được đúng 1 trong 2 giá trị (chuẩn/DST) tại một thời điểm — nửa còn lại BỊ TRỐNG
// trừ khi có múi giờ khác lấp vào đúng lúc đó. 2 kiểu lấp chỗ trống đang dùng ở đây:
//
// 1) "Relay" tự nhiên giữa các múi giờ có DST liền kề nhau đúng 1 giờ, cùng lịch DST (chuỗi Mỹ
//    Anchorage-LA-Denver-Chicago-NewYork, và London-Paris): DST của múi giờ bên trái == chuẩn của
//    múi giờ bên phải, nên khoảng offset ở GIỮA chuỗi luôn có người che dù đổi mùa. Islande có ích
//    lợi kép: vừa quen thuộc (tên thành phố lớn) vừa không cần thêm gì.
// 2) Với offset không nằm trong chuỗi nào (đầu/cuối chuỗi, hoặc đứng riêng lẻ — vd -9, -4, +2, +5,
//    +9:30, +10, +11, +12), phải thêm 1 múi giờ KHÔNG có DST (permanent) làm "neo" để offset đó
//    LUÔN xuất hiện quanh năm — nếu không, người dùng mở danh sách vào đúng lúc múi giờ duy nhất che
//    offset đó đang lệch sang giá trị khác sẽ thấy "thiếu" (đây là lỗi thực tế đã gặp: +5 chưa từng
//    có ai che, -9 chỉ có Anchorage che vào mùa đông nên biến mất mùa hè).
//
// Vài neo cố định trùng offset với 1 thành phố quen thuộc có DST vào ĐÚNG mùa DST của thành phố đó
// (vd Nouméa +11 cố định trùng Sydney +11 vào hè Nam bán cầu, Johannesburg +2 cố định trùng Paris
// +2 vào hè Bắc bán cầu) — CHẤP NHẬN được, giống cặp UTC/London đã có từ trước: ưu tiên "không bao
// giờ trống" hơn "không bao giờ trùng nhau", vì trống hẳn (không hiện dòng nào cho offset đó) là vấn
// đề người dùng thực sự gặp phải, còn thỉnh thoảng trùng số với 1 thành phố khác là chuyện bình
// thường ở mọi timezone picker thực tế.
//
// Thứ tự khai báo ở đây KHÔNG quan trọng — TimezoneService sắp lại theo offset sống tại thời điểm
// chạy (xem sortByCurrentOffset bên dưới).
export const AVAILABLE_TIMEZONES: readonly TimezoneOption[] = sortByCurrentOffset([
  { id: 'Pacific/Pago_Pago', label: 'Samoa' },
  { id: 'Pacific/Honolulu', label: 'Honolulu' },
  // Neo cố định -9 quanh năm — Anchorage chỉ ở -9 vào mùa đông, mùa hè chuyển sang -8.
  { id: 'Pacific/Gambier', label: 'Gambier' },
  { id: 'America/Anchorage', label: 'Anchorage' },
  { id: 'America/Los_Angeles', label: 'Los Angeles' },
  { id: 'America/Denver', label: 'Denver' },
  { id: 'America/Chicago', label: 'Chicago' },
  { id: 'America/New_York', label: 'New York' },
  // Neo cố định -4 quanh năm — New York chỉ ở -4 vào mùa hè, mùa đông chuyển sang -5.
  { id: 'America/Santo_Domingo', label: 'Santo Domingo' },
  { id: 'America/St_Johns', label: "St. John's" },
  { id: 'America/Sao_Paulo', label: 'São Paulo' },
  { id: 'America/Noronha', label: 'Fernando de Noronha' },
  { id: 'Atlantic/Cape_Verde', label: 'Cabo Verde' },
  { id: 'UTC', label: 'UTC' },
  { id: 'Europe/London', label: 'London' },
  { id: 'Europe/Paris', label: 'Paris' },
  // Neo cố định +2 quanh năm — Paris chỉ ở +2 vào mùa hè, mùa đông chuyển sang +1.
  { id: 'Africa/Johannesburg', label: 'Johannesburg' },
  { id: 'Europe/Moscow', label: 'Moscow' },
  { id: 'Asia/Tehran', label: 'Tehran' },
  { id: 'Asia/Dubai', label: 'Dubai' },
  // +5 — trước đây bị bỏ trống hoàn toàn (không múi giờ nào trong danh sách che offset này).
  { id: 'Asia/Karachi', label: 'Karachi' },
  { id: 'Asia/Kolkata', label: 'Kolkata' },
  { id: 'Asia/Dhaka', label: 'Dhaka' },
  { id: 'Asia/Ho_Chi_Minh', label: 'Hồ Chí Minh' },
  { id: 'Asia/Singapore', label: 'Singapore' },
  { id: 'Asia/Tokyo', label: 'Tokyo' },
  // Khối Úc/Thái Bình Dương không có "relay" tự nhiên (khoảng cách offset giữa các thành phố không
  // khớp DST của nhau) — mỗi offset (9:30/10/11/12) cần neo cố định riêng, nếu không sẽ trống theo
  // mùa y hệt kiểu +5 từng bị.
  { id: 'Australia/Darwin', label: 'Darwin' },
  { id: 'Australia/Adelaide', label: 'Adelaide' },
  { id: 'Australia/Brisbane', label: 'Brisbane' },
  { id: 'Australia/Sydney', label: 'Sydney' },
  { id: 'Pacific/Noumea', label: 'Nouméa' },
  { id: 'Pacific/Tarawa', label: 'Tarawa' },
  { id: 'Pacific/Auckland', label: 'Auckland' },
]);

// Số phút lệch so với UTC của 1 IANA timezone TẠI THỜI ĐIỂM date (mặc định "bây giờ") — tính bằng
// cách format cùng 1 instant theo giờ địa phương của timeZone rồi so với giờ UTC thực, không dùng
// offset tĩnh vì sai theo DST/mùa.
function offsetMinutes(timeZone: string, date: Date = new Date()): number {
  const parts: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)) {
    parts[part.type] = part.value;
  }

  const asUtc = Date.UTC(
    Number(parts['year']),
    Number(parts['month']) - 1,
    Number(parts['day']),
    Number(parts['hour']),
    Number(parts['minute']),
    Number(parts['second']),
  );
  return (asUtc - date.getTime()) / 60_000;
}

function sortByCurrentOffset(timezones: readonly TimezoneOption[]): readonly TimezoneOption[] {
  const now = new Date();
  return [...timezones].sort((a, b) => offsetMinutes(a.id, now) - offsetMinutes(b.id, now));
}

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
