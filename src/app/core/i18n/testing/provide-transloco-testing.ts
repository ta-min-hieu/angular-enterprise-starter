import { EnvironmentProviders, Provider, importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';

const TEST_TRANSLATIONS = {
  vi: {
    'common.placeholder.enter': 'Nhập {{field}}',
    'common.placeholder.select': 'Chọn {{field}}',
    'common.validation.required_field': 'Vui lòng nhập {{field}}',
    'common.validation.required_selection': 'Vui lòng chọn {{field}}',
    'common.empty_state.no_data': 'Không có dữ liệu',
    'common.error_state.retry': 'Thử lại',
    'products.categories.accessories': 'Phụ kiện',
    'products.tags.best_seller': 'Bán chạy',
    'products.status.active': 'Đang bán',
    'products.status.inactive': 'Ngừng bán',
    'products.detail.featured_yes': 'Có',
    'products.detail.featured_no': 'Không',
  },
  en: {
    'common.placeholder.enter': 'Enter {{field}}',
    'common.placeholder.select': 'Select {{field}}',
    'common.validation.required_field': 'Please enter {{field}}',
    'common.validation.required_selection': 'Please select {{field}}',
    'common.empty_state.no_data': 'No data',
    'common.error_state.retry': 'Retry',
    'products.categories.accessories': 'Accessories',
    'products.tags.best_seller': 'Best seller',
    'products.status.active': 'Active',
    'products.status.inactive': 'Inactive',
    'products.detail.featured_yes': 'Yes',
    'products.detail.featured_no': 'No',
  },
};

/**
 * Preloads a fixed, in-memory translation set (thay vì gọi HTTP loader thật)
 * để Component test không phải chờ async load translation.
 */
export function provideTranslocoTesting(): (Provider | EnvironmentProviders)[] {
  return [
    importProvidersFrom(
      TranslocoTestingModule.forRoot({
        langs: TEST_TRANSLATIONS,
        preloadLangs: true,
        translocoConfig: { availableLangs: ['vi', 'en'], defaultLang: 'vi' },
      }),
    ),
  ];
}
