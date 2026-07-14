# Rendering Strategy

## Purpose

Starter phải tương thích với Angular Hybrid Rendering.

Rendering là quyết định của từng Route, không phải của toàn bộ ứng dụng.

Kiến trúc phải cho phép lựa chọn:

- Client Side Rendering (CSR)
- Server Side Rendering (SSR)
- Static Site Generation (SSG)

mà không làm thay đổi Business Logic.

---

# Principles

Business Layer

↓

không biết đang chạy CSR hay SSR.

Service

↓

không biết Rendering Mode.

Rendering chỉ ảnh hưởng Presentation Layer.

---

# CSR

Ưu tiên sử dụng cho:

- Dashboard
- CMS
- ERP
- CRM
- Admin
- Customer Portal
- Profile
- Report
- Order
- Cart
- Checkout

Đặc điểm:

- yêu cầu đăng nhập
- dữ liệu thay đổi thường xuyên
- không cần SEO

---

# SSR

Ưu tiên sử dụng cho:

- Product Detail
- News Detail
- Search Result
- Dynamic Content
- SEO Page

Đặc điểm:

- cần SEO
- dữ liệu thay đổi liên tục

---

# SSG

Ưu tiên sử dụng cho:

- Home
- About
- Contact
- Pricing
- Policy
- Landing Page
- Documentation

Đặc điểm:

- nội dung ít thay đổi
- ưu tiên tốc độ
- SEO cao

---

# Browser APIs

Không sử dụng trực tiếp:

window

document

navigator

location

history

localStorage

sessionStorage

trong Business Layer.

Nếu cần sử dụng:

↓

tạo BrowserService hoặc abstraction.

---

# Future Compatibility

Starter phải dễ dàng chuyển đổi giữa:

CSR

SSR

SSG

Hybrid

mà không cần refactor Feature.

---

# Route hiện tại (routes/app.routes.server.ts)

- `/auth/login`: **SSG** (`RenderMode.Prerender`) — nội dung tĩnh, giống nhau cho mọi người dùng.
- Mọi route còn lại (`/products/**`, `/forbidden`, `/server-error`, `**`, kể cả `/` — redirect sang
  `/products`): **CSR** (`RenderMode.Client`) — Admin CRUD, yêu cầu đăng nhập, dữ liệu đổi liên tục,
  không cần SEO, đúng khuyến nghị ở mục CSR phía trên.
- Hiện chưa route nào dùng SSR (`RenderMode.Server`). Khi có Feature cần SEO/dynamic content (Product
  Detail public, News Detail...), thêm route đó vào `serverRoutes` với `RenderMode.Server`.
