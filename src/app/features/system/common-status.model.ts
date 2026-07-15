import { SelectOption } from '../../shared/models/select-option.model';

// Khớp enum CommonStatus phía backend (dùng chung cho Role/Permission/Menu trong module RBAC) —
// KHÔNG liên quan tới ProductStatus ('active'/'inactive'), vốn là domain khác với contract riêng.
export type CommonStatus = 'ACTIVE' | 'DISABLED';

// `label` chứa i18n key — nơi dùng phải qua `| transloco`.
export const COMMON_STATUS_OPTIONS: readonly SelectOption<CommonStatus>[] = [
  { label: 'system.common_status.active', value: 'ACTIVE' },
  { label: 'system.common_status.disabled', value: 'DISABLED' },
];
