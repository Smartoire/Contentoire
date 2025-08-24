import { LogBox } from 'react-native';

// Enable log box for development
LogBox.ignoreLogs(['Require cycle:']);

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLogLevel: LogLevel = __DEV__ ? 'debug' : 'warn';

class Logger {
  private static instance: Logger;
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  static getInstance(context: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(context);
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    let formatted = `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`;
    
    if (data) {
      try {
        formatted += `\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`;
      } catch (e) {
        formatted += ` [Error stringifying data]`;
      }
    }
    
    return formatted;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message, data);
      console.debug(formatted);
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message, data);
      console.log(formatted);
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message, data);
      console.warn(formatted);
    }
  }

  error(message: string, error?: Error | any) {
    if (this.shouldLog('error')) {
      const errorData = error?.stack || error?.message || error;
      const formatted = this.formatMessage('error', message, errorData);
      console.error(formatted);
    }
  }
}

export const createLogger = (context: string) => Logger.getInstance(context);

export const setLogLevel = (level: LogLevel) => {
  currentLogLevel = level;
  console.log(`Log level set to: ${level}`);
};

export const enableDebugLogs = () => setLogLevel('debug');
export const disableDebugLogs = () => setLogLevel('warn');
