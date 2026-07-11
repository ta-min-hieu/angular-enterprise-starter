# Security

## Purpose

Thiết kế Frontend an toàn theo OWASP và Angular Security Best Practices.

---

# Authentication

Starter chỉ chuẩn bị hạ tầng.

Không triển khai Authentication Server.

Hỗ trợ:

JWT

Bearer Token

Refresh Token

Token Expiration

Auto Logout

Protected Route

---

# Authorization

Chuẩn bị:

Role

Permission

Route Guard

Directive kiểm tra Permission

Không kiểm tra Permission trực tiếp trong Template bằng cách hardcode.

---

# XSS

Không sử dụng:

innerHTML

bypassSecurityTrustHtml / bypassSecurityTrustScript / bypassSecurityTrustStyle / bypassSecurityTrustUrl / bypassSecurityTrustResourceUrl

trừ khi có lý do rõ ràng và đã qua review.

`DomSanitizer.sanitize()` (không phải các hàm `bypassSecurityTrust*`) là cơ chế phòng thủ mặc định của Angular và được phép dùng bình thường khi thực sự cần render HTML động — không nằm trong danh sách cấm.

Ưu tiên dữ liệu dạng text (Angular tự động escape qua Interpolation/Property Binding).

---

# Sensitive Data

Không lưu:

Password

API Key

Secret

Private Key

Token nhạy cảm trong source code.

---

# Storage

Tách riêng Token Storage.

Có thể thay đổi implementation.

Không hardcode LocalStorage.

---

# HTTP

Toàn bộ Request đi qua Interceptor.

Interceptor chịu trách nhiệm:

Authorization

Refresh Token

Retry

Timeout

Logging

---

# Upload

Kiểm tra:

File Size

Extension

MIME Type

Không tin tưởng Client Validation.

---

# Logging

Production:

Không log:

Token

Password

Cookie

Authorization Header

Thông tin cá nhân nhạy cảm.

---

# Security Review

Sau mỗi Feature:

Review:

XSS

Token Leak

Hardcode

Unsafe API

Dependency Vulnerability