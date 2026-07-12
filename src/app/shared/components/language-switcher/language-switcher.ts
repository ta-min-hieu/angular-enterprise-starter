import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-language-switcher',
  imports: [NzIconModule, NzDropDownModule, NzMenuModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcher {
  protected readonly i18nService = inject(I18nService);

  selectLocale(code: string): void {
    this.i18nService.setLocale(code);
  }
}
