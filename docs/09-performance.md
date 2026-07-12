# Performance

## Purpose

Starter phải tối ưu hiệu năng ngay từ kiến trúc.

Không tối ưu quá sớm nhưng cũng không tạo rào cản cho việc tối ưu sau này.

---

# Component

Mặc định:

ChangeDetectionStrategy.OnPush

Component nhỏ.

Không tạo God Component.

---

# Signals

Ưu tiên Signals.

Không lạm dụng RxJS.

Computed Signal cho Derived State.

---

# Lazy Loading

Toàn bộ Feature phải Lazy Load.

Không import toàn bộ ứng dụng ngay khi khởi động.

---

# Deferrable Views

Ưu tiên sử dụng @defer cho:

Chart

Table lớn

Editor

Map

Heavy Component

Dialog ít dùng

---

# Bundle Size

Ưu tiên:

Tree Shaking

Dynamic Import

Code Splitting

Không import cả thư viện khi chỉ dùng một phần.

## Ghi chú Ng-Zorro CSS Budget

Starter import trọn bộ `ng-zorro-antd.variable.min.css` (bắt buộc để dùng CSS Variable Theming — xem `15-design-system.md`), khiến CSS ban đầu ~636kB raw / ~56kB sau gzip. Đây là chi phí cố định đã biết của việc dùng UI Library đầy đủ, không phải Regression.

## Ghi chú Icon Registration Budget

`provideNzIcons()` được đăng ký ở root (`app.config.ts`) để Layout (Public/Admin/Customer/Auth) và Shared Component hoạt động đúng ngay khi dùng, thay vì để icon lỗi hiển thị. `@ant-design/icons-angular/icons` không tree-shake tốt theo từng icon riêng lẻ (import 1 icon vẫn kéo theo phần lớn module), nên chi phí này gần như cố định bất kể đăng ký bao nhiêu icon. Đây là chi phí hạ tầng đã biết, không phải Regression.

Initial Bundle Budget trong `angular.json` được đặt ở 1.1MB (warning) / 1.4MB (error) để phản ánh cả hai baseline trên (CSS + Icon + Design Token layer). Không tăng thêm budget khi thêm Feature — nếu Feature làm vượt ngưỡng, phải Code Splitting/Lazy Load trước khi tăng budget.

---

# Template

Không:

Function phức tạp

Object mới

Array mới

Pipe nặng

trong Template.

---

# Images

Ưu tiên:

WebP

AVIF

Lazy Load

Responsive

---

# Table

Virtual Scroll khi cần.

Server Side Paging.

Server Side Filter.

Server Side Sorting.

---

# Review

Kiểm tra:

Bundle Size

Memory

FPS

Render Time

Network Request

Nếu có điểm chưa tối ưu:

↓

Refactor.
