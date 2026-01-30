/**
 * Structured Logger
 * Provides consistent logging with levels, timestamps, and context
 * In production, integrate with services like LogTail, Axiom, or Datadog
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private minLevel: LogLevel = this.isDevelopment ? 'debug' : 'info';

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    success: 1,
    warn: 2,
    error: 3
  };

  private levelIcons: Record<LogLevel, string> = {
    debug: '🔍',
    info: 'ℹ️',
    success: '✅',
    warn: '⚠️',
    error: '❌'
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const icon = this.levelIcons[level];
    
    let formatted = `${icon} [${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += '\n' + JSON.stringify(context, null, 2);
    }
    
    return formatted;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', message, context));
  }

  success(message: string, context?: LogContext): void {
    if (!this.shouldLog('success')) return;
    console.log(this.formatMessage('success', message, context));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    };
    
    console.error(this.formatMessage('error', message, errorContext));
  }

  /**
   * Log API request/response
   */
  apiLog(method: string, path: string, statusCode: number, duration?: number): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'success';
    const message = `${method} ${path} - ${statusCode}`;
    const context = duration ? { durationMs: duration } : undefined;
    
    this[level](message, context);
  }

  /**
   * Log database operation
   */
  dbLog(operation: string, table: string, success: boolean, details?: any): void {
    const level = success ? 'debug' : 'error';
    const message = `DB ${operation} on ${table}`;
    this[level](message, details);
  }

  /**
   * Log authentication event
   */
  authLog(event: string, userId?: string, success: boolean = true): void {
    const level = success ? 'info' : 'warn';
    const message = `Auth: ${event}`;
    this[level](message, { userId });
  }

  /**
   * Log business event (lead created, job completed, etc.)
   */
  businessLog(event: string, context?: LogContext): void {
    this.info(`Business Event: ${event}`, context);
  }

  /**
   * Log cron job execution
   */
  cronLog(jobName: string, status: 'started' | 'completed' | 'failed', details?: any): void {
    const level = status === 'failed' ? 'error' : 'info';
    const message = `Cron Job [${jobName}]: ${status}`;
    this[level](message, details);
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (msg: string, ctx?: LogContext) => logger.debug(msg, ctx),
  info: (msg: string, ctx?: LogContext) => logger.info(msg, ctx),
  success: (msg: string, ctx?: LogContext) => logger.success(msg, ctx),
  warn: (msg: string, ctx?: LogContext) => logger.warn(msg, ctx),
  error: (msg: string, err?: Error | unknown, ctx?: LogContext) => logger.error(msg, err, ctx),
  api: (method: string, path: string, status: number, duration?: number) => logger.apiLog(method, path, status, duration),
  db: (op: string, table: string, success: boolean, details?: any) => logger.dbLog(op, table, success, details),
  auth: (event: string, userId?: string, success?: boolean) => logger.authLog(event, userId, success),
  business: (event: string, ctx?: LogContext) => logger.businessLog(event, ctx),
  cron: (job: string, status: 'started' | 'completed' | 'failed', details?: any) => logger.cronLog(job, status, details)
};
