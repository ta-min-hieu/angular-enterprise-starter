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
    'common.actions.upload': 'Tải lên',
    'common.actions.remove': 'Xoá',
    'common.upload.hint':
      'Ảnh tối đa {{imageSize}}MB, video tối đa {{videoSize}}MB, tối đa {{count}} tệp',
    'common.upload.error_type': 'Định dạng tệp không được hỗ trợ',
    'common.upload.error_size': 'Kích thước tệp vượt quá {{size}}MB',
    'common.upload.error_max_count': 'Đã đạt số lượng tệp tối đa ({{count}})',
    'common.upload.error_generic': 'Tải tệp lên thất bại, vui lòng thử lại',
    'products.categories.accessories': 'Phụ kiện',
    'products.tags.best_seller': 'Bán chạy',
    'products.status.active': 'Đang bán',
    'products.status.inactive': 'Ngừng bán',
    'products.detail.featured_yes': 'Có',
    'products.detail.featured_no': 'Không',
    'products.form.media.label': 'Hình ảnh / Video',
    'common.notification.save_success': 'Lưu thành công',
    'common.notification.save_error': 'Lưu thất bại',
    'common.notification.delete_success': 'Xoá thành công',
    'common.notification.delete_error': 'Xoá thất bại',
  },
  en: {
    'common.placeholder.enter': 'Enter {{field}}',
    'common.placeholder.select': 'Select {{field}}',
    'common.validation.required_field': 'Please enter {{field}}',
    'common.validation.required_selection': 'Please select {{field}}',
    'common.empty_state.no_data': 'No data',
    'common.error_state.retry': 'Retry',
    'common.actions.upload': 'Upload',
    'common.actions.remove': 'Remove',
    'common.upload.hint':
      'Images up to {{imageSize}}MB, videos up to {{videoSize}}MB, up to {{count}} files',
    'common.upload.error_type': 'Unsupported file type',
    'common.upload.error_size': 'File exceeds {{size}}MB',
    'common.upload.error_max_count': 'Maximum number of files reached ({{count}})',
    'common.upload.error_generic': 'Upload failed, please try again',
    'products.categories.accessories': 'Accessories',
    'products.tags.best_seller': 'Best seller',
    'products.status.active': 'Active',
    'products.status.inactive': 'Inactive',
    'products.detail.featured_yes': 'Yes',
    'products.detail.featured_no': 'No',
    'products.form.media.label': 'Images / Videos',
    'common.notification.save_success': 'Saved successfully',
    'common.notification.save_error': 'Save failed',
    'common.notification.delete_success': 'Deleted successfully',
    'common.notification.delete_error': 'Delete failed',
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
