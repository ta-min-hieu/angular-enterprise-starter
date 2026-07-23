# Design System

## Purpose

Thiết lập Design System thống nhất cho toàn bộ Starter.

Mọi giao diện phải sử dụng cùng một hệ thống Design Token.

Không hardcode Style trong Component.

---

# Design Philosophy

Ưu tiên:

Consistency

↓

Reusability

↓

Accessibility

↓

Scalability

↓

Customization

---

# Design Tokens

Toàn bộ Design Token phải được định nghĩa tập trung.

Bao gồm:

Color

Typography

Spacing

Border Radius

Shadow

Transition

Elevation

Opacity

Breakpoint

Animation

Z-index

Không hardcode giá trị trong Component.

---

# CSS Custom Properties

Ưu tiên CSS Variables.

Ví dụ:

--color-primary

--color-success

--color-warning

--spacing-md

--border-radius-lg

--font-size-body

Không phụ thuộc hoàn toàn vào SCSS Variables.

SCSS chỉ dùng cho:

- Mixins
- Functions
- Build-time Utility

Runtime Theme phải sử dụng CSS Variables.

## Tailwind & Design Token

- Tailwind CSS 4.x là lớp tiêu thụ Design Token ở phía Component: Design Token được map vào Tailwind theme (`@theme` — Tailwind 4 sinh CSS Variables từ đây) tại `styles/`, để utility class (`p-4`, `text-primary`, `rounded-lg`...) luôn trỏ về cùng một nguồn token duy nhất.
- Tailwind **không được** định nghĩa giá trị mới ngoài hệ token; không dùng arbitrary value trong template (quy tắc đầy đủ: `04-ui-standard.md` § Styling).
- Theme Switching Runtime vẫn hoạt động qua CSS Variables — utility của Tailwind tham chiếu biến, không hardcode giá trị, nên đổi theme không cần rebuild.
- Component style bằng Tailwind utility trong template thay cho file SCSS riêng; SCSS chỉ còn theo whitelist ở `04-ui-standard.md` § Styling.

## Hòa giải với Ng-Zorro Theming

Ng-Zorro 21.x mặc định theme qua Less Variables (build-time) và có bản CSS Variable (`ng-zorro-antd.variable.min.css`, tính năng Experimental của Ng-Zorro) cho phép đổi theme tại runtime.

Nguyên tắc áp dụng trong Starter:

- Design Token của Starter (`--color-primary`, `--spacing-md`...) là nguồn duy nhất, định nghĩa tại một nơi trong `styles/`.
- Starter dùng bản CSS Variable của Ng-Zorro, không dùng Less variables override — để đảm bảo Theme Switching Runtime không cần rebuild (đúng yêu cầu doc 15 và doc 04).
- Ng-Zorro CSS Variables được map từ Design Token của Starter một lần tại lớp cấu hình theme (`styles/themes/`), không hardcode trùng giá trị ở hai nơi.
- Business Component không tự set biến CSS của Ng-Zorro; chỉ Design System Layer được phép.
- Rủi ro đã biết: CSS Variable theming của Ng-Zorro là tính năng Experimental — nếu phát sinh giới hạn trong quá trình triển khai, phải quay lại hỏi trước khi đổi hướng sang Less.

---

# Theme

Starter phải hỗ trợ:

Light Theme

Dark Theme

High Contrast Theme (có thể mở rộng)

Custom Theme

Theme Switching Runtime

Không yêu cầu build lại project khi đổi Theme.

---

# Component Library

Mọi Component phải sử dụng Design Token.

Không Hardcode:

Color

Margin

Padding

Shadow

Border

Font Size

---

# Responsive

Mobile First.

Breakpoint quản lý tập trung.

Không khai báo Media Query tùy ý trong từng Component.

---

# Typography

Định nghĩa:

Display

Heading

Title

Subtitle

Body

Caption

Label

Code

Sử dụng Typography Token.

---

# Colors

Định nghĩa Semantic Color.

Ví dụ:

Primary

Secondary

Success

Warning

Danger

Info

Surface

Background

Border

Text

Không sử dụng mã màu trực tiếp trong Component.

---

# Icons

Chỉ sử dụng một hệ thống Icon.

Không trộn nhiều bộ Icon.

Có thể thay đổi Icon Library mà không ảnh hưởng Business Component.

---

# Layout

Chuẩn bị sẵn:

Public Layout

Admin Layout

Customer Layout

Authentication Layout

Layout chỉ chịu trách nhiệm bố cục.

Không chứa Business Logic.

---

# Component Principles

Component phải:

- Reusable
- Configurable
- Theme-aware
- Responsive
- Accessible

Không tạo Component chỉ để dùng đúng một lần nếu không cần.

---

# Future Compatibility

Design System phải đủ linh hoạt để:

- đổi Theme
- đổi Brand
- White-label nhiều khách hàng
- thêm Dark Mode
- thêm High Contrast

mà không phải sửa Component.

---

# Checklist

✓ Design Token

✓ CSS Variables

✓ Runtime Theme

✓ Responsive

✓ Accessibility

✓ Reusable Components

✓ Không Hardcode Style
