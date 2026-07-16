import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { LanguageSwitcher } from '../../shared/components/language-switcher/language-switcher';
import { NetworkBackground } from '../../shared/components/network-background/network-background';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, NzCardModule, LanguageSwitcher, NetworkBackground],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {}
