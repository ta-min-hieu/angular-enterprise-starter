export type NotificationHistoryType = 'success' | 'error';

export interface NotificationHistoryItem {
  readonly id: string;
  readonly type: NotificationHistoryType;
  // Key i18n + entityKey (giống OpenTab.titleKey) — KHÔNG lưu text đã dịch, để chuông thông báo tự
  // dịch lại đúng ngôn ngữ đang active qua I18nService khi render (xem NotificationBell.resolveMessage).
  readonly messageKey: string;
  // Key i18n của tên đối tượng vừa thao tác (vd 'products.title') — nội suy vào messageKey qua
  // placeholder {{entity}} ("Lưu {{entity}} thành công"), để thông báo nói rõ chức năng nào vừa
  // thành công thay vì chỉ "Lưu thành công" chung chung. Không có (undefined) thì messageKey tự
  // đứng một mình, không interpolate gì thêm.
  readonly entityKey?: string;
  readonly createdAt: number;
  readonly read: boolean;
}
