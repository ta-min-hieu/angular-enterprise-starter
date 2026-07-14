import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { TranslocoPipe } from '@jsverse/transloco';
import { Product } from '../product.model';
import { CATEGORY_OPTIONS, DATE_FORMAT, DATE_TIME_FORMAT, TAG_OPTIONS } from '../product.constants';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MediaSrcDirective } from '../../../shared/directives/media-src.directive';

@Component({
  selector: 'app-product-detail',
  imports: [
    CurrencyPipe,
    DatePipe,
    NzDescriptionsModule,
    NzTagModule,
    TranslocoPipe,
    MediaSrcDirective,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  private readonly i18nService = inject(I18nService);

  readonly product = input<Product | null>(null);

  readonly dateFormat = DATE_FORMAT;
  readonly dateTimeFormat = DATE_TIME_FORMAT;

  categoryLabel(value: string): string {
    const key = CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
    return this.i18nService.translate(key);
  }

  tagLabel(value: string): string {
    const key = TAG_OPTIONS.find((option) => option.value === value)?.label ?? value;
    return this.i18nService.translate(key);
  }
}
