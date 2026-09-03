import pino, { Logger as BasePinoLogger, LoggerOptions } from 'pino';
import pretty from 'pino-pretty';
import util from 'util';
import { env } from '../../config/env.js';

// Sensitive data redaction rules to prevent credential leakage in logs
export const SENSITIVE_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'headers.authorization',
  'headers.cookie',
  'authorization',
  'cookie',
  'password',
  'passwordHash',
  'currentPassword',
  'newPassword',
  'token',
  'refreshToken',
  'resetToken',
  'secret',
  'apiKey',
  'body.password',
  'body.currentPassword',
  'body.newPassword',
  'body.token',
  'body.refreshToken',
  'data.password',
  'data.currentPassword',
  'data.newPassword',
  'data.token',
  '*.password',
  '*.passwordHash',
  '*.token',
  '*.secret',
  '*.apiKey'
];

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const format = process.env.LOG_FORMAT || env.LOG_FORMAT || (isProduction ? 'json' : 'pretty');
const level = process.env.LOG_LEVEL || env.LOG_LEVEL || (isTest ? 'warn' : (isProduction ? 'info' : 'debug'));

export const pinoOptions: LoggerOptions = {
  level,
  redact: {
    paths: SENSITIVE_PATHS,
    censor: '[REDACTED]'
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
};

function createBaseLogger(): BasePinoLogger {
  if (format === 'pretty' && !isTest) {
    const stream = pretty({
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname'
    });
    return pino(pinoOptions, stream);
  }
  return pino(pinoOptions);
}

export interface GuidelyLogger {
  readonly raw: BasePinoLogger;
  level: string;
  info(msgOrObj: unknown, ...args: unknown[]): void;
  warn(msgOrObj: unknown, ...args: unknown[]): void;
  error(msgOrObj: unknown, ...args: unknown[]): void;
  debug(msgOrObj: unknown, ...args: unknown[]): void;
  fatal(msgOrObj: unknown, ...args: unknown[]): void;
  trace(msgOrObj: unknown, ...args: unknown[]): void;
  child(bindings: Record<string, unknown>): GuidelyLogger;
  security(event: string, details?: Record<string, unknown>): void;
  http(details: Record<string, unknown>, msg?: string): void;
  database(event: string, details?: Record<string, unknown>): void;
  ws(event: string, details?: Record<string, unknown>): void;
}

export function wrapPino(p: BasePinoLogger): GuidelyLogger {
  const createLogFn = (lvl: 'info' | 'warn' | 'error' | 'debug' | 'fatal' | 'trace') => {
    return (msgOrObj: unknown, ...args: unknown[]): void => {
      if (typeof msgOrObj === 'string') {
        if (args.length === 0) {
          (p[lvl] as (msg: string) => void)(msgOrObj);
        } else if (args.length === 1 && args[0] instanceof Error) {
          (p[lvl] as (obj: object, msg: string) => void)({ err: args[0] }, msgOrObj);
        } else {
          const errArg = args.find((a) => a instanceof Error);
          if (errArg) {
            (p[lvl] as (obj: object, msg: string) => void)(
              { err: errArg },
              util.format(msgOrObj, ...args.filter((a) => a !== errArg))
            );
          } else {
            (p[lvl] as (msg: string) => void)(util.format(msgOrObj, ...args));
          }
        }
      } else if (msgOrObj instanceof Error) {
        const msg = args.length > 0 ? util.format(...args) : msgOrObj.message;
        (p[lvl] as (obj: object, msg: string) => void)({ err: msgOrObj }, msg);
      } else if (typeof msgOrObj === 'object' && msgOrObj !== null) {
        const msg = args.length > 0 ? util.format(...args) : undefined;
        if (msg) {
          (p[lvl] as (obj: object, msg: string) => void)(msgOrObj, msg);
        } else {
          (p[lvl] as (obj: object) => void)(msgOrObj);
        }
      } else {
        (p[lvl] as (msg: string) => void)(String(msgOrObj));
      }
    };
  };

  const wrapped: GuidelyLogger = {
    raw: p,
    get level() {
      return p.level;
    },
    set level(val: string) {
      p.level = val;
    },
    info: createLogFn('info'),
    warn: createLogFn('warn'),
    error: createLogFn('error'),
    debug: createLogFn('debug'),
    fatal: createLogFn('fatal'),
    trace: createLogFn('trace'),

    child(bindings: Record<string, unknown>): GuidelyLogger {
      return wrapPino(p.child(bindings));
    },

    security(event: string, details: Record<string, unknown> = {}): void {
      const isAlert =
        event.includes('FAIL') ||
        event.includes('UNAUTHORIZED') ||
        event.includes('BREACH') ||
        event.includes('FORBIDDEN') ||
        event.includes('RATE_LIMIT') ||
        event.includes('ATTACK');

      const prefix = isAlert ? '🚨 [SECURITY-ALERT]' : '🔒 [SECURITY]';
      const summary = `${prefix} ${event}${details.reason ? ` - ${details.reason}` : ''}${details.email ? ` [user: ${details.email}]` : ''}${details.ip ? ` (ip: ${details.ip})` : ''}`;

      if (isAlert) {
        wrapped.warn({ securityEvent: event, ...details }, summary);
      } else {
        wrapped.info({ securityEvent: event, ...details }, summary);
      }
    },

    http(details: Record<string, unknown>, customMsg?: string): void {
      const status = Number(details.statusCode || 200);
      const is5xx = status >= 500;
      const is4xx = status >= 400 && status < 500;
      const method = details.method || 'GET';
      const url = details.url || '/';
      const duration = details.durationMs !== undefined ? `${details.durationMs}ms` : '';
      const ip = details.ip ? ` [ip: ${details.ip}]` : '';
      const reqId = details.reqId ? ` [reqId: ${details.reqId}]` : '';

      const icon = is5xx ? '❌' : is4xx ? '⚠️' : '✅';
      const summary = customMsg || `${icon} HTTP ${method} ${url} ${status} ${duration}${ip}${reqId}`.trim();

      if (is5xx) {
        wrapped.error({ http: details, ...details }, summary);
      } else if (is4xx) {
        wrapped.warn({ http: details, ...details }, summary);
      } else {
        wrapped.info({ http: details, ...details }, summary);
      }
    },

    database(event: string, details: Record<string, unknown> = {}): void {
      const isError = event.includes('ERROR') || event.includes('FAIL');
      const isWarn = event.includes('DISCONNECT') || event.includes('RECONNECTING');
      const icon = isError ? '❌ [DATABASE-ERROR]' : isWarn ? '⚠️ [DATABASE]' : '🍃 [DATABASE]';
      const summary = `${icon} ${event}${details.dbName ? ` (${details.dbName})` : ''}${details.message ? `: ${details.message}` : ''}`;

      if (isError) {
        wrapped.error({ databaseEvent: event, ...details }, summary);
      } else if (isWarn) {
        wrapped.warn({ databaseEvent: event, ...details }, summary);
      } else {
        wrapped.info({ databaseEvent: event, ...details }, summary);
      }
    },

    ws(event: string, details: Record<string, unknown> = {}): void {
      const isError = event.includes('ERROR') || event.includes('FAIL');
      const icon = isError ? '⚠️ [WS-ERROR]' : '🔌 [WS]';
      const summary = `${icon} ${event}${details.userId ? ` [user: ${details.userId}]` : ''}${details.ip ? ` (ip: ${details.ip})` : ''}`;

      if (isError) {
        wrapped.error({ wsEvent: event, ...details }, summary);
      } else {
        wrapped.info({ wsEvent: event, ...details }, summary);
      }
    }
  };

  return wrapped;
}

export const logger = wrapPino(createBaseLogger());
export default logger;
