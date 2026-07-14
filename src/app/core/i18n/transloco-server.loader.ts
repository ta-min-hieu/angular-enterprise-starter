import { Injectable } from '@angular/core';
import { TranslocoLoader } from '@jsverse/transloco';
import { Observable, of } from 'rxjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// TranslocoHttpLoader gọi URL tương đối ("/i18n/{lang}.json") qua HttpClient — không resolve được
// lúc SSR (không có browser origin để ghép), làm crash toàn bộ render. Đọc thẳng file JSON đã build
// ra thư mục browser/, cùng cách AppConfigService đọc config.json lúc SSR (app.config.server.ts).
@Injectable({ providedIn: 'root' })
export class TranslocoServerLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Record<string, unknown>> {
    // import.meta.dirname trỏ tới thư mục chứa bundle server đã build (dist/.../server/) —
    // KHÔNG phải vị trí file .ts trong src/ — nên chỉ đi lên 1 cấp tới browser/, giống hệt cách
    // app.config.server.ts đọc config.json (browser/ và server/ là 2 thư mục anh em trong dist).
    // Bọc try/catch (cùng lý do với readRuntimeConfig() ở app.config.server.ts): bước prerender/
    // route-extraction lúc `ng build` chạy server bundle trong thư mục tạm chưa có browser/i18n,
    // nên phải có fallback thay vì throw làm crash cả build.
    try {
      const filePath = join(import.meta.dirname, '../browser/i18n', `${lang}.json`);
      return of(JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>);
    } catch {
      return of({});
    }
  }
}
