import express from 'express'
import type WebSocket from 'ws'
import { checkIfParticipantIsAllowed } from '../infinity'
import { createWhiteboardLink } from '../whiteboard/whiteboard'
import config from 'config'
import type { Provider } from '../whiteboard/providers/provider'
import Debug from 'debug'

const debug = Debug('whiteboard-server:ws')

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
  debug(`Creating Whiteboard by user: ${connection.participantUuid}...`)
  const link = await createWhiteboardLink(provider, connection.conference)
  debug('Whiteboard created!')
  const participants: string[] = []
  connections.forEach((conn) => {
    if (conn.conference === connection.conference) {
      const isCreator = conn.participantUuid === connection.participantUuid
      const message: WebSocketMessage = {
        type: isCreator ? MessageType.Created : MessageType.Invited,
        body: link
      }
      conn.ws.send(JSON.stringify(message))
      if (!isCreator) participants.push(conn.participantUuid)
    }
  })
  if (participants.length > 0) {
    debug(`Whiteboard shared with following participants: ${participants.join(', ')}.`)
  }
}

const sendError = (ws: WebSocket, error: string): void => {
  const response: WebSocketMessage = {
    type: MessageType.Error,
    body: error
  }
  debug(error)
  ws.send(JSON.stringify(response))
}

export const WsRouter = (): any => {
  router.ws('/:conference/:participantUuid', (ws, req, next) => {
    debug(`Participant connected: ${req.params.participantUuid}`)
    const participantUuid = req.params.participantUuid
    connections.push({
      ws,
      conference: req.params.conference,
      participantUuid: req.params.participantUuid
    })

    ws.on('close', () => {
      debug(`Participant disconnected: ${participantUuid}`)
      connections.forEach((connection, index) => {
        if (connection.participantUuid === participantUuid) {
          connections.splice(index, 1)
        }
      })
    })

    ws.on('message', (msg) => {
      const connection = getConnection(participantUuid)
      if (connection == null) {
        sendError(ws, 'Error: Cannot find the connection')
        return
      }

      let msgParsed
      try {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        msgParsed = JSON.parse(msg.toString())
      } catch (error) {
        sendError(ws, 'Error: Cannot parse message')
        return
      }
      switch (msgParsed.type) {
        case MessageType.Create: {
          handleCreate(connection, msgParsed.body)
            .catch((error) => {
              sendError(ws, error.toString())
            })
          break
        }
        default: {
          sendError(ws, 'Error: Unsupported message type')
        }
      }
    })
    next()
  })
  return router
}

export default WsRouter
