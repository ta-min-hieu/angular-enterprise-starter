import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { ForbiddenPage } from './forbidden-page';

describe('ForbiddenPage', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [ForbiddenPage],
      providers: [provideRouter([])],
    });

    const fixture = TestBed.createComponent(ForbiddenPage);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
