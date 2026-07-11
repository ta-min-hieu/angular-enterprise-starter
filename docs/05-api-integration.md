# API Integration

## Purpose

Starter là Frontend Only.

Không phụ thuộc Backend Framework.

Có thể tích hợp:

Spring Boot

ASP.NET

NodeJS

NestJS

Go

Laravel

hoặc bất kỳ Backend RESTful nào.

---

# API Layer

Mọi HTTP Request phải đi qua API Layer.

Không gọi HttpClient trực tiếp trong Component.

Luồng:

Component

↓

Facade (nếu có)

↓

Service

↓

Api Service

↓

HttpClient

## Khi nào cần Facade

Facade là lớp tùy chọn, chỉ thêm khi Component cần phối hợp (orchestrate) nhiều Service/State cùng lúc cho một màn hình phức tạp (ví dụ Dashboard tổng hợp nhiều nguồn dữ liệu, Wizard nhiều bước phối hợp nhiều Feature State).

Không thêm Facade nếu Component chỉ cần gọi một Service duy nhất — trường hợp này Component gọi thẳng Service.

---

# Authentication

Starter chỉ chuẩn bị hạ tầng.

Không cài đặt Authentication Server.

Hỗ trợ:

JWT

Bearer Token

Refresh Token

Anonymous Route

Protected Route

---

# Response

Chuẩn hóa:

Success Response

Error Response

Pagination

Validation Error

Không phụ thuộc cấu trúc riêng của Backend.

Thiết kế Adapter nếu Backend có định dạng khác.

## Response Envelope chuẩn của Starter

Đây là hình dạng (shape) mà Business Layer luôn nhận được, bất kể Backend trả về định dạng gì (nếu Backend khác, viết Adapter để convert về đúng shape này, không sửa Business Layer):

```ts
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
  };
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiValidationErrorDetail[];
  };
}

interface ApiValidationErrorDetail {
  field: string;
  message: string;
}
```

`code` là mã lỗi nghiệp vụ do Backend định nghĩa (không phải HTTP status), dùng để Business Layer xử lý theo từng trường hợp cụ thể mà không cần parse `message`.

---

# Upload / Download

Chuẩn bị sẵn:

Multipart Upload

Download File

Progress

Cancel Request

---

# Error Handling

Lỗi HTTP được xử lý tập trung.

Không xử lý lặp lại trong từng Component.

---

# Extensibility

API Layer phải đủ linh hoạt để:

- thay đổi Base URL
- thêm Header
- thêm Retry
- thêm Timeout
- thêm Cache
- thêm Logging

mà không ảnh hưởng tới Business Layer.