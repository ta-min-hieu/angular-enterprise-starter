// Khai báo qua route data: { seo: { title: 'xxx.title' } } — key i18n, KHÔNG phải text thô, để
// AppTitleStrategy dịch đúng theo ngôn ngữ đang active mỗi khi Router cập nhật title.
export interface SeoRouteData {
  readonly title: string;
  // Chỉ set cho trang thực sự public (vd /auth/login) — trang Admin sau đăng nhập không cần
  // meta description/OG (không ai index hay share link, xem docs/06-rendering-strategy.md § CSR).
  readonly description?: string;
}
