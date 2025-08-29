import path from 'node:path'
import pino from "pino";
import pinoHttp from "pino-http";
import pinoPretty from "pino-pretty";

const fileTransport = pino.transport({
  target: 'pino/file',
  options: { destination: path.join(process.cwd(), 'dist/tmp/app.log') },
});

const transport = process.env.NODE_ENV === 'production' ? fileTransport : pinoPretty()

export const loggerMiddleware = pinoHttp({
  enabled: process.env.NODE_ENV !== 'test',
  logger: pino(transport)
});