import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './page-header';
import { REGISTERED_ICONS } from '../../../core/icons/icon-registration';
import { provideTranslocoTesting } from '../../../core/i18n/testing/provide-transloco-testing';

describe('PageHeader', () => {
  function createFixture() {
    TestBed.configureTestingModule({
      imports: [PageHeader],
      providers: [
        provideRouter([]),
        provideNzIcons(REGISTERED_ICONS),
        ...provideTranslocoTesting(),
      ],
    });
    return TestBed.createComponent(PageHeader);
  }

  it('should render the title and breadcrumb items', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('breadcrumbItems', [
      { label: 'nav.system' },
      { label: 'roles.title' },
    ]);
    fixture.componentRef.setInput('title', 'roles.title');

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('roles.title');
    expect(el.querySelectorAll('nz-breadcrumb-item').length).toBe(3);
  });

  it('should not render a subtitle or add-button when not provided', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('breadcrumbItems', []);
    fixture.componentRef.setInput('title', 'roles.title');

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.app-page-header__subtitle')).toBeNull();
    expect(el.querySelector('a[nz-button]')).toBeNull();
  });

  it('should render a linked breadcrumb item and an add-button when provided', () => {
    const fixture = createFixture();
    fixture.componentRef.setInput('breadcrumbItems', [
      { label: 'roles.title', link: '/system/roles' },
    ]);
    fixture.componentRef.setInput('title', 'roles.form_page.create_title');
    fixture.componentRef.setInput('addLink', '/system/roles/new');
    fixture.componentRef.setInput('addLabel', 'roles.add_button');

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('nz-breadcrumb-item a')?.getAttribute('href')).toBe('/system/roles');
    expect(el.querySelector('a[nz-button]')?.getAttribute('href')).toBe('/system/roles/new');
  });
});
