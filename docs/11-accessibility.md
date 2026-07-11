# Accessibility

## Purpose

Starter phải đáp ứng các tiêu chuẩn Accessibility hiện đại để ứng dụng có thể sử dụng bởi nhiều nhóm người dùng khác nhau.

Mục tiêu hướng tới:

- WCAG 2.2 AA
- Keyboard Friendly
- Screen Reader Friendly
- Responsive
- Inclusive Design

Accessibility không phải là tính năng bổ sung mà là một phần của kiến trúc.

---

# Keyboard Navigation

Toàn bộ chức năng phải thao tác được bằng bàn phím.

Hỗ trợ:

Tab

Shift + Tab

Enter

Escape

Arrow Key

Space

Không được phụ thuộc hoàn toàn vào chuột.

---

# Focus Management

Focus luôn phải rõ ràng.

Dialog mở:

↓

Focus vào phần tử đầu tiên.

Dialog đóng:

↓

Trả Focus về vị trí trước đó.

Không để mất Focus.

---

# Forms

Mọi Input phải có:

Label

Validation Message

Required Indicator

Disabled State

Readonly State

Validation phải đọc được bằng Screen Reader.

---

# ARIA

Ưu tiên HTML Semantic.

Chỉ sử dụng:

aria-label

aria-labelledby

aria-describedby

role

khi thực sự cần.

Không lạm dụng ARIA.

---

# Color & Contrast

Không truyền tải thông tin chỉ bằng màu sắc.

Đảm bảo độ tương phản theo WCAG.

Dark Theme và Light Theme đều phải đảm bảo khả năng đọc.

---

# Images

Image nội dung:

↓

phải có alt.

Image trang trí:

↓

alt=""

---

# Tables

Table phải có:

Header

Caption khi cần

Keyboard Navigation

Responsive

Virtual Scroll nếu dữ liệu lớn.

---

# Checklist

✓ Keyboard hoạt động

✓ Focus rõ ràng

✓ Screen Reader đọc được

✓ Contrast đạt chuẩn

✓ Responsive

✓ Không phụ thuộc màu sắc