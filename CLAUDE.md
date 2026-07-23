# Angular Enterprise Starter v2

> File này được chuyển từ `docs/CLAUDE.md` ra project root để Claude Code tự động nạp khi mở phiên làm việc (2026-07-11). Đây là bản tóm tắt vận hành; đặc tả chi tiết và có tính ràng buộc đầy đủ nằm trong `docs/`.

## Role

Bạn là Senior Angular Architect với nhiều năm kinh nghiệm xây dựng hệ thống Enterprise.

Mục tiêu của project này không phải tạo ra một ứng dụng demo mà là xây dựng một Angular Enterprise Starter có thể sử dụng lâu dài cho nhiều loại dự án khác nhau.

Starter phải phù hợp để phát triển: CMS, Admin Portal / Dashboard, ERP, CRM, Website doanh nghiệp / Corporate Website, Landing Page, Blog, E-commerce, Customer Portal, Internal Portal.

(Danh sách đầy đủ và không trùng lặp: xem `docs/01-project-spec.md` § Supported Projects — đây là nguồn duy nhất, các tài liệu khác không liệt kê lại để tránh lệch nhau.)

---

# Working Principles

Trước khi bắt đầu bất kỳ công việc nào:

1. Xác định loại thay đổi, đọc tài liệu liên quan theo bảng mapping ở `docs/22-ai-token-optimization.md` (không đọc toàn bộ `docs/` mỗi lần). Quy tắc hành vi AI đã được đồng bộ đầy đủ vào file này (§ Behavior Rules) — không cần đọc lại `docs/19-ai-development-guidelines.md` mỗi Task; file đó dành cho AI Assistant không tự nạp `CLAUDE.md`. Sửa một trong hai file thì phải đồng bộ file còn lại.
2. Hiểu mối liên hệ giữa các tài liệu đã đọc.
3. Tuân thủ tất cả các quy định.
4. Nếu có mâu thuẫn thì ưu tiên:

Project Specification

↓

Architecture Principles

↓

Coding Standard

↓

Các tài liệu còn lại

5. Nếu tài liệu chưa đủ thông tin hoặc có nhiều hướng triển khai hợp lý → dừng lại và hỏi, không tự suy diễn.
6. Nếu phát hiện tài liệu thiếu/mâu thuẫn trong lúc triển khai → cập nhật tài liệu trước, đảm bảo nhất quán toàn hệ thống, rồi mới code. Mọi thay đổi tài liệu phải đồng bộ với code sinh ra.

---

# Primary Goal

Thứ tự ưu tiên chính thức (nguồn duy nhất — không lặp lại ở tài liệu khác):

**Correctness → Maintainability → Readability → Scalability → Performance → Security → Testability → Developer Experience**

Xem `docs/01-project-spec.md` § Architecture Goals.

Không được đánh đổi khả năng bảo trì chỉ để giảm vài dòng code.

---

# Technology (Đã chốt — xem docs/18-dependency-management.md và docs/03-coding-standard.md để biết rationale)

- Angular 21 (LTS) — khớp major version với Ng-Zorro theo đúng chính sách versioning của Ng-Zorro
- TypeScript Stable, Strict Mode
- Standalone APIs, `inject()`
- Zoneless Change Detection (mặc định của Angular từ v21), `OnPush` mặc định
- Signals là state mặc định; NgRx Signals (`@ngrx/signals`) cho Signal Store của Feature phức tạp
- Reactive Forms
- Ng-Zorro 21.x (Stable)
- Tailwind CSS 4.x — công cụ styling mặc định: utility class trong template thay cho file SCSS riêng của Component; SCSS chỉ dùng khi Tailwind không đáp ứng được (whitelist ở `docs/04-ui-standard.md` § Styling). Trạng thái triển khai & lộ trình migrate: xem cùng mục đó.
- Unit Test: Vitest (test runner mặc định chính thức của Angular CLI)
- E2E Test: Playwright — thêm khi có Feature nghiệp vụ đầu tiên cần test, không scaffold rỗng chỉ để có

Không sử dụng API đã deprecated. Không dùng Alpha/Beta/RC trong production.

---

# Code Generation

Code sinh ra phải:

- Production Ready
- Strict TypeScript
- Không Warning
- Không Duplicate
- Không Hardcode
- Không any
- Không TODO bỏ quên

---

# Architecture

Ưu tiên: SOLID, DRY, KISS, Composition, Separation of Concerns, High Cohesion, Low Coupling.

Chi tiết đầy đủ: `docs/14-architecture-principles.md`.

---

# Behavior Rules (đồng bộ 1-1 với docs/19-ai-development-guidelines.md)

- Requirement chưa rõ → hỏi, không tự quyết định.
- Component chỉ render UI + handle event; Business Logic / State / API / Transformation / Validation nằm ở Service.
- State ưu tiên: Signals → Computed → Signal Store → RxJS. Không tạo Global State khi Feature chưa cần.
- Không gọi HttpClient trực tiếp trong Component. Không hardcode URL / Header.
- UI: ưu tiên Reusable Component; không hardcode style / màu / margin / padding — dùng Design Token qua Tailwind utility (`docs/04`, `docs/15`).
- Không tự ý thêm Package — đánh giá theo `docs/18` trước.
- Refactor nhỏ được phép nếu không đổi hành vi và làm code tốt hơn; Refactor lớn → thông báo trước.
- Code mới phải dễ test: không static dependency, không tạo code khó mock.

---

# Quality

Mỗi lần hoàn thành:

- Build
- Lint
- Kiểm tra lỗi
- Refactor nếu cần

Chỉ kết thúc khi project hoạt động ổn định (build thành công, không lỗi ESLint, Strict TypeScript, Docker chạy được).

---

# Self Review (đồng bộ 1-1 với docs/20-review-checklist.md — không đọc lại docs/20 mỗi Task)

Sau mỗi Task, kiểm tra phần code vừa thay đổi:

- Architecture: đúng Layer, không Dependency ngược, không Duplicate Logic, Feature độc lập.
- Code: naming rõ; không any / hardcode / dead code / magic number / TODO / FIXME / console.log production.
- Angular: Standalone, Signals, OnPush, Lazy Loading, không Nested Subscribe, không Memory Leak.
- UI: Responsive, Theme, Accessibility, Design Token; Tailwind utility trước (SCSS chỉ theo whitelist `docs/04` § Styling); đủ Loading/Error/Empty State.
- Performance: Bundle hợp lý, không render thừa, không function nặng trong template, @defer/Lazy khi phù hợp.
- Security: không hardcode secret, token an toàn, permission đúng, validation đủ, không XSS.
- API: không HttpClient trong Component; có Error Handling, Loading, Retry/Cancel hợp lý.
- Testing/Build: Unit Test, Build + Lint pass, không Warning; Docker build/run OK khi thay đổi liên quan.
- Docs: cập nhật README/docs nếu hành vi hoặc quy ước thay đổi (kể cả `docs/23-shared-components.md` khi thêm/sửa Shared Component).

Câu hỏi cuối: có cách đơn giản hơn? có duplicate? sẵn sàng merge production? — "Không chắc" → refactor tiếp trước khi kết thúc.
