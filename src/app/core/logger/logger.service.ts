import { Injectable, inject } from '@angular/core';
import { AppConfigService } from '../config/app-config.service';
import { LogEntry } from './log-entry';
import { LogLevel } from './log-level';
import { LOG_SINKS } from './log-sink';

const LEVEL_BY_CONFIG_KEY: Record<string, LogLevel> = {
  debug: LogLevel.Debug,
  info: LogLevel.Info,
  warn: LogLevel.Warn,
  error: LogLevel.Error,
  fatal: LogLevel.Fatal,
};

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly appConfigService = inject(AppConfigService);
  private readonly sinks = inject(LOG_SINKS, { optional: true }) ?? [];

  debug(message: string, context?: Record<string, unknown>): void {
    this.write(LogLevel.Debug, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write(LogLevel.Info, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write(LogLevel.Warn, message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.write(LogLevel.Error, message, context);
  }

  fatal(message: string, context?: Record<string, unknown>): void {
    this.write(LogLevel.Fatal, message, context);
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const { correlationId, ...rest } = context ?? {};

    const entry: LogEntry = {
      level,
      message,
      context: Object.keys(rest).length > 0 ? rest : undefined,
      correlationId: typeof correlationId === 'string' ? correlationId : undefined,
      timestamp: new Date().toISOString(),
    };

    for (const sink of this.sinks) {
      sink.write(entry);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.appConfigService.production && level === LogLevel.Debug) {
      return false;
    }

    const configuredLevel =
      LEVEL_BY_CONFIG_KEY[this.appConfigService.config().logLevel] ?? LogLevel.Debug;
    return level >= configuredLevel;
  }
}
