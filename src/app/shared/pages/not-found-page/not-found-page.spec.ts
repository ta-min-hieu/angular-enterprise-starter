import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter([])],
    });

    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
