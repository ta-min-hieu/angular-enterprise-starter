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