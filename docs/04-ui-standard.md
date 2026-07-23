# UI Standard

## Goal

Xây dựng giao diện hiện đại, thống nhất và có khả năng tái sử dụng cao.

Sử dụng:

Ng-Zorro

Tailwind CSS (styling mặc định)

Responsive Design

---

# Styling (Tailwind-first)

Thứ tự ưu tiên khi style một Component:

1. Ng-Zorro Component API (`nzType`, `nzSize`, `nzDanger`...) — không style lại thứ Ng-Zorro đã cung cấp.
2. Tailwind utility class trực tiếp trong template.
3. SCSS — chỉ khi rơi vào whitelist bên dưới.

Quy tắc:

- Component mới **không tạo file SCSS riêng** nếu Tailwind utility đáp ứng đủ. Mục tiêu: template tự mô tả style, ít file hơn, ít context hơn.
- Chỉ dùng utility gắn với Design Token của Starter (spacing / color / radius / shadow... được map vào Tailwind theme — xem `15-design-system.md` § Tailwind & Design Token). **Không dùng arbitrary value** (`p-[13px]`, `text-[#ff0000]`, `w-[347px]`) — thiếu token thì bổ sung token trước rồi mới dùng.
- Không set cùng một thuộc tính CSS ở cả utility class lẫn SCSS cho cùng một element.
- Một cụm utility lặp lại nguyên vẹn ở nhiều Component → tách Reusable Component, không copy cụm class. Không lạm dụng `@apply` để tái tạo hệ "class ngữ nghĩa" song song.

**Cảnh báo `max-w-*`/`min-w-*`/`max-h-*`/`min-h-*`:** không dùng với hậu tố trùng tên Spacing Token (`xs`/`sm`/`md`/`lg`/`xl`) — các utility này thử resolve theo cả `--spacing-*` lẫn `--container-*`, và sẽ ưu tiên nhầm sang giá trị Spacing Token (16/24/32px) thay vì container scale (28/32/36rem) đúng nghĩa. Cần kích thước container không có token tương ứng → dùng scale số của Tailwind (vd `max-w-105` = 105×4px = 420px) hoặc key không trùng (`2xl`, `3xl`...). Chi tiết: xem comment trong `src/styles/tailwind.css`.

SCSS chỉ còn hợp lệ khi (whitelist):

- Override style nội bộ của Ng-Zorro component (selector sâu vào DOM do Ng-Zorro render, dùng `::ng-deep`).
- Keyframes / Animation phức tạp; hover/focus-within lộ phần tử con phức tạp hơn mức `group-hover:`/`group-focus-within:` xử lý được.
- Selector đặc thù Angular thật sự cần CSS (`:host-context`, `:host` có pseudo-class/media query). **Không dùng SCSS cho `:host { display: block }` tĩnh** — dùng `host: { class: 'block' }` trong `@Component` decorator, tương đương utility Tailwind mà không cần file.
- Giá trị không có utility tương đương và không phải Design Token tái sử dụng (`font: inherit`, `text-shadow`, màu hardcode ăn khớp một hằng số cụ thể ở component khác...).

Khi buộc dùng SCSS: vẫn phải dùng Design Token (CSS Variables), file giữ tối thiểu, xoá file khi không còn nội dung.

## Trạng thái triển khai & Migration (cập nhật 2026-07-23)

Tailwind CSS 4.x đã cài đặt và migrate xong toàn bộ Starter: `.postcssrc.json` (PostCSS plugin `@tailwindcss/postcss`), `src/styles/tailwind.css` (theme mapping, xem `15-design-system.md` § Tailwind & Design Token), Preflight tắt (giữ base style Ng-Zorro) nhưng khôi phục riêng `border-style: solid` (xem comment trong file — utility `border-*` cần dòng này để hiển thị, Preflight vốn tự set).

Từ 42 file SCSS Component chỉ còn 5, mỗi file đều rơi đúng whitelist trên:

- `file-upload-field.scss`, `language-switcher.scss`, `admin-layout.scss` (một phần) — giá trị không có utility tương đương.
- `admin-layout.scss` (một phần), `menus-page.scss` — override sâu Ng-Zorro (`::ng-deep`).
- `admin-layout.scss` (một phần) — resize handle: pseudo-element `::after` + hover/active runtime phức tạp.
- `auth-layout.scss` — màu nền hero khớp hằng số ở `network-background.config.ts`, không phải Design Token tái sử dụng.

Component mới không còn lý do dùng SCSS ngoài whitelist — áp dụng nghiêm quy tắc Styling ở trên.

---

# Layout

Starter phải hỗ trợ:

Public Layout

Admin Layout

Customer Layout

Authentication Layout

Mỗi Layout độc lập.

---

# Theme

Hỗ trợ:

Light Theme

Dark Theme

Theme Switching

Không Hardcode màu sắc.

---

# Responsive

Desktop

Laptop

Tablet

Mobile

Không được mất chức năng khi Responsive.

---

# Common Components

Chuẩn bị sẵn:

Button

Table Wrapper

Search Form

Loading

Empty State

Error State

Dialog

Notification

Toast

Pagination

Breadcrumb

Card

Statistic

Avatar

Upload

## Triển khai (đã chốt)

Button, Table, Search Form (Reactive Forms), Dialog, Notification, Toast, Pagination, Breadcrumb, Card, Statistic, Avatar, Upload: dùng thẳng Component tương ứng của Ng-Zorro, không viết wrapper riêng nếu Ng-Zorro chưa cho thấy nhu cầu thực tế phải bọc thêm (tránh Duplicate/Component thừa — xem `14-architecture-principles.md`).

Loading, Empty State, Error State: Starter có wrapper riêng tại `shared/components/` (`loading-indicator`, `empty-state`, `error-state`) vì cần thống nhất hành vi với `16-error-handling.md` (phân loại lỗi, Retry) mà Ng-Zorro không có sẵn.

Danh sách selector/API của toàn bộ Shared Component: `23-shared-components.md` — tra cứu ở đó thay vì mở source từng Component.

---

# UX

Loading phải thống nhất.

Error phải thân thiện.

Form phải rõ ràng.

Animation nhẹ.

Không gây khó chịu.

---

# Accessibility

Keyboard Navigation.

Focus rõ ràng.

Contrast phù hợp.

ARIA khi cần.

---

# Icons

Sử dụng thống nhất.

Không trộn nhiều bộ Icon.

---

# UI Principles

Đơn giản.

Nhất quán.

Dễ mở rộng.

Dễ bảo trì.

Không tạo Component chỉ để sử dụng một lần nếu không cần thiết.
