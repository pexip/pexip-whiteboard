import express from 'express'
import Debug from 'debug'
import { v4 as uuidv4 } from 'uuid'
import type WebSocket from 'ws'
import { checkIfParticipantIsAllowed } from '../modules/infinity'
import { createWhiteboardLink } from '../modules/whiteboard/whiteboard'

const debug = Debug('whiteboard-middleware:ws')

const prefixMessageType = 'whiteboard'
const router = express.Router()

enum MessageType {
  Create = `${prefixMessageType}:create`,
  Invited = `${prefixMessageType}:invited`,
  Error = `${prefixMessageType}:error`
}

interface WebSocketMessage {
  type: MessageType
  body: any
}

interface Connection {
  connectionUuid: string
  ws: WebSocket
  conference: string
  participantUuid: string
}

const connections: Connection[] = []

const getConnection = (connectionUuid: string): Connection | undefined => {
  return connections.find((connection) => connection.connectionUuid === connectionUuid)
}

const handleCreate = async (connection: Connection): Promise<void> => {
  await checkIfParticipantIsAllowed(connection.conference, connection.participantUuid)
  await createWhiteboardLink()
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
    const connectionUuid = uuidv4()
    connections.push({
      connectionUuid,
      ws,
      conference: req.params.conference,
      participantUuid: req.params.participantUuid
    })

    ws.on('close', () => {
      connections.forEach((connection, index) => {
        if (connection.connectionUuid === connectionUuid) {
          connections.splice(index, 1)
        }
      })
    })

    ws.on('message', (msg) => {
      const connection = getConnection(connectionUuid)
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
          handleCreate(connection)
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
