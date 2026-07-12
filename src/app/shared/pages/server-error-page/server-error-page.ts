import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { BrowserService } from '../../../core/browser/browser.service';

@Component({
  selector: 'app-server-error-page',
  imports: [NzResultModule, NzButtonModule],
  templateUrl: './server-error-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerErrorPage {
  private readonly browserService = inject(BrowserService);

  reload(): void {
    this.browserService.reload();
  }
}
