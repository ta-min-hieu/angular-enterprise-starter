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

---

# Environment

Không hardcode.

Có thể thay đổi bằng:

Docker Environment

Runtime Config

## Cơ chế Runtime Config (đã chốt)

Container khởi động (entrypoint script) đọc Environment Variable và ghi đè vào `assets/config.json` bằng `envsubst` trước khi Nginx start.

Angular đọc `assets/config.json` lúc bootstrap qua `provideAppInitializer` (Core Layer), lưu vào `AppConfigService` (Signal). Business Layer chỉ inject `AppConfigService`, không đọc `environment.ts` cho giá trị có thể đổi lúc runtime (Base URL, Feature Flag...).

`environment.ts` (build-time) chỉ chứa giá trị cố định tại thời điểm build (ví dụ `production: true/false`), không chứa giá trị cần đổi được sau khi build.

---

# Health Check

Container phải có Health Check.

Container lỗi phải dễ dàng restart.

---

# Checklist

✓ Docker Build thành công

✓ Docker Run thành công

✓ Nginx hoạt động

✓ Static File Cache

✓ Compression bật

✓ SPA Routing đúng