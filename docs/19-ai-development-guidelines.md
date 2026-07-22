# AI Development Guidelines

## Purpose

Định nghĩa cách AI (Claude Code, ChatGPT Codex, Gemini CLI hoặc các AI Coding Assistant khác) phải làm việc trong repository này.

AI không chỉ sinh code.

AI phải đóng vai trò Senior Software Engineer và Software Architect.

---

# Primary Goal

Thứ tự ưu tiên: xem `01-project-spec.md` § Architecture Goals (nguồn duy nhất).

Không được tối ưu code theo hướng khó đọc.

---

# Before Writing Code

Luôn:

Đọc tài liệu liên quan đến loại thay đổi theo bảng mapping ở `22-ai-token-optimization.md` (không đọc toàn bộ docs/ mỗi lần).

Hiểu kiến trúc hiện tại.

Kiểm tra Feature liên quan.

Không tự suy diễn Requirement.

Nếu Requirement chưa rõ:

↓

Đặt câu hỏi.

Không tự quyết định.

---

# Architecture

Không được:

Phá vỡ Architecture.

Tạo Dependency ngược.

Duplicate Logic.

Bypass Layer.

Không thêm Shortcut.

Không thêm Temporary Code.

---

# Code Generation

Code sinh ra phải:

Production Ready.

Strict TypeScript.

Không any.

Không TODO.

Không FIXME.

Không Comment dư thừa.

Không Dead Code.

Không Duplicate Code.

---

# Component

Component chỉ:

Render UI.

Handle User Event.

Không chứa Business Logic phức tạp.

Nếu Component quá lớn:

↓

Refactor.

---

# Service

Service chịu trách nhiệm:

Business Logic.

State.

API.

Transformation.

Validation.

Không đưa Business Logic vào Component.

---

# State

Ưu tiên:

Signals

↓

Computed

↓

Signal Store

↓

RxJS

Không tạo Global State nếu Feature chưa cần.

---

# Dependency

Không tự ý thêm Package.

Trước khi thêm Dependency mới phải đánh giá:

Có Angular thay thế không?

Có CDK thay thế không?

Có Browser API thay thế không?

Bundle Size?

Maintenance?

Security?

Nếu chưa thật sự cần:

↓

Không thêm.

---

# UI

Ưu tiên:

Reusable Component.

Không copy UI.

Không Hardcode Style.

Không Hardcode Color.

Không Hardcode Margin.

Không Hardcode Padding.

---

# API

Không gọi HttpClient trực tiếp trong Component.

Không Hardcode URL.

Không Hardcode Header.

---

# Testing

Code mới phải:

Dễ test.

Không tạo code khó mock.

Không tạo static dependency.

---

# Refactoring

AI được phép Refactor nếu:

Không thay đổi hành vi hệ thống.

Làm code tốt hơn.

Giảm Duplicate.

Đơn giản hơn.

Nếu Refactor lớn:

↓

Thông báo trước.

---

# Self Review

Sau mỗi Task AI phải tự kiểm tra:

✓ Build

✓ TypeScript

✓ ESLint

✓ Architecture

✓ Performance

✓ Security

✓ Accessibility

✓ Responsive

✓ Design System

Nếu phát hiện vấn đề:

↓

Sửa trước khi kết thúc.

---

# Output Quality

Không ưu tiên sinh code nhanh.

Ưu tiên:

Code mà Senior Engineer có thể merge ngay sau khi review.
