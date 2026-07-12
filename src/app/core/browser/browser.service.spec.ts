import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { BrowserService } from './browser.service';

describe('BrowserService', () => {
  describe('in browser platform', () => {
    let service: BrowserService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(BrowserService);
      service.removeLocalStorageItem('test-key');
    });

    it('should report isBrowser = true', () => {
      expect(service.isBrowser).toBe(true);
    });

    it('should read/write/remove localStorage items', () => {
      expect(service.getLocalStorageItem('test-key')).toBeNull();

      service.setLocalStorageItem('test-key', 'value');
      expect(service.getLocalStorageItem('test-key')).toBe('value');

      service.removeLocalStorageItem('test-key');
      expect(service.getLocalStorageItem('test-key')).toBeNull();
    });

    it('should read/write/remove sessionStorage items', () => {
      service.removeSessionStorageItem('session-key');
      expect(service.getSessionStorageItem('session-key')).toBeNull();

      service.setSessionStorageItem('session-key', 'value');
      expect(service.getSessionStorageItem('session-key')).toBe('value');

      service.removeSessionStorageItem('session-key');
      expect(service.getSessionStorageItem('session-key')).toBeNull();
    });

    it('should expose window/document and browser info', () => {
      expect(service.getWindow()).not.toBeNull();
      expect(service.getDocument()).not.toBeNull();
      expect(service.getUserAgent()).not.toBeNull();
      expect(service.isOnline()).toBe(true);
    });

    it('should reload and navigate without throwing', () => {
      expect(() => service.reload()).not.toThrow();
      expect(() => service.navigateTo('/somewhere')).not.toThrow();
    });
  });

  describe('in server platform', () => {
    let service: BrowserService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });
      service = TestBed.inject(BrowserService);
    });

    it('should report isBrowser = false and never touch browser globals', () => {
      expect(service.isBrowser).toBe(false);
      expect(service.getWindow()).toBeNull();
      expect(service.getDocument()).toBeNull();
      expect(service.getLocalStorageItem('any')).toBeNull();
      expect(() => service.setLocalStorageItem('any', 'value')).not.toThrow();
      expect(service.isOnline()).toBe(true);
    });
  });
});
