import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { NetworkBackground } from './network-background';

describe('NetworkBackground', () => {
  it('should create', () => {
    TestBed.configureTestingModule({ imports: [NetworkBackground] });
    const fixture = TestBed.createComponent(NetworkBackground);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
