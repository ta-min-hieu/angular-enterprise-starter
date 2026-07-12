import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { ForbiddenPage } from './forbidden-page';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('ForbiddenPage', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [ForbiddenPage],
      providers: [provideRouter([]), ...provideTranslocoTesting()],
    });

    const fixture = TestBed.createComponent(ForbiddenPage);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
