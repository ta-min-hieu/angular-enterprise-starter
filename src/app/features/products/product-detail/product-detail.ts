import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Product } from '../product.model';
import { CATEGORY_OPTIONS, DATE_FORMAT, DATE_TIME_FORMAT, TAG_OPTIONS } from '../product.constants';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, DatePipe, NzDescriptionsModule, NzTagModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  readonly product = input<Product | null>(null);

  readonly dateFormat = DATE_FORMAT;
  readonly dateTimeFormat = DATE_TIME_FORMAT;

  categoryLabel(value: string): string {
    return CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
  }

  tagLabel(value: string): string {
    return TAG_OPTIONS.find((option) => option.value === value)?.label ?? value;
  }
}
