type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
type LogCategory = 'App' | 'Auth' | 'Supabase' | 'Queue' | 'Realtime' | 'UI';

interface LogOptions {
  category?: LogCategory;
  metadata?: Record<string, any>;
  error?: unknown;
}

const isDev = import.meta.env.DEV;

class LogManager {
  private formatMessage(level: LogLevel, message: string, options?: LogOptions) {
    const category = options?.category ? `[${options.category}]` : '[App]';
    return `${category} ${message}`;
  }

  private print(level: LogLevel, message: string, options?: LogOptions) {
    const formattedMessage = this.formatMessage(level, message, options);

    // No futuro, aqui podemos interceptar e mandar para o Sentry/Datadog
    // if (!isDev) { sendToSentry(...) }

    // No modo dev, usamos cores para facilitar a leitura
    if (isDev) {
      const styles = {
        DEBUG: 'color: #888888',
        INFO: 'color: #3b82f6', // blue
        WARN: 'color: #f59e0b', // amber
        ERROR: 'color: #ef4444; font-weight: bold', // red
      };

      const consoleArgs: any[] = [`%c${level}%c ${formattedMessage}`, `padding: 2px 4px; border-radius: 4px; color: white; background: ${styles[level].replace('color: ', '')}`, ''];

      if (options?.metadata) consoleArgs.push(options.metadata);
      if (options?.error) consoleArgs.push(options.error);

      switch (level) {
        case 'DEBUG':
          console.debug(...consoleArgs);
          break;
        case 'INFO':
          console.info(...consoleArgs);
          break;
        case 'WARN':
          console.warn(...consoleArgs);
          break;
        case 'ERROR':
          console.error(...consoleArgs);
          break;
      }
    } else {
      // Produção: Logs mais limpos (ou silenciosos se preferir)
      if (level === 'ERROR' || level === 'WARN') {
        const payload = {
          level,
          category: options?.category || 'App',
          message,
          metadata: options?.metadata,
          error: options?.error instanceof Error ? options.error.message : options?.error,
        };
        
        if (level === 'ERROR') console.error(JSON.stringify(payload));
        if (level === 'WARN') console.warn(JSON.stringify(payload));
      }
    }
  }

  debug(message: string, options?: LogOptions) {
    this.print('DEBUG', message, options);
  }

  info(message: string, options?: LogOptions) {
    this.print('INFO', message, options);
  }

  warn(message: string, options?: LogOptions) {
    this.print('WARN', message, options);
  }

  error(message: string, options?: LogOptions) {
    this.print('ERROR', message, options);
  }
}

export const logger = new LogManager();
