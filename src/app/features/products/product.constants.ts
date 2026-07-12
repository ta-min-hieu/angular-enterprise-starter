import { SelectOption } from '../../shared/models/select-option.model';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '../../shared/components/date-field/date-field';
import { ProductStatus } from './product.model';

export { DATE_FORMAT, DATE_TIME_FORMAT };

// `label` chứa i18n key (không phải text hiển thị trực tiếp) — nơi dùng phải qua `| transloco`.
export const CATEGORY_OPTIONS: readonly SelectOption[] = [
  { label: 'products.categories.accessories', value: 'accessories' },
  { label: 'products.categories.monitors', value: 'monitors' },
  { label: 'products.categories.laptops', value: 'laptops' },
  { label: 'products.categories.other', value: 'other' },
];

export const TAG_OPTIONS: readonly SelectOption[] = [
  { label: 'products.tags.new', value: 'new' },
  { label: 'products.tags.best_seller', value: 'best-seller' },
  { label: 'products.tags.discount', value: 'discount' },
];

export const STATUS_OPTIONS: readonly SelectOption<ProductStatus>[] = [
  { label: 'products.status.active', value: 'active' },
  { label: 'products.status.inactive', value: 'inactive' },
];
