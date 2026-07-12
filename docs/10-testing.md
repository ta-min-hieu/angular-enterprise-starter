# Testing

## Purpose

Code phải được thiết kế để dễ kiểm thử.

Không viết code chỉ để chạy được.

---

# Testing Pyramid

Ưu tiên:

Unit Test

↓

Integration Test

↓

End-to-End Test

Không lạm dụng E2E.

---

# Tooling (đã chốt)

Unit Test / Component Test: **Vitest** (test runner mặc định chính thức của Angular CLI, chạy trong Node qua jsdom).

E2E Test: **Playwright** — chỉ thêm khi có Feature nghiệp vụ đầu tiên thực sự cần kiểm thử end-to-end. Không scaffold cấu hình E2E rỗng chỉ để có mặt (vi phạm nguyên tắc "Không tạo test chỉ để tăng Coverage").

---

# Unit Test

Kiểm tra:

Service

Pipe

Directive

Validator

Utility

Business Logic

Không cần test Getter/Setter đơn giản.

---

# Component Test

Kiểm tra:

Render

Input

Output

Event

Loading

Error

Empty State

Validation

---

# Mock

Mock:

API

Router

ActivatedRoute

Storage

Permission

Authentication

Không gọi Backend thật.

---

# Coverage

Mục tiêu:

Line >= 80%

Function >= 80%

Branch >= 70%

Critical Logic >= 95%

## Triển khai (đã chốt)

Ngưỡng Line/Function/Branch được enforce tự động qua `coverageThresholds` trong `angular.json` (`architect.test.options`), chạy bằng `npm run test:coverage`. CI Pipeline (`13-ci-cd.md`) chạy lệnh này ở bước Test — build dừng nếu không đạt.

"Critical Logic >= 95%" (ví dụ: mapping lỗi, luồng Auth) không có cơ chế đo tự động theo từng file; đây là tiêu chí Review thủ công khi merge PR liên quan, không phải một threshold trong config.

---

# Test Naming

Tên Test mô tả hành vi.

Ví dụ:

should display loading while requesting data

should redirect to login when token expired

should disable submit button when form invalid

---

# CI

Lint

↓

Unit Test

↓

Build

↓

Docker

Nếu bất kỳ bước nào thất bại:

↓

Pipeline dừng.

---

# Principles

Test Behavior.

Không test implementation.

Test phải dễ đọc.

Test phải dễ bảo trì.

Không tạo test chỉ để tăng Coverage.
