import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { PublicLayout } from './public-layout';
import { REGISTERED_ICONS } from '../../core/icons/icon-registration';

describe('PublicLayout', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [PublicLayout],
      providers: [provideRouter([]), provideNzIcons(REGISTERED_ICONS)],
    });

    const fixture = TestBed.createComponent(PublicLayout);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
