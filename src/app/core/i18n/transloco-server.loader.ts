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
    // Bước prerender/route-extraction lúc `ng build` chạy server bundle trong thư mục tạm CHƯA có
    // browser/i18n (chỉ tồn tại ở dist thật lúc runtime) — fallback đọc thẳng từ public/i18n theo
    // process.cwd() (luôn là project root khi `ng build`/prerender chạy), source-of-truth giống hệt
    // nội dung sẽ được copy vào browser/i18n, nên kết quả dịch ra HTML tĩnh vẫn đúng thay vì rỗng.
    try {
      const filePath = join(import.meta.dirname, '../browser/i18n', `${lang}.json`);
      return of(JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>);
    } catch {
      try {
        const fallbackPath = join(process.cwd(), 'public/i18n', `${lang}.json`);
        return of(JSON.parse(readFileSync(fallbackPath, 'utf-8')) as Record<string, unknown>);
      } catch {
        return of({});
      }
    }
  }
}
