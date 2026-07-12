import { Injectable } from '@angular/core';
import { LogEntry } from './log-entry';
import { LogLevel } from './log-level';
import { LogSink } from './log-sink';

@Injectable({ providedIn: 'root' })
export class ConsoleLogSink implements LogSink {
  write(entry: LogEntry): void {
    const payload = {
      ...entry.context,
      correlationId: entry.correlationId,
      timestamp: entry.timestamp,
    };

    switch (entry.level) {
      case LogLevel.Debug:
        console.debug(entry.message, payload);
        break;
      case LogLevel.Info:
        console.info(entry.message, payload);
        break;
      case LogLevel.Warn:
        console.warn(entry.message, payload);
        break;
      case LogLevel.Error:
      case LogLevel.Fatal:
        console.error(entry.message, payload);
        break;
    }
  }
}
