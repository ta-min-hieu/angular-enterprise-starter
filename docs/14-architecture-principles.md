# Architecture Principles

## Purpose

Định nghĩa các nguyên tắc kiến trúc của toàn bộ Starter.

Mọi quyết định thiết kế phải tuân theo tài liệu này.

---

# Design Principles

Ưu tiên:

SOLID

DRY

KISS

Separation of Concerns

Composition over Inheritance

High Cohesion

Low Coupling

---

# Layered Architecture

Presentation

↓

Application

↓

Infrastructure

Component không truy cập trực tiếp HttpClient.

Business Logic không phụ thuộc UI.

---

# Feature First

Mỗi nghiệp vụ là một Feature độc lập.

Không tạo Feature khổng lồ.

Feature không phụ thuộc trực tiếp Feature khác.

---

# Dependency Rule

Dependency chỉ đi từ ngoài vào trong.

UI

↓

Service

↓

API

Không đi ngược lại.

---

# State

Signals là lựa chọn mặc định.

RxJS cho luồng bất đồng bộ.

Không thêm State Library nếu chưa cần.

---

# Rendering

Kiến trúc phải tương thích:

CSR

SSR

SSG

Hybrid

Rendering không ảnh hưởng Business Layer.

---

# Extensibility

Mọi thành phần phải có khả năng mở rộng.

Không thiết kế cứng.

Không Hardcode.

Ưu tiên cấu hình.

---

# Refactoring

Cho phép Refactor.

Không làm thay đổi hành vi hệ thống.

Loại bỏ:

Duplicate Code

Dead Code

God Component

God Service

---

# Review

Sau mỗi Feature:

Review:

Architecture

Naming

Performance

Security

Maintainability

Nếu chưa đạt chuẩn:

↓

Refactor.