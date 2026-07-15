import { SelectOption } from '../../../shared/models/select-option.model';
import { DataScope } from './role.model';
import { COMMON_STATUS_OPTIONS } from '../common-status.model';

export { COMMON_STATUS_OPTIONS as STATUS_OPTIONS };

// `label` chứa i18n key — nơi dùng phải qua `| transloco`.
export const DATA_SCOPE_OPTIONS: readonly SelectOption<DataScope>[] = [
  { label: 'roles.data_scope.all', value: 'ALL' },
  { label: 'roles.data_scope.self', value: 'SELF' },
  { label: 'roles.data_scope.dept', value: 'DEPT' },
  { label: 'roles.data_scope.custom', value: 'CUSTOM' },
];
