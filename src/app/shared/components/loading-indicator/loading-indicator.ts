import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-loading-indicator',
  imports: [NzSpinModule],
  templateUrl: './loading-indicator.html',
  styleUrl: './loading-indicator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingIndicator {
  readonly size = input<'small' | 'default' | 'large'>('default');
  readonly tip = input<string>('');
  readonly fullscreen = input(false);
}
