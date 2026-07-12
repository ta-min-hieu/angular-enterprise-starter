import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ServerErrorPage } from './server-error-page';

describe('ServerErrorPage', () => {
  it('should create', () => {
    TestBed.configureTestingModule({ imports: [ServerErrorPage] });

    const fixture = TestBed.createComponent(ServerErrorPage);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
