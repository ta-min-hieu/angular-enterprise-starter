# Dependency Management

## Purpose

Quản lý thư viện bên thứ ba một cách có kiểm soát.

Không thêm Package chỉ vì tiện.

Mọi Dependency đều làm tăng:

- Bundle Size
- Security Risk
- Maintenance Cost

---

# Principles

Ưu tiên:

Angular Official

↓

Browser API

↓

TypeScript

↓

Third-party Library

Chỉ thêm thư viện khi thực sự cần.

---

# Evaluation Checklist

Trước khi thêm Package:

✓ Có được Angular khuyến nghị?

✓ Có đang được bảo trì?

✓ License phù hợp?

✓ Có nhiều người sử dụng?

✓ Bundle Size bao nhiêu?

✓ Có thay thế được bằng Angular không?

✓ Có Security Issue không?

---

# Duplicate Library

Không sử dụng nhiều thư viện cùng chức năng.

Ví dụ:

Moment

-

DayJS

↓

Không.

Lodash

-

Ramda

↓

Không.

Chart.js

-

ECharts

↓

Không nếu không có lý do.

---

# Preferred Libraries

Ưu tiên:

Angular Official

Ng-Zorro

Tailwind CSS 4.x — styling utility-first mặc định (xem `04-ui-standard.md` § Styling); không thêm thư viện CSS utility / CSS-in-JS nào khác song song.

RxJS

Day.js

Angular CDK

@ngrx/signals — cho Signal Store của Feature phức tạp (xem `07-state-management.md`); không dùng NgRx Store/Effects truyền thống (RxJS-based) nếu Signal Store đã đáp ứng đủ.

Vitest — Unit Test runner chính thức của Angular CLI.

Playwright — E2E Test (thêm khi có Feature đầu tiên cần).

Các thư viện có cộng đồng lớn và được bảo trì tích cực.

---

# Upgrade Strategy

Định kỳ:

Angular

TypeScript

ESLint

Ng-Zorro

Docker Base Image

Không nâng cấp ngẫu nhiên.

Thử nghiệm trên nhánh riêng trước khi merge.

---

# Remove Dependency

Định kỳ kiểm tra:

Unused Package

Deprecated Package

High Vulnerability

Package không còn sử dụng

↓

Loại bỏ.

---

# Security

Định kỳ:

npm audit

License Review

Dependency Scan

Không bỏ qua cảnh báo bảo mật nghiêm trọng.

---

# Bundle Size

Không thêm Package lớn chỉ để dùng một chức năng nhỏ.

Ưu tiên:

Tree Shaking

Dynamic Import

Lazy Load

---

# Version Policy

Ưu tiên:

Stable Release

Không sử dụng:

Alpha

Beta

RC

trong Production (trừ khi có quyết định kiến trúc rõ ràng).

---

# Future Compatibility

Không khóa Starter vào một thư viện.

Mọi Third-party Library nên được bọc qua Adapter hoặc Service nếu có khả năng phải thay thế trong tương lai.

---

# Checklist

✓ Active Maintenance

✓ Stable

✓ Secure

✓ Small Bundle

✓ No Duplicate

✓ Easy Upgrade

✓ Easy Replacement
