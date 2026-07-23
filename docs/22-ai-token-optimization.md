# AI Token & Context Optimization

## Purpose

Định nghĩa cách AI làm việc tiết kiệm token và thời gian phản hồi khi phát triển trong repository này.

Tài liệu này **bổ sung** cho `19-ai-development-guidelines.md`, không thay thế.

Tối ưu token không bao giờ được đánh đổi Primary Goal (`01-project-spec.md` § Architecture Goals).

---

# Nguyên tắc cốt lõi

Chỉ nạp Context thật sự cần cho Task hiện tại.

Không đọc để "biết cho chắc".

Ưu tiên Tool phạm vi hẹp (Grep/Glob/tìm theo symbol) trước Tool đọc toàn file.

---

# Đọc tài liệu theo Feature

Không đọc toàn bộ `docs/` cho mỗi Task.

Xác định loại thay đổi trước, chỉ đọc tài liệu tương ứng:

| Loại thay đổi                | Tài liệu cần đọc               |
| ---------------------------- | ------------------------------ |
| Feature mới / CRUD           | 01, 02, 03, 05, 07, 08, 14, 23 |
| Component / UI               | 03, 04, 11, 15, 23             |
| Style / Theme / Design Token | 04, 15                         |
| State / Signal Store         | 07, 14                         |
| API integration              | 05, 08, 16                     |
| Routing / Rendering Strategy | 06                             |
| Performance                  | 09                             |
| Testing                      | 10                             |
| Docker / CI-CD               | 12, 13                         |
| Logging / Observability      | 17                             |
| i18n                         | 21                             |
| Thêm/đổi Dependency          | 18                             |
| Bất kỳ Task nào              | CLAUDE.md (tự nạp)             |

Trước khi kết thúc Task (Self Review) → checklist đã đồng bộ vào `CLAUDE.md` § Self Review (tự nạp) — không cần đọc `20-review-checklist.md` mỗi Task; file 20 dành cho AI không tự nạp `CLAUDE.md`. Self Review vẫn bắt buộc — không được bỏ qua vì lý do tiết kiệm token.

**Feature mẫu (đọc thay cho khảo sát rộng):** Feature CRUD mới → bắt chước pattern từ `features/products/` (CRUD chuẩn + upload media) hoặc `features/system/users/` (màn quản trị + phân quyền). Đọc Feature mẫu tương ứng trước; không grep khảo sát tràn lan toàn repo để tìm pattern. Shared Component tra cứu qua `23-shared-components.md`, không mở source từng Component.

`CLAUDE.md` (tự nạp mỗi phiên với Claude Code) đã chứa toàn bộ quy tắc hành vi AI — không đọc lại `19-ai-development-guidelines.md` mỗi Task. Chỉ AI Assistant không tự nạp `CLAUDE.md` mới phải đọc 19 (một lần mỗi phiên).

Nếu không chắc Task thuộc loại nào:

↓

Đọc thêm `01-project-spec.md`.

↓

Vẫn chưa rõ → hỏi User. Không đọc tràn lan toàn bộ `docs/` để "cho chắc".

Nếu trong lúc code phát hiện cần một tài liệu khác chưa đọc → đọc bổ sung đúng phần liên quan, không dừng lại đọc lại từ đầu toàn bộ `docs/`.

Nếu tài liệu thiếu/mâu thuẫn với Code thực tế → vẫn áp dụng nguyên tắc ở `CLAUDE.md`: cập nhật tài liệu trước, rồi mới code.

---

# Đọc Code hiệu quả

Dùng Grep/Glob có target rõ ràng thay vì đọc toàn bộ file lớn để tìm một hàm/một biến.

Với file lớn, đọc theo offset/limit đúng vùng cần thay vì đọc toàn bộ nếu không cần.

Không đọc lại file đã đọc trong cùng phiên, trừ khi đã chỉnh sửa hoặc nghi ngờ đã thay đổi.

Với việc khảo sát rộng nhiều file/thư mục không rõ vị trí, dùng Agent tìm kiếm chuyên biệt thay vì tự đọc tuần tự nhiều file.

---

# Batch song song

Gộp các lệnh Tool độc lập (đọc nhiều file, search nhiều pattern, chạy nhiều lệnh không phụ thuộc nhau) vào cùng một lượt gọi.

Chỉ tuần tự khi bước sau phụ thuộc kết quả bước trước.

---

# Sửa Code tiết kiệm token

Dùng Edit (diff theo đoạn) thay vì Write lại toàn bộ file khi chỉ đổi một phần.

Chỉ dùng Write cho file mới hoàn toàn hoặc rewrite toàn bộ thật sự cần thiết.

Style: ưu tiên Tailwind utility ngay trong template — không tạo/đọc file SCSS riêng nếu chưa thuộc whitelist ở `04-ui-standard.md` § Styling (ít file hơn = ít token hơn).

Không in lại toàn bộ nội dung file trong câu trả lời nếu User không yêu cầu.

---

# Giảm vòng lặp Build / Lint / Fix

Đọc kỹ thông báo lỗi một lần, xác định root cause, sửa dứt điểm.

Không sửa-chạy-sửa-chạy nhiều vòng dựa trên đoán mò.

Nếu cùng một loại lỗi lặp lại ở nhiều nơi → sửa theo nguyên nhân gốc, không patch từng chỗ riêng lẻ.

---

# Self Review tiết kiệm token

Phạm vi Self Review áp dụng cho phần Code vừa thay đổi trong Task hiện tại, không quét lại toàn bộ project mỗi lần.

Checklist nằm ở `CLAUDE.md` § Self Review (đồng bộ 1-1 với `20-review-checklist.md`).

---

# Giao tiếp với User

Trả lời ngắn gọn, đúng trọng tâm câu hỏi.

Không lặp lại nội dung Task User đã biết.

Không tóm tắt dài dòng những gì vừa làm nếu không được yêu cầu.

---

# Không đánh đổi

Tối ưu token không được:

Bỏ qua Requirement chưa rõ — vẫn phải hỏi thay vì đoán.

Bỏ qua Self Review bắt buộc ở `19-ai-development-guidelines.md`.

Giảm chất lượng Code để tiết kiệm token.

Primary Goal luôn ưu tiên cao hơn Token Optimization.
