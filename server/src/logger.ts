import config from 'config'
import pino, { type Level, type Logger } from 'pino'

interface LoggingRequest {
  logger: Logger
  level?: Level
  conference: string
  participantUuid: string
  message: string
  body?: object
}

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

const logWsMessage = (req: LoggingRequest): void => {
  let msg = {
    conference: req.conference,
    participantUuid: req.participantUuid,
    message: req.message
  }
  if (req.body != null) {
    msg = Object.assign(msg, { body: req.body })
  }
  switch (req.level) {
    case 'fatal': {
      req.logger.fatal(msg)
      break
    }
    case 'error': {
      req.logger.error(msg)
      break
    }
    case 'warn': {
      req.logger.warn(msg)
      break
    }
    case 'info': {
      req.logger.info(msg)
      break
    }
    case 'debug': {
      req.logger.debug(msg)
      break
    }
    case 'trace': {
      req.logger.trace(msg)
      break
    }
    default: {
      req.logger.info(msg)
      break
    }
  }
}

export {
  getLogger,
  logWsMessage
}
