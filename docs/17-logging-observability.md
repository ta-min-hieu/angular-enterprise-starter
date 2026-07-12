# Logging & Observability

## Purpose

Cho phép theo dõi toàn bộ hoạt động của Frontend.

Logging phục vụ:

Debug

Monitoring

Audit

Performance

Analytics

---

# Logging Levels

DEBUG

INFO

WARN

ERROR

FATAL

Production:

Không bật DEBUG.

---

# Logger

Không sử dụng:

console.log()

console.error()

console.warn()

trực tiếp.

Toàn bộ Logging phải thông qua Logger Service.

---

# What To Log

Application Start

Login

Logout

Navigation

API Error

Unexpected Error

Performance

Feature Usage

---

# What NOT To Log

Password

Token

Cookie

Authorization Header

Credit Card

Personal Information

Secret

---

# Correlation ID

Nếu Backend hỗ trợ:

Frontend phải gửi Correlation ID.

Mọi Request nên có Trace ID.

## Triển khai (đã chốt)

`core/http/correlation-id.interceptor.ts` tự sinh `crypto.randomUUID()` và gắn header `X-Correlation-Id` cho mọi Request (trừ khi Request đã tự set header này). `error.interceptor.ts` đọc lại header này để đính kèm vào Log khi request lỗi, giúp tra vết một request qua cả Frontend Log lẫn Backend Log (nếu Backend echo lại đúng giá trị).

---

# Performance Metrics

Theo dõi:

Page Load

API Time

Component Render Time

Bundle Size

Memory

FPS (nếu cần)

---

# Monitoring

Thiết kế sẵn khả năng tích hợp:

Sentry

OpenTelemetry

Azure Monitor

Google Analytics

Elastic

Datadog

Không phụ thuộc một nhà cung cấp.

---

# Audit

Có khả năng ghi nhận:

User

Time

Feature

Action

Result

Không ghi dữ liệu nhạy cảm.

---

# Error Tracking

Unexpected Error

↓

Logger

↓

Monitoring

↓

Notification

↓

Dashboard

---

# Checklist

✓ Logger Service

✓ Monitoring Ready

✓ Correlation ID

✓ Audit Ready

✓ Không log Secret
