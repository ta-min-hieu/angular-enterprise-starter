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