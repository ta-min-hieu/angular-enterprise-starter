# Review Checklist

## Purpose

Checklist cuối cùng trước khi hoàn thành bất kỳ Feature hoặc Pull Request nào. Không được bỏ qua.

> **Claude Code**: checklist này đã được đồng bộ vào `CLAUDE.md` § Self Review (tự nạp mỗi phiên) — không cần đọc lại file này mỗi Task. File này là nguồn cho AI Assistant không tự nạp `CLAUDE.md`. Sửa file này thì phải cập nhật `CLAUDE.md` và ngược lại.

## Architecture

□ Đúng Layer □ Không phá kiến trúc □ Không Dependency ngược □ Không Duplicate Logic □ Feature độc lập

## Code Quality

□ Naming rõ ràng □ Không any □ Không Hardcode □ Không Dead Code □ Không Magic Number/String □ Không TODO/FIXME □ Không console.log Production

## Angular

□ Standalone Component □ Signals ưu tiên □ OnPush □ Lazy Loading □ Không Nested Subscribe □ Không Memory Leak

## UI

□ Responsive □ Theme Support □ Accessibility □ Design Token □ Tailwind utility trước — file SCSS mới chỉ khi thuộc whitelist `04-ui-standard.md` § Styling, không arbitrary value □ Loading/Error/Empty State

## Performance

□ Bundle Size hợp lý □ Không render thừa □ Không function nặng trong Template □ @defer nếu phù hợp □ Lazy Component □ Dynamic Import khi cần

## Security

□ Không Hardcode Secret □ Token an toàn □ Permission đúng □ Validation đầy đủ □ Không XSS

## API

□ Không gọi HttpClient trong Component □ Error Handling □ Retry hợp lý □ Loading □ Cancel Request nếu cần

## Testing

□ Unit Test □ Build thành công □ Lint thành công □ Không Warning

## Docker

□ Docker Build thành công □ Docker Run thành công □ Nginx hoạt động

## Documentation

□ README cập nhật □ Document cập nhật (kể cả `23-shared-components.md` khi thêm/sửa Shared Component) □ API cập nhật nếu cần

## Final Review

Trước khi kết thúc Task, AI tự trả lời:

1. Có cách nào đơn giản hơn không?
2. Có Duplicate Code không?
3. Có Component/Service nào quá lớn không?
4. Có thể tái sử dụng Component này không?
5. Có Hardcode không?
6. Có vi phạm tài liệu trong docs/ không?
7. Nếu đây là Production, mình có sẵn sàng merge không?

Bất kỳ câu trả lời nào là "Không chắc" → tiếp tục refactor trước khi hoàn thành.
