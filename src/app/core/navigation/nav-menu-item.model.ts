export interface NavMenuItem {
  readonly label: string;
  readonly route: string;
  readonly icon?: string;
  // Hiển thị nếu user có BẤT KỲ role nào trong danh sách (khớp claim "roles" JWT backend trả về
  // — xem AuthServiceImpl bên spring-base-api). Đây là cơ chế phân quyền THỰC TẾ dùng được ngay.
  readonly roles?: readonly string[];
  // Hiển thị nếu user có permission này. Backend hiện CHƯA trả permission (JWT chỉ có "roles"),
  // nên field này luôn bị lọc bỏ ở mọi user cho tới khi backend bổ sung — hạ tầng đã sẵn, chỉ cần
  // AuthService.toSession() map thêm permissions từ claim mới là hoạt động ngay không cần sửa gì
  // ở NavMenuService/route data.
  readonly permission?: string;
  // Cả roles và permission cùng khai báo -> phải thoả CẢ HAI (AND), không phải một trong hai.
  readonly children?: readonly NavMenuItem[];
}
