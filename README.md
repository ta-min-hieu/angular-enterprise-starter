# Angular Enterprise Starter

Angular Enterprise Starter — nền tảng Frontend tái sử dụng cho nhiều loại dự án (CMS, Admin Portal, ERP, CRM, E-commerce, Customer Portal, Landing Page, Blog...). Đây là Frontend Only, không bao gồm Backend.

Đặc tả đầy đủ nằm trong [`docs/`](./docs) — đọc [`CLAUDE.md`](./CLAUDE.md) trước khi đóng góp code.

## Technology Stack

- Angular 21 (LTS), TypeScript Strict, Standalone APIs, Zoneless Change Detection
- Signals + `@ngrx/signals` (Signal Store cho Feature phức tạp), Reactive Forms
- Ng-Zorro 21.x (CSS Variable Theming)
- Vitest (Unit Test), Playwright (E2E — thêm khi có Feature đầu tiên)
- Docker + Nginx (Reverse Proxy) + Node SSR Server
- ESLint, Prettier, EditorConfig, Husky, lint-staged, commitlint

## Yêu cầu môi trường

- Node.js ≥ 22.22.0 hoặc ≥ 24.13.1
- npm

## Cài đặt

```bash
npm ci
```

## Development server

```bash
npm start
```

Mở `http://localhost:4200/`.

## Build

```bash
npm run build
```

Kết quả build nằm trong `dist/angular-enterprise-starter/` (gồm `browser/` và `server/`).

## Test

```bash
npm test              # chạy một lần
npm run test:coverage # chạy kèm coverage report, áp ngưỡng doc10 (Line/Function ≥80%, Branch ≥70%)
```

## Lint

```bash
npm run lint
```

## Docker

Chạy toàn bộ stack (Node SSR + Nginx Reverse Proxy):

```bash
docker compose up -d --build
```

Ứng dụng phục vụ qua Nginx tại `http://localhost:8080/`.

Trước khi deploy lên domain thật, xem `docs/12-docker.md` § SSRF Host Allowlist — bắt buộc thêm domain vào `angular.json` → `security.allowedHosts`.

## Cấu trúc thư mục

Xem chi tiết tại [`docs/02-folder-structure.md`](./docs/02-folder-structure.md). Tóm tắt:

```
public/
src/
  app/
    core/       # Singleton: Auth, Config, Logger, Interceptor, Error Handling, Theme
    shared/     # Component/Directive/Pipe dùng chung, không thuộc riêng Feature nào
    features/   # Nghiệp vụ — trống ở Starter, thêm khi có dự án cụ thể
    layouts/    # Public / Admin / Customer / Auth Layout
    routes/     # Route Table cấp Application
  styles/       # Design Token (CSS Custom Properties) + Theme
```

## Tài liệu

Toàn bộ quy tắc kiến trúc, coding standard, bảo mật, testing, CI/CD... nằm trong [`docs/`](./docs). Khi có mâu thuẫn, thứ tự ưu tiên: `01-project-spec.md` → `14-architecture-principles.md` → `03-coding-standard.md` → các tài liệu còn lại.
