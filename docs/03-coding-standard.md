# Coding Standard

## General

Áp dụng Angular Style Guide mới nhất.

Sử dụng:

Strict Mode

Standalone Component

inject()

Signals

Zoneless Change Detection

OnPush

---

# Forms

Sử dụng Reactive Forms cho mọi Form.

Lý do: mọi Form Component của Ng-Zorro đều hỗ trợ đầy đủ Reactive Forms qua ControlValueAccessor; đây là lựa chọn ổn định lâu dài cho Starter.

Không dùng Template-driven Forms.

---

# Naming

Sử dụng:

kebab-case

cho file.

PascalCase

cho Class.

camelCase

cho biến.

UPPER_SNAKE_CASE

cho Constant.

---

# TypeScript

Không sử dụng:

any

var

Function

Object

Ưu tiên:

interface

readonly

const

enum khi cần

Literal Type

---

# Component

Component chỉ:

Render UI

Handle Event

Gọi Service

Không xử lý Business Logic.

---

# Service

Service:

Business Logic

API

State

Không xử lý UI.

---

# Template

Không gọi Function nặng trong HTML.

Không tính toán trong Template.

Không tạo Object mới trong Template.

---

# Clean Code

Tên biến rõ nghĩa.

Method ngắn.

Component nhỏ.

Service nhỏ.

Ưu tiên readability hơn clever code.

---

# Forbidden

Không:

Duplicate Code

Magic Number

Magic String

Nested Subscribe

Hardcode

Console.log Production

Comment dư thừa