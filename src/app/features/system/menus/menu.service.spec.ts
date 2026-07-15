import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { MenuService } from './menu.service';
import { MenuInput } from './menu.model';
import { MenuDto } from './menu-api.model';

const BASE_INPUT: MenuInput = {
  name: 'Người dùng',
  path: '/system/users',
  component: 'system/user/user-list',
  icon: 'user',
  menuType: 'MENU',
  parentId: null,
  sortOrder: 0,
  visible: true,
  status: 'ACTIVE',
};

const DTO: MenuDto = { id: 1, ...BASE_INPUT, parentId: null };

describe('MenuService', () => {
  let service: MenuService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(MenuService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load the menu tree and flatten it into a flat signal', () => {
    service.load().subscribe();

    const req = httpMock.expectOne('/api/rbac/menus');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({
      code: '200',
      message: 'Success',
      data: [
        { ...DTO, id: 1, parentId: null, children: [{ ...DTO, id: 2, parentId: 1, children: [] }] },
      ],
    });

    expect(service.menus().map((menu) => menu.id)).toEqual(['1', '2']);
    expect(service.loading()).toBe(false);
  });

  it('should fetch a single menu by id', () => {
    let result: { id: string } | undefined;
    service.getById('1').subscribe((menu) => (result = menu));

    const req = httpMock.expectOne('/api/rbac/menus/1');
    req.flush({ code: '200', message: 'Success', data: DTO });

    expect(result?.id).toBe('1');
  });

  it('should create a menu via JSON POST, converting parentId back to a number', () => {
    service.add({ ...BASE_INPUT, parentId: '5' }).subscribe();

    const req = httpMock.expectOne('/api/rbac/menus');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ ...BASE_INPUT, parentId: 5 });
    req.flush({ code: '200', message: 'Success', data: DTO });
  });

  it('should update a menu via JSON PUT', () => {
    service.update('1', BASE_INPUT).subscribe();

    const req = httpMock.expectOne('/api/rbac/menus/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ code: '200', message: 'Success', data: DTO });
  });

  it('should remove a menu', () => {
    service.remove('1').subscribe();

    const req = httpMock.expectOne('/api/rbac/menus/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ code: '200', message: 'Success' });
  });
});
