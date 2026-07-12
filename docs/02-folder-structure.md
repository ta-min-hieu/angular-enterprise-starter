# Folder Structure

## Purpose

Thiết kế thư mục rõ ràng, dễ mở rộng và dễ bảo trì.

---

```
public/
src/
  app/
    core/
    shared/
    features/
    layouts/
    routes/
  styles/
```

`core/`, `shared/`, `features/`, `layouts/`, `routes/` nằm trong `src/app/`. `styles/` nằm trong `src/`.

`public/` nằm ở project root (không phải `src/assets/`) — đây là convention mặc định của Angular CLI 21 cho static asset (`angular.json` → `assets.input: "public"`). Không tự tạo thêm `src/assets/` song song để tránh 2 nguồn asset.

---

# Core

Core chỉ chứa Singleton.

Ví dụ:

Authentication

Configuration

Interceptor

Guard

Logger

Global Service

Environment

Core không chứa Business Logic của Feature.

---

# Shared

Shared chỉ chứa thành phần dùng chung.

Ví dụ:

Button

Dialog

Pipe

Directive

Validator

Utility

Shared Component

Không đưa Component chỉ dùng cho một Feature vào Shared.

---

# Features

Mỗi nghiệp vụ là một Feature độc lập.

Ví dụ:

products

customers

orders

dashboard

admin

blog

home

Mỗi Feature:

- Component
- Service
- Model
- Route
- State

Không phụ thuộc trực tiếp Feature khác.

---

# Layouts

Layout phải độc lập.

Ví dụ:

Public Layout

Admin Layout

Customer Layout

Auth Layout

---

# Routes

`routes/` chứa Route Table cấp Application — không chứa Route của riêng một Feature (Route của Feature nằm trong chính Feature đó, xem mục Features).

`routes/` chịu trách nhiệm:

- Khai báo root route table (`app.routes.ts`), map path → Layout → lazy-load Feature (`loadChildren`/`loadComponent`)
- Gắn Guard, Resolver, rendering mode (CSR/SSR/SSG) cho từng path ở cấp khai báo
- Redirect mặc định, wildcard route, 404 route

`routes/` không chứa Business Logic, không import trực tiếp Component/Service của Feature (chỉ lazy-load).

---

# Assets (`public/`)

Quản lý:

Image

Icon

Font

Translation

Không để file rải rác.

Thư viện/định dạng i18n cụ thể (ví dụ `@angular/localize` hay giải pháp runtime) chưa được chốt — đây là quyết định mở, sẽ chốt khi Feature đầu tiên thật sự cần đa ngôn ngữ. Không tự ý chọn khi chưa có nhu cầu cụ thể.

---

# Principles

Không tạo thư mục rỗng.

Không tạo cấu trúc quá phức tạp.

Không để Business Logic trong Layout.
