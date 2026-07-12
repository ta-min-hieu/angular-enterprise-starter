import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoggerService } from './logger.service';
import { AppConfigService } from '../config/app-config.service';
import { DEFAULT_APP_CONFIG } from '../config/app-config.model';
import { LOG_SINKS, LogSink } from './log-sink';

describe('LoggerService', () => {
  let sink: LogSink;
  let configSignal: ReturnType<typeof signal<typeof DEFAULT_APP_CONFIG>>;

  function setup(overrides: Partial<typeof DEFAULT_APP_CONFIG>): LoggerService {
    configSignal = signal({ ...DEFAULT_APP_CONFIG, ...overrides });
    sink = { write: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfigService,
          useValue: {
            config: configSignal,
            get production() {
              return configSignal().production;
            },
          },
        },
        { provide: LOG_SINKS, useValue: [sink] },
      ],
    });

    return TestBed.inject(LoggerService);
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should forward debug logs to sinks when not production and logLevel is debug', () => {
    const logger = setup({ production: false, logLevel: 'debug' });

    logger.debug('hello');

    expect(sink.write).toHaveBeenCalledTimes(1);
  });

  it('should suppress debug logs in production regardless of configured logLevel', () => {
    const logger = setup({ production: true, logLevel: 'debug' });

    logger.debug('hello');

    expect(sink.write).not.toHaveBeenCalled();
  });

  it('should suppress logs below the configured threshold', () => {
    const logger = setup({ production: false, logLevel: 'warn' });

    logger.info('should be filtered');
    logger.warn('should pass');

    expect(sink.write).toHaveBeenCalledTimes(1);
  });

  it('should always forward error logs when threshold allows it', () => {
    const logger = setup({ production: true, logLevel: 'debug' });

    logger.error('boom');

    expect(sink.write).toHaveBeenCalledTimes(1);
  });

  it('should lift a correlationId out of context into its own LogEntry field', () => {
    const logger = setup({ production: false, logLevel: 'debug' });

    logger.error('boom', { code: 'X', correlationId: 'abc-123' });

    expect(sink.write).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: 'abc-123',
        context: { code: 'X' },
      }),
    );
  });
});
