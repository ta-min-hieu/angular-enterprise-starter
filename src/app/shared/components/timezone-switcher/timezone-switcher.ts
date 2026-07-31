import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { TimezoneService } from '../../../core/timezone/timezone.service';

@Component({
  selector: 'app-timezone-switcher',
  imports: [NzIconModule, NzDropDownModule, NzMenuModule],
  templateUrl: './timezone-switcher.html',
  styleUrl: './timezone-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimezoneSwitcher {
  protected readonly timezoneService = inject(TimezoneService);

  selectTimezone(id: string): void {
    this.timezoneService.setTimezone(id);
  }
}
