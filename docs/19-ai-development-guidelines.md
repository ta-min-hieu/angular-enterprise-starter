# AI Development Guidelines

## Purpose

Định nghĩa cách AI (Claude Code, ChatGPT Codex, Gemini CLI hoặc AI Coding Assistant khác) phải làm việc trong repository này. AI không chỉ sinh code — AI đóng vai trò Senior Software Engineer và Software Architect.

> **Claude Code**: toàn bộ quy tắc trong file này đã được đồng bộ vào `CLAUDE.md` (project root, tự nạp mỗi phiên) — không cần đọc lại file này mỗi Task. File này là nguồn cho AI Assistant không tự nạp `CLAUDE.md`. Sửa file này thì phải cập nhật `CLAUDE.md` và ngược lại.

## Primary Goal

Thứ tự ưu tiên: xem `01-project-spec.md` § Architecture Goals (nguồn duy nhất). Không tối ưu code theo hướng khó đọc.

## Before Writing Code

Đọc tài liệu liên quan theo bảng mapping ở `22-ai-token-optimization.md` (không đọc toàn bộ docs/ mỗi lần). Hiểu kiến trúc hiện tại, kiểm tra Feature liên quan. Không tự suy diễn Requirement — chưa rõ thì đặt câu hỏi, không tự quyết định.

## Architecture

Không: phá vỡ Architecture, tạo Dependency ngược, Duplicate Logic, bypass Layer, thêm Shortcut, thêm Temporary Code.

## Code Generation

Code sinh ra phải Production Ready, Strict TypeScript. Không: any, TODO, FIXME, Comment dư thừa, Dead Code, Duplicate Code.

## Component / Service

- Component chỉ render UI + handle User Event — không chứa Business Logic phức tạp; Component quá lớn → refactor.
- Service chịu trách nhiệm: Business Logic, State, API, Transformation, Validation. Không đưa Business Logic vào Component.

## State

Ưu tiên: Signals → Computed → Signal Store → RxJS. Không tạo Global State nếu Feature chưa cần.

## Dependency

Không tự ý thêm Package. Trước khi thêm phải đánh giá: Angular/CDK/Browser API thay thế được không? Bundle Size? Maintenance? Security? Chưa thật sự cần → không thêm.

## UI

Ưu tiên Reusable Component, không copy UI. Không hardcode Style/Color/Margin/Padding. Styling: Tailwind utility class là mặc định — không tạo file SCSS riêng cho Component nếu Tailwind đáp ứng đủ; SCSS chỉ dùng theo whitelist ở `04-ui-standard.md` § Styling.

## API

Không gọi HttpClient trực tiếp trong Component. Không hardcode URL/Header.

## Testing

Code mới phải dễ test: không tạo code khó mock, không static dependency.

## Refactoring

Được phép refactor nếu: không thay đổi hành vi hệ thống, làm code tốt hơn, giảm duplicate, đơn giản hơn. Refactor lớn → thông báo trước.

## Self Review

Sau mỗi Task tự kiểm tra: Build, TypeScript, ESLint, Architecture, Performance, Security, Accessibility, Responsive, Design System. Phát hiện vấn đề → sửa trước khi kết thúc.

## Output Quality

Không ưu tiên sinh code nhanh — ưu tiên code mà Senior Engineer có thể merge ngay sau khi review.
