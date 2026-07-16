import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { TranslocoPipe } from '@jsverse/transloco';

// Khung bố cục dùng chung cho thanh bộ lọc nhiều tiêu chí ở các màn list — chỉ lo LAYOUT (lưới field
// tự động xếp hàng/tự xuống dòng, nhãn nằm TRÊN input giống trong form, nút "Xoá bộ lọc"), KHÔNG
// biết field cụ thể là gì. Mỗi màn tự chiếu (projection) đúng field cần lọc vào — dùng lại nguyên
// các *Field component đã có sẵn trong form (app-select-field, app-text-field...), backed bởi
// FormControl của FormGroup riêng mỗi trang.
@Component({
  selector: 'app-filter-bar',
  imports: [NzButtonModule, NzIconModule, NzFormModule, TranslocoPipe],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBar {
  readonly hasActiveFilters = input(false);

  readonly clear = output<void>();

  onClear(): void {
    this.clear.emit();
  }
}
