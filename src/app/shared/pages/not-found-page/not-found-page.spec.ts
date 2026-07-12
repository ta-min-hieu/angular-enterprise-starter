import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { NotFoundPage } from './not-found-page';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('NotFoundPage', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter([]), ...provideTranslocoTesting()],
    });

    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
