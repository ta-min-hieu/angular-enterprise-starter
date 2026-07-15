import { SelectOption } from '../../../shared/models/select-option.model';
import { MenuType } from './menu.model';
import { COMMON_STATUS_OPTIONS } from '../common-status.model';

export { COMMON_STATUS_OPTIONS as STATUS_OPTIONS };

// `label` chứa i18n key — nơi dùng phải qua `| transloco`.
export const MENU_TYPE_OPTIONS: readonly SelectOption<MenuType>[] = [
  { label: 'menus.types.directory', value: 'DIRECTORY' },
  { label: 'menus.types.menu', value: 'MENU' },
  { label: 'menus.types.button', value: 'BUTTON' },
];
