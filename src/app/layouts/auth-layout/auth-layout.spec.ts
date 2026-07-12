import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { AuthLayout } from './auth-layout';

describe('AuthLayout', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [AuthLayout],
      providers: [provideRouter([])],
    });

    const fixture = TestBed.createComponent(AuthLayout);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
