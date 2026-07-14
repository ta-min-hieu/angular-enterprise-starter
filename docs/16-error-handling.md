# Error Handling Strategy

## Purpose

Thiết kế cơ chế xử lý lỗi thống nhất trên toàn bộ ứng dụng.

Mọi lỗi phải được xử lý theo cùng một quy tắc.

Không xử lý lỗi tùy tiện trong từng Component.

---

# Principles

Error phải được phân loại.

Không phải mọi Error đều giống nhau.

Error Layer:

Infrastructure Error

↓

Application Error

↓

Business Error

↓

Validation Error

↓

UI Error

---

# Error Categories

## Network Error

Ví dụ:

- Timeout
- Connection Lost
- DNS
- Offline

Hiển thị:

Retry

Reload

Offline Message

---

## Authentication Error

Ví dụ:

401

↓

Refresh Token

↓

Nếu thất bại

↓

Logout

↓

Redirect Login

---

## Authorization Error

Ví dụ:

403

↓

Hiển thị Access Denied

↓

Không Retry

---

## Business Error

Ví dụ:

Không đủ số dư

Đơn hàng đã đóng

Voucher hết hạn

Không phải Exception.

Hiển thị Message thân thiện.

---

## Validation Error

Hiển thị ngay tại Field.

Không dùng Toast.

Không dùng Dialog.

---

## Unexpected Error

Ví dụ:

Null

Undefined

Runtime Error

↓

Fallback UI

↓

Log

↓

Thông báo người dùng

---

# HTTP Error Mapping

Chuẩn hóa:

400

↓

Validation

401

↓

Authentication

403

↓

Permission

404

↓

Not Found

409

↓

Business Conflict

422

↓

Business Validation

429

↓

Too Many Requests

500

↓

Server Error

503

↓

Service Unavailable

---

# Retry Strategy

Retry chỉ áp dụng cho:

Network Error

Timeout

503

429 — Retry có Backoff, dùng header `Retry-After` nếu Backend trả về; nếu không có header thì dùng Exponential Backoff mặc định.

Không Retry:

400

401

403

404

422

---

# Error UI

Chuẩn bị sẵn:

Empty State

Loading Error

Retry Button

404 Page

403 Page

500 Page

Maintenance Page

## Ghi chú route `/` (đã cập nhật — không còn 404)

Từ khi Feature `products` có mặt, `routes/app.routes.ts` đã đăng ký `{ path: '', pathMatch: 'full', redirectTo: 'products' }` — `/` giờ redirect (302) sang `/products` thay vì rơi vào wildcard `**`/404 như mô tả trước đây. `authGuard` tự đưa người dùng chưa đăng nhập sang `/auth/login`.

Offline Page

---

# User Message

Không hiển thị:

Stack Trace

Java Exception

SQL

Internal Error

Message phải dễ hiểu.

---

# Logging

Mọi Unexpected Error:

↓

Logger

↓

Monitoring

↓

Correlation ID

Không log dữ liệu nhạy cảm.

---

# Checklist

✓ Error Mapping

✓ Retry

✓ Error Page

✓ Validation

✓ Logging

✓ User Friendly
