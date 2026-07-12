import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LocalTokenStorage } from './local-token-storage';

describe('LocalTokenStorage', () => {
  let storage: LocalTokenStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    storage = TestBed.inject(LocalTokenStorage);
    storage.clear();
  });

  it('should store and retrieve the access token', () => {
    expect(storage.getAccessToken()).toBeNull();

    storage.setAccessToken('access-123');

    expect(storage.getAccessToken()).toBe('access-123');
  });

  it('should store and retrieve the refresh token', () => {
    expect(storage.getRefreshToken()).toBeNull();

    storage.setRefreshToken('refresh-123');

    expect(storage.getRefreshToken()).toBe('refresh-123');
  });

  it('should clear both tokens', () => {
    storage.setAccessToken('access-123');
    storage.setRefreshToken('refresh-123');

    storage.clear();

    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });
});
