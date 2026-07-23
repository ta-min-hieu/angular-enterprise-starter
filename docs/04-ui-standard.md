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

SCSS chỉ còn hợp lệ khi (whitelist):

- Override style nội bộ của Ng-Zorro component (selector sâu vào DOM do Ng-Zorro render).
- Keyframes / Animation phức tạp.
- Selector đặc thù Angular (`:host`, `:host-context`).
- Style tính từ giá trị runtime phức tạp mà utility class không biểu diễn được.

Khi buộc dùng SCSS: vẫn phải dùng Design Token (CSS Variables), file giữ tối thiểu, xoá file khi không còn nội dung.

## Trạng thái triển khai & Migration (cập nhật 2026-07-23)

- Tailwind CSS 4.x **chưa được cài đặt** vào project. Cần một Task setup riêng (cài package, cấu hình PostCSS, map Design Token hiện có ở `src/styles/tokens/` vào Tailwind `@theme`) trước khi áp dụng quy tắc trên cho code mới. Trước khi setup xong, code mới vẫn theo chuẩn SCSS + Design Token hiện hành.
- File SCSS hiện có: không migrate big-bang. Migrate dần sang Tailwind mỗi khi chỉnh sửa Component tương ứng; xoá file SCSS khi rỗng.
- Rủi ro đã biết: Tailwind Preflight (CSS reset) có thể xung đột base style của Ng-Zorro — khi setup phải kiểm soát thứ tự layer hoặc tắt Preflight. Nếu xung đột không xử lý được sạch sẽ → dừng lại hỏi trước khi đổi hướng.

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
