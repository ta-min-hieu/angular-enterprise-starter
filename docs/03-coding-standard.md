# Coding Standard

## General

Áp dụng Angular Style Guide mới nhất. Sử dụng: Strict Mode, Standalone Component, `inject()`, Signals, Zoneless Change Detection, OnPush.

## Forms

Mọi Form dùng Reactive Forms — mọi Form Component của Ng-Zorro hỗ trợ đầy đủ qua ControlValueAccessor; đây là lựa chọn ổn định lâu dài cho Starter. Không dùng Template-driven Forms.

## Naming

kebab-case cho file · PascalCase cho Class · camelCase cho biến · UPPER_SNAKE_CASE cho Constant.

## TypeScript

Không dùng: `any`, `var`, `Function`, `Object`. Ưu tiên: `interface`, `readonly`, `const`, `enum` khi cần, Literal Type.

## Component / Service

- Component chỉ: render UI, handle event, gọi Service — không xử lý Business Logic.
- Service: Business Logic, API, State — không xử lý UI.

## Template

Không gọi function nặng, không tính toán, không tạo object mới trong Template.

## Styling

Tailwind utility là mặc định; SCSS chỉ theo whitelist — xem `04-ui-standard.md` § Styling.

## Clean Code

Tên biến rõ nghĩa; method ngắn; Component/Service nhỏ; ưu tiên readability hơn clever code.

## Forbidden

Duplicate Code · Magic Number · Magic String · Nested Subscribe · Hardcode · console.log production · Comment dư thừa.
