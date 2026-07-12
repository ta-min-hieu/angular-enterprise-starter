import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-forbidden-page',
  imports: [RouterLink, NzResultModule, NzButtonModule, TranslocoPipe],
  templateUrl: './forbidden-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenPage {}
