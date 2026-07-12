export interface SelectOption {
  readonly label: string;
  readonly value: string;
}

export const CATEGORY_OPTIONS: readonly SelectOption[] = [
  { label: 'Phụ kiện', value: 'accessories' },
  { label: 'Màn hình', value: 'monitors' },
  { label: 'Laptop', value: 'laptops' },
  { label: 'Khác', value: 'other' },
];

export const TAG_OPTIONS: readonly SelectOption[] = [
  { label: 'Mới', value: 'new' },
  { label: 'Bán chạy', value: 'best-seller' },
  { label: 'Giảm giá', value: 'discount' },
];

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';
