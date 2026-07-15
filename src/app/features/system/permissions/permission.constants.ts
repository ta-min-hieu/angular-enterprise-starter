import { SelectOption } from '../../../shared/models/select-option.model';
import { HttpMethod } from './permission.model';
import { COMMON_STATUS_OPTIONS } from '../common-status.model';

export { COMMON_STATUS_OPTIONS as STATUS_OPTIONS };

// `label` chứa i18n key — nơi dùng phải qua `| transloco`.
export const HTTP_METHOD_OPTIONS: readonly SelectOption<HttpMethod>[] = [
  { label: 'permissions.methods.get', value: 'GET' },
  { label: 'permissions.methods.post', value: 'POST' },
  { label: 'permissions.methods.put', value: 'PUT' },
  { label: 'permissions.methods.patch', value: 'PATCH' },
  { label: 'permissions.methods.delete', value: 'DELETE' },
  { label: 'permissions.methods.any', value: '*' },
];
