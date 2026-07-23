# Dependency Management

## Purpose

Quản lý thư viện bên thứ ba có kiểm soát. Không thêm Package chỉ vì tiện — mọi Dependency đều làm tăng Bundle Size, Security Risk, Maintenance Cost.

## Principles

Ưu tiên theo thứ tự: Angular Official → Browser API → TypeScript → Third-party Library. Chỉ thêm thư viện khi thực sự cần.

## Evaluation Checklist

Trước khi thêm Package: ✓ Angular khuyến nghị? ✓ Đang được bảo trì? ✓ License phù hợp? ✓ Nhiều người dùng? ✓ Bundle Size bao nhiêu? ✓ Thay được bằng Angular không? ✓ Có Security Issue không?

## Duplicate Library

Không dùng nhiều thư viện cùng chức năng: Moment + DayJS → không; Lodash + Ramda → không; Chart.js + ECharts → không nếu không có lý do.

## Preferred Libraries

- Angular Official, Angular CDK, RxJS
- Ng-Zorro
- Tailwind CSS 4.x — styling utility-first mặc định (xem `04-ui-standard.md` § Styling); không thêm thư viện CSS utility / CSS-in-JS khác song song
- Day.js
- @ngrx/signals — Signal Store cho Feature phức tạp (xem `07-state-management.md`); không dùng NgRx Store/Effects truyền thống (RxJS-based) nếu Signal Store đã đáp ứng đủ
- Vitest — Unit Test runner chính thức của Angular CLI
- Playwright — E2E Test (thêm khi có Feature đầu tiên cần)
- Thư viện có cộng đồng lớn và được bảo trì tích cực

## Upgrade Strategy

Định kỳ nâng cấp: Angular, TypeScript, ESLint, Ng-Zorro, Docker Base Image. Không nâng cấp ngẫu nhiên — thử nghiệm trên nhánh riêng trước khi merge.

## Remove Dependency

Định kỳ kiểm tra và loại bỏ: Unused Package, Deprecated Package, High Vulnerability.

## Security

Định kỳ: npm audit, License Review, Dependency Scan. Không bỏ qua cảnh báo bảo mật nghiêm trọng.

## Bundle Size

Không thêm Package lớn chỉ để dùng một chức năng nhỏ. Ưu tiên: Tree Shaking, Dynamic Import, Lazy Load.

## Version Policy

Chỉ Stable Release. Không Alpha/Beta/RC trong Production (trừ khi có quyết định kiến trúc rõ ràng).

## Future Compatibility

Không khóa Starter vào một thư viện. Third-party có khả năng phải thay thế trong tương lai → bọc qua Adapter hoặc Service.

## Checklist

✓ Active Maintenance ✓ Stable ✓ Secure ✓ Small Bundle ✓ No Duplicate ✓ Easy Upgrade ✓ Easy Replacement
