import path from 'node:path';
import pino from 'pino';
import pinoHttp from 'pino-http';

const createFileTransport = () =>
  pino.transport({
    target: 'pino/file',
    options: { destination: path.join(process.cwd(), 'dist/tmp/app.log') },
  });

const createPrettyTransport = () =>
  pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname,reqId,responseTime',
    },
  });

const transport =
  process.env.NODE_ENV === 'production'
    ? createFileTransport()
    : createPrettyTransport();

export const loggerMiddleware = pinoHttp({
  enabled: process.env.NODE_ENV !== 'test',
  logger: pino(transport),
  customLogLevel: (_, res, err) => {
    const statusCode = res.statusCode || 200;
    if (statusCode >= 400 && statusCode < 500) return 'warn';
    if (statusCode >= 500 || err) return 'error';
    return 'info';
  },
});
