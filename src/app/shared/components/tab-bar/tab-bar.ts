import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { TranslocoPipe } from '@jsverse/transloco';
import { TabsService } from '../../../core/navigation/tabs.service';
import { OpenTab } from '../../../core/navigation/open-tab.model';

@Component({
  selector: 'app-tab-bar',
  imports: [NzIconModule, NzDropDownModule, NzMenuModule, TranslocoPipe],
  templateUrl: './tab-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabBar {
  protected readonly tabsService = inject(TabsService);

  activate(tab: OpenTab): void {
    this.tabsService.activate(tab.path);
  }

  close(event: MouseEvent, path: string): void {
    event.stopPropagation();
    this.tabsService.close(path);
  }
}
