import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ServerErrorPage } from './server-error-page';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('ServerErrorPage', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [ServerErrorPage],
      providers: [...provideTranslocoTesting()],
    });

    const fixture = TestBed.createComponent(ServerErrorPage);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
