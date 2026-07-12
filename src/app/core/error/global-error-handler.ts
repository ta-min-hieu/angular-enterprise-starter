import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Unexpected error';

    this.logger.fatal(message, {
      category: 'unexpected',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
