# Shared Components Inventory

## Purpose

Bảng tra cứu nhanh Component dùng chung — đọc file này thay vì mở source từng Component trong `shared/components/`.

Thêm/sửa Component dùng chung thì **phải cập nhật bảng này** (checklist Documentation ở `20-review-checklist.md`).

---

## Form Fields (`shared/components/*-field`)

Pattern chung: bọc Ng-Zorro + Reactive Forms. Input chung cho mọi field: `name` (req), `label` (req), `control: FormControl<T>` (req), `id`, `errorMessage`, `required` (mặc định `true` trừ ghi chú). Placeholder/error message tự sinh qua i18n nếu không truyền.

| Component        | Selector                 | Input/Output riêng                                                                                                                                    |
| ---------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| TextField        | `app-text-field`         | `type: 'text'\|'password'\|'email'` ('text'), `placeholder`                                                                                           |
| NumberField      | `app-number-field`       | `min` (0), `max` (MAX_SAFE_INTEGER), `step` (1)                                                                                                       |
| TextareaField    | `app-textarea-field`     | `rows` (3), `placeholder`                                                                                                                             |
| SelectField      | `app-select-field`       | `options: readonly SelectOption<T>[]` (req), `placeholder`                                                                                            |
| MultiSelectField | `app-multi-select-field` | `options` (req), `translateLabels` (true), `placeholder`                                                                                              |
| RadioGroupField  | `app-radio-group-field`  | `options` (req)                                                                                                                                       |
| CheckboxField    | `app-checkbox-field`     | — (không có `errorMessage`/`required`)                                                                                                                |
| DateField        | `app-date-field`         | `showTime` (false), `format`, `placeholder`                                                                                                           |
| FileUploadField  | `app-file-upload-field`  | `accept`, `multiple` (true), `maxCount` (10), `maxImageSizeMb` (10), `maxVideoSizeMb` (200), `chunkThresholdMb`; output `existingRemoved: MediaAsset` |
| IconPickerField  | `app-icon-picker-field`  | `placeholder`; `required` mặc định **false**                                                                                                          |

---

## Layout / Page

| Component  | Selector          | API chính                                                                                                                                           |
| ---------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| PageHeader | `app-page-header` | `breadcrumbItems: readonly PageBreadcrumbItem[]` (req), `title` (req), `subtitle`, `addLink`, `addLabel`                                            |
| FilterBar  | `app-filter-bar`  | `hasActiveFilters` (false); output `clear`; nội dung filter truyền qua ng-content                                                                   |
| Pagination | `app-pagination`  | `pageIndex` (req), `total` (req), `pageSize` (10), `showSizeChanger` (false), `showQuickJumper` (false); output `pageIndexChange`, `pageSizeChange` |

---

## State / Misc

| Component         | Selector                 | API chính                                                                    |
| ----------------- | ------------------------ | ---------------------------------------------------------------------------- |
| LoadingIndicator  | `app-loading-indicator`  | `size: 'small'\|'default'\|'large'` ('default'), `tip`, `fullscreen` (false) |
| EmptyState        | `app-empty-state`        | `message`                                                                    |
| ErrorState        | `app-error-state`        | `error: AppError` (req); output `retry`                                      |
| ThemeToggle       | `app-theme-toggle`       | không input                                                                  |
| LanguageSwitcher  | `app-language-switcher`  | không input                                                                  |
| NetworkBackground | `app-network-background` | hiệu ứng nền canvas (dùng ở Auth Layout)                                     |
