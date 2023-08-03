import config from 'config'
import pino, { type Logger } from 'pino'

const getLogger = (name: string): Logger => {
  const logger = pino({
    name,
    level: config.has('server.logLevel') ? config.get('server.logLevel') : 'info',
    transport: {
      target: 'pino-pretty'
    }
  })
  return logger
}

export {
  getLogger
}
