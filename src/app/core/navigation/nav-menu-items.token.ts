import { InjectionToken } from '@angular/core';
import { NavMenuItem } from './nav-menu-item.model';

/**
 * Mỗi Feature muốn xuất hiện trên menu điều hướng của Layout đăng ký một mảng
 * NavMenuItem qua provider multi này (ví dụ trong route config của Feature),
 * thay vì Layout import trực tiếp Feature — giữ đúng Dependency Rule.
 */
export const NAV_MENU_ITEMS = new InjectionToken<readonly NavMenuItem[][]>('NAV_MENU_ITEMS');
