# State Management

## Purpose

Thiết kế State Management đơn giản, dễ hiểu, dễ kiểm thử và có khả năng mở rộng.

State là một phần của kiến trúc, không phải chỉ là kỹ thuật triển khai.

Không đưa State Library vào project nếu chưa có nhu cầu thực tế.

---

# Principles

Ưu tiên:

Local State

↓

Feature State

↓

Global State

Chỉ đưa dữ liệu lên Global khi thực sự cần chia sẻ.

---

# State Priority

Ưu tiên sử dụng theo thứ tự:

1. Signals
2. Computed Signals
3. Signal Store
4. RxJS
5. Global State Library (chỉ khi cần)

---

# Signals

Signals là lựa chọn mặc định.

Sử dụng cho:

- UI State
- Loading
- Dialog
- Selected Item
- Pagination
- Search Condition
- Local Form State
- Current Tab
- Current Step

Không sử dụng Observable chỉ để lưu State đơn giản.

---

# Computed Signals

Mọi Derived State nên sử dụng computed().

Không lưu dữ liệu có thể tính toán.

Ví dụ:

selectedProducts

↓

computed

totalPrice

↓

computed

isFormValid

↓

computed

---

# Signal Store

Signal Store trong Starter là **@ngrx/signals** (đã chốt — xem `18-dependency-management.md`). Không tự viết lại State Container nội bộ, không dùng NgRx Store/Effects truyền thống (RxJS-based).

Ưu tiên Signal Store cho:

- Feature lớn
- Dashboard
- Shopping Cart
- Customer Profile
- Wizard
- Multi-step Form

Signal Store là lựa chọn mặc định cho Feature State nếu logic bắt đầu phức tạp.

Không tạo Global Store ngay từ đầu.

---

# RxJS

RxJS dùng cho:

HTTP

WebSocket

Polling

Stream

Realtime

Debounce

Throttle

Retry

Timeout

Cancellation

Không sử dụng RxJS chỉ để lưu State.

Observable không thay thế Signals.

---

# Global State

Global State chỉ dành cho:

Authentication

Current User

Language

Theme

Permission

Application Configuration

Feature không được phụ thuộc trực tiếp Global State nếu không cần.

---

# Single Source of Truth

Một dữ liệu chỉ tồn tại một nơi.

Không duplicate State.

Không synchronize thủ công giữa nhiều State.

---

# Service

Service quản lý Business Logic.

Component chỉ hiển thị.

Không để Component tự xử lý toàn bộ State.

---

# State Lifetime

Ưu tiên:

Component State

↓

Feature State

↓

Application State

State nên có vòng đời ngắn nhất có thể.

---

# Anti-pattern

Không:

- Nested subscribe
- BehaviorSubject cho mọi dữ liệu
- Subject làm Event Bus
- Static Variable
- Singleton chứa toàn bộ State
- Global Store cho dữ liệu chỉ dùng trong một màn hình

---

# Future Compatibility

Starter phải dễ dàng chuyển sang các giải pháp State chính thức của Angular trong tương lai.

Không khóa kiến trúc vào một thư viện cụ thể.

State Layer phải có khả năng thay đổi mà không ảnh hưởng Business Logic.