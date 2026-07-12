import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-empty-state',
  imports: [NzEmptyModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  private readonly i18nService = inject(I18nService);

  readonly message = input<string>();

  readonly resolvedMessage = computed(
    () => this.message() ?? this.i18nService.translate('common.empty_state.no_data'),
  );
}
