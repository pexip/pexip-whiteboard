import express from 'express'
import type WebSocket from 'ws'
import { checkIfParticipantIsAllowed } from '../infinity'
import { createWhiteboardLink, deleteWhiteboardLink } from '../whiteboard/whiteboard'
import config from 'config'
import type { Provider } from '../whiteboard/providers/provider'
import { getLogger, logWsMessage } from '../logger'
import path from 'path'

const logger = getLogger(path.basename(__filename))

const router = express.Router()

enum MessageType {
  Create = 'create',
  Created = 'created',
  Invited = 'invited',
  Error = 'error'
}

interface WebSocketMessage {
  type: MessageType
  body: any
}

interface Connection {
  ws: WebSocket
  conference: string
  participantUuid: string
}

const connections: Connection[] = []

const getConnection = (participantUuid: string): Connection | undefined => {
  return connections.find((connection) => connection.participantUuid === participantUuid)
}

const handleCreate = async (connection: Connection, provider: Provider): Promise<void> => {
  if (!config.has('validateInfinityConference') || config.get('validateInfinityConference')) {
    await checkIfParticipantIsAllowed(connection.conference, connection.participantUuid)
  }
  if (provider == null) {
    provider = config.get('whiteboard.defaultProvider') ?? config.get('whiteboard.providers[0].id')
  }
  logger.info(`Creating Whiteboard by user: ${connection.participantUuid}...`)
  const link = await createWhiteboardLink(provider, connection.conference)
  logger.info('Whiteboard created!')
  const participants: string[] = []
  connections.forEach((conn) => {
    if (conn.conference === connection.conference) {
      const isCreator = conn.participantUuid === connection.participantUuid
      const message: WebSocketMessage = {
        type: isCreator ? MessageType.Created : MessageType.Invited,
        body: link
      }
      logWsMessage({
        logger,
        conference: connection.conference,
        participantUuid: connection.participantUuid,
        message: 'Message sent',
        body: message
      })
      conn.ws.send(JSON.stringify(message))
      if (!isCreator) participants.push(conn.participantUuid)
    }
  })
}

const sendError = (connection: Connection, error: string): void => {
  const response: WebSocketMessage = {
    type: MessageType.Error,
    body: error
  }
  logWsMessage({
    logger,
    level: 'error',
    conference: connection.conference,
    participantUuid: connection.participantUuid,
    message: error
  })
  connection.ws.send(JSON.stringify(response))
}

export const WsRouter = (): any => {
  router.ws('/:conference/:participantUuid', (ws, req, next) => {
    logWsMessage({
      logger,
      conference: req.params.conference,
      participantUuid: req.params.participantUuid,
      message: 'Connected'
    })
    const participantUuid = req.params.participantUuid
    connections.push({
      ws,
      conference: req.params.conference,
      participantUuid: req.params.participantUuid
    })

    ws.on('close', () => {
      connections.forEach((connection, index) => {
        if (connection.participantUuid === participantUuid) {
          logWsMessage({
            logger,
            conference: connection.conference,
            participantUuid: connection.participantUuid,
            message: 'Disconnected'
          })
          const conference = connection.conference
          connections.splice(index, 1)
          const conferenceFound = connections.some((connection) => connection.conference === conference)
          if (!conferenceFound) {
            deleteWhiteboardLink(conference).catch((e) => { logger.error(e) })
          }
        }
      })
    })

    ws.on('message', (msg) => {
      const connection = getConnection(participantUuid)
      if (connection == null) {
        sendError({
          ws,
          conference: 'not-found',
          participantUuid: 'not-found'
        }, 'Error: Cannot find the connection')
        return
      }

      let msgParsed
      try {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        msgParsed = JSON.parse(msg.toString())
        logWsMessage({
          logger,
          conference: connection.conference,
          participantUuid: connection.participantUuid,
          message: 'Message received',
          body: msgParsed
        })
      } catch (error) {
        sendError(connection, 'Cannot parse message')
        return
      }
      switch (msgParsed.type) {
        case MessageType.Create: {
          handleCreate(connection, msgParsed.body)
            .catch((error) => {
              sendError(connection, error.toString())
            })
          break
        }
        default: {
          sendError(connection, 'Unsupported message type')
        }
      }
    })
    next()
  })
  return router
}

export default WsRouter
