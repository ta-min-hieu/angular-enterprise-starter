import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, of } from 'rxjs';
import { AppConfig, DEFAULT_APP_CONFIG } from './app-config.model';
import { APP_CONFIG_OVERRIDE } from './app-config-override.token';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly http = inject(HttpClient);
  private readonly override = inject(APP_CONFIG_OVERRIDE, { optional: true });
  private readonly configSignal = signal<AppConfig>(DEFAULT_APP_CONFIG);

  readonly config = this.configSignal.asReadonly();

  async load(): Promise<void> {
    if (this.override) {
      this.configSignal.set(this.override);
      return;
    }

    const loaded = await firstValueFrom(
      this.http.get<AppConfig>('config.json').pipe(catchError(() => of(DEFAULT_APP_CONFIG))),
    );
    this.configSignal.set(loaded);
  }

  get apiBaseUrl(): string {
    return this.configSignal().apiBaseUrl;
  }

  get production(): boolean {
    return this.configSignal().production;
  }

  isFeatureEnabled(featureKey: string): boolean {
    return this.configSignal().features[featureKey] === true;
  }
}
