import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LoadingIndicator } from './loading-indicator';

describe('LoadingIndicator', () => {
  it('should create with default inputs', () => {
    TestBed.configureTestingModule({ imports: [LoadingIndicator] });
    const fixture = TestBed.createComponent(LoadingIndicator);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.size()).toBe('default');
    expect(fixture.componentInstance.fullscreen()).toBe(false);
  });

  it('should render fullscreen overlay class when fullscreen input is true', () => {
    TestBed.configureTestingModule({ imports: [LoadingIndicator] });
    const fixture = TestBed.createComponent(LoadingIndicator);
    fixture.componentRef.setInput('fullscreen', true);

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.app-loading-indicator--fullscreen')).toBeTruthy();
  });
});
