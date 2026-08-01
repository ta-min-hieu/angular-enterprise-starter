export interface OpenTab {
  readonly path: string;
  // Key i18n lấy từ route data.seo.title tại thời điểm tab được mở — KHÔNG lưu text đã dịch, để
  // TabBar tự dịch lại đúng ngôn ngữ đang active qua pipe transloco (giống SeoRouteData).
  readonly titleKey: string;
}
