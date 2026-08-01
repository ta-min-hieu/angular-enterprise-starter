// Đánh dấu ở route cha (xem routes/app.routes.ts nhánh 'products'/'reports'/'system') — chỉ những
// route thực sự nằm trong Admin Layout mới: (1) được TabsService mở thành tab, (2) được
// TabRouteReuseStrategy cache lại Component khi rời tab. Cả 2 nơi cùng đọc 1 hằng số duy nhất để
// không lệch key nếu sau này đổi tên.
export const TABS_ENABLED_DATA_KEY = 'tabsEnabled';
