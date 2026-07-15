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

Đây là hình dạng (shape) mà Business Layer luôn nhận được, bất kể Backend trả về định dạng gì (nếu Backend khác, viết Adapter để convert về đúng shape này, không sửa Business Layer). Đây là contract thực tế đang được implement (`core/http/api-response.model.ts`, `core/http/api.service.ts`):

```ts
interface ApiResponse<T> {
  code: string; // '200' = thành công; khác '200' -> lỗi
  message: string;
  data: T;
  metadata?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
```

Không có field `success: boolean` riêng — `code === '200'` là dấu hiệu thành công duy nhất. Khi `code !== '200'`, `data` mang payload lỗi (backend trả validate error dưới dạng `data: { [field]: string[] }`, được làm phẳng thành `ValidationErrorDetail[]` trong `core/error/http-error-mapper.ts`).

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
