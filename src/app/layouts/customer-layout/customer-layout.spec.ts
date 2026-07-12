import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { CustomerLayout } from './customer-layout';
import { TOKEN_STORAGE } from '../../core/storage/token-storage';
import { LocalTokenStorage } from '../../core/storage/local-token-storage';
import { REGISTERED_ICONS } from '../../core/icons/icon-registration';

describe('CustomerLayout', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [CustomerLayout],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons(REGISTERED_ICONS),
        { provide: TOKEN_STORAGE, useClass: LocalTokenStorage },
      ],
    });

    const fixture = TestBed.createComponent(CustomerLayout);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
