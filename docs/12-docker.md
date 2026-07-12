# Docker

## Purpose

Starter phải có khả năng chạy bằng Docker ngay từ đầu.

Docker chỉ phục vụ Frontend.

Không bao gồm Backend.

---

# Build Strategy

Ưu tiên Multi-stage Build.

Stage 1

↓

Build Angular.

Stage 2

↓

Deploy bằng Nginx.

Không deploy Production bằng Angular Development Server.

---

# Runtime

Production:

Angular Build

↓

Nginx

SSR Project (nếu có):

Angular

↓

Node Server

↓

Reverse Proxy

---

# Dockerfile

Yêu cầu:

Image nhỏ.

Cache Layer hợp lý.

Không copy thừa file.

Build ổn định.

---

# docker-compose

Chỉ phục vụ:

Frontend

Network

Environment

Không cấu hình Database.

Không cấu hình Redis.

Không cấu hình Backend.

---

# Nginx

Chuẩn bị:

gzip

Brotli (nếu phù hợp)

Static Cache

SPA Routing

Security Header

Compression

## Triển khai thực tế (đã chốt)

Vì Starter chạy SSR (xem Runtime), Nginx đóng vai trò Reverse Proxy đứng trước Node Server (`docker/nginx.conf`), không tự phục vụ file tĩnh. gzip bật đầy đủ; Brotli không dùng ở baseline (tránh phụ thuộc base image nginx tùy biến ngoài chuẩn) — có thể bổ sung sau nếu cần. Cache Header cho file tĩnh (`js/css/image/font`) đặt tại Nginx. SPA Routing / fallback do `AngularNodeAppEngine` ở tầng Node xử lý (không dùng `try_files` ở Nginx vì Nginx không giữ bản copy file tĩnh).

---

# Environment

Không hardcode.

Có thể thay đổi bằng:

Docker Environment

Runtime Config

## Cơ chế Runtime Config (đã chốt)

Starter chạy theo mô hình SSR (Node Server đứng sau Nginx Reverse Proxy — xem mục Runtime). `docker-entrypoint.sh` của container Node đọc Environment Variable và ghi đè vào `dist/.../browser/config.json` bằng `envsubst` (từ `config.template.json`) trước khi khởi động `node server.mjs`. Nginx trong kiến trúc này không phục vụ file tĩnh trực tiếp, chỉ reverse proxy tới Node — nên việc sinh config phải xảy ra ở entrypoint của container Node, không phải Nginx.

Ở môi trường dev (`ng serve`), `public/config.json` chứa giá trị mặc định tĩnh, không qua envsubst.

Angular đọc `config.json` lúc bootstrap qua `provideAppInitializer` (Core Layer), lưu vào `AppConfigService` (Signal). Business Layer chỉ inject `AppConfigService`, không đọc `environment.ts` cho giá trị có thể đổi lúc runtime (Base URL, Feature Flag...).

`environment.ts` (build-time) chỉ chứa giá trị cố định tại thời điểm build (ví dụ `production: true/false`), không chứa giá trị cần đổi được sau khi build.

---

# Health Check

Container phải có Health Check.

Container lỗi phải dễ dàng restart.

## SSRF Host Allowlist (bắt buộc trước khi deploy domain thật)

Angular SSR chặn request có `Host` header không nằm trong `angular.json` → `architect.build.options.security.allowedHosts` (SSRF protection chính thức của Angular, so khớp chuỗi chính xác kể cả port). Baseline hiện tại cho phép `127.0.0.1`, `localhost`, `localhost:8080` (đủ để Health Check nội bộ và `docker-compose` local qua cổng Nginx 8080 hoạt động).

Ngoài ra, `docker/nginx.conf` forward `X-Forwarded-*`; `src/server.ts` đã bật `trustProxyHeaders: true` trên `AngularNodeAppEngine` (đây là API runtime, không phải cấu hình trong `angular.json`) vì Nginx là reverse proxy tin cậy duy nhất đứng trước Node.

Trước khi deploy lên domain thật, **bắt buộc** thêm domain đó vào `allowedHosts` (ví dụ `"allowedHosts": ["127.0.0.1", "localhost", "example.com", "*.example.com"]`) rồi build lại — đây là cấu hình build-time, không đổi được qua Runtime Config. Không dùng `allowedHosts: true` (tắt kiểm tra) trừ khi đã xác nhận lớp reverse proxy phía trước validate Host độc lập.

---

# Checklist

✓ Docker Build thành công

✓ Docker Run thành công

✓ Nginx hoạt động

✓ Static File Cache

✓ Compression bật

✓ SPA Routing đúng
