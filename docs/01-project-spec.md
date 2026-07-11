# Project Specification

## Purpose

Xây dựng Angular Enterprise Starter hiện đại có thể tái sử dụng cho nhiều dự án.

Đây là Frontend Only.

Không bao gồm Backend.

Backend sẽ được phát triển ở repository riêng.

---

# Supported Projects

Starter phải phù hợp để phát triển:

- CMS
- Dashboard
- ERP
- CRM
- Landing Page
- Corporate Website
- E-commerce
- Customer Portal
- Blog
- Internal Portal

---

# Technical Stack

- Angular 21 (LTS) — chốt version để khớp chính sách versioning "cùng major" của Ng-Zorro; xem `18-dependency-management.md`
- Node.js ≥ 22.22.0 hoặc ≥ 24.13.1 (yêu cầu bắt buộc của Angular 21)
- TypeScript Stable, Strict Mode
- Signals (mặc định) + NgRx Signals cho Signal Store của Feature phức tạp
- Zoneless Change Detection (mặc định của Angular từ v21)
- Reactive Forms
- RxJS (cho luồng bất đồng bộ)
- Ng-Zorro 21.x (Stable)
- SCSS (build-time) + CSS Custom Properties (runtime theme)
- Vitest (Unit Test), Playwright (E2E — thêm khi có Feature đầu tiên)
- ESLint
- Prettier
- Docker
- Nginx

---

# Rendering Strategy

Starter phải tương thích với Angular Hybrid Rendering.

Rendering là quyết định của từng Route.

Mỗi Route có thể sử dụng:

- CSR
- SSR
- SSG

Không được thiết kế khiến toàn bộ project bị phụ thuộc vào một cơ chế Rendering duy nhất.

---

# Architecture Goals

Đây là thứ tự ưu tiên chính thức của toàn bộ Starter (nguồn duy nhất — `CLAUDE.md` và các tài liệu khác chỉ tham chiếu, không liệt kê lại để tránh lệch nhau):

Correctness

↓

Maintainability

↓

Readability

↓

Scalability

↓

Performance

↓

Security

↓

Testability

↓

Developer Experience

---

# Project Goals

- Production Ready
- Enterprise Ready
- Docker Ready
- CI/CD Ready
- Responsive
- Accessibility
- Theme Support
- API Independent

---

# Non Goals

Starter không bao gồm:

Backend

Database

Authentication Server

Payment Gateway

Business Logic của từng dự án

Demo Feature không cần thiết

---

# Success Criteria

Project được xem là hoàn thành khi:

- Build thành công
- Docker chạy được
- Không lỗi ESLint
- Strict TypeScript
- Unit Test pass, đạt ngưỡng Coverage tối thiểu theo `10-testing.md`
- Kiến trúc dễ mở rộng
- Có thể dùng làm nền tảng cho dự án mới