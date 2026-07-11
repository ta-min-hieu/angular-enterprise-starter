# Review Checklist

## Purpose

Checklist cuối cùng trước khi hoàn thành bất kỳ Feature hoặc Pull Request nào.

Không được bỏ qua Checklist này.

---

# Architecture

□ Đúng Layer

□ Không phá kiến trúc

□ Không tạo Dependency ngược

□ Không Duplicate Logic

□ Feature độc lập

---

# Code Quality

□ Naming rõ ràng

□ Không any

□ Không Hardcode

□ Không Dead Code

□ Không Magic Number

□ Không Magic String

□ Không TODO

□ Không FIXME

□ Không Console.log Production

---

# Angular

□ Standalone Component

□ Signals ưu tiên

□ OnPush

□ Lazy Loading

□ Không Nested Subscribe

□ Không Memory Leak

---

# UI

□ Responsive

□ Theme Support

□ Accessibility

□ Design Token

□ Loading State

□ Error State

□ Empty State

---

# Performance

□ Bundle Size hợp lý

□ Không Render thừa

□ Không Function nặng trong Template

□ @defer nếu phù hợp

□ Lazy Component

□ Dynamic Import khi cần

---

# Security

□ Không Hardcode Secret

□ Token an toàn

□ Permission đúng

□ Validation đầy đủ

□ Không XSS

---

# API

□ Không gọi HttpClient trong Component

□ Error Handling

□ Retry hợp lý

□ Loading

□ Cancel Request nếu cần

---

# Testing

□ Unit Test

□ Build thành công

□ Lint thành công

□ Không Warning

---

# Docker

□ Docker Build thành công

□ Docker Run thành công

□ Nginx hoạt động

---

# Documentation

□ README cập nhật

□ Document cập nhật

□ API cập nhật nếu cần

---

# Final Review

Trước khi kết thúc Task, AI phải tự trả lời:

1. Có cách nào đơn giản hơn không?

2. Có Duplicate Code không?

3. Có Component nào quá lớn không?

4. Có Service nào quá lớn không?

5. Có thể tái sử dụng Component này không?

6. Có Hardcode không?

7. Có vi phạm tài liệu trong docs/ không?

8. Nếu đây là Production, mình có sẵn sàng merge không?

Nếu bất kỳ câu trả lời nào là "Không chắc":

↓

Tiếp tục Refactor trước khi hoàn thành.