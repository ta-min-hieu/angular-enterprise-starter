import { InjectionToken } from '@angular/core';
import { LogEntry } from './log-entry';

export interface LogSink {
  write(entry: LogEntry): void;
}

export const LOG_SINKS = new InjectionToken<LogSink[]>('LOG_SINKS');
