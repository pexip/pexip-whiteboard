import express from 'express'
import Debug from 'debug'
import { v4 as uuidv4 } from 'uuid'
import type WebSocket from 'ws'
import { checkIfParticipantIsAllowed } from '../infinity'
import { createWhiteboardLink } from '../whiteboard/whiteboard'

const debug = Debug('whiteboard-middleware:ws')

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
  uuid: string
  ws: WebSocket
  conference: string
  participantUuid: string
}

const connections: Connection[] = []

const getConnection = (connectionUuid: string): Connection | undefined => {
  return connections.find((connection) => connection.uuid === connectionUuid)
}

const handleCreate = async (connection: Connection): Promise<void> => {
  await checkIfParticipantIsAllowed(connection.conference, connection.participantUuid)
  const link = await createWhiteboardLink(connection.conference)
  connections.forEach((conn) => {
    if (conn.conference === connection.conference) {
      const isCreator = conn.uuid === connection.uuid
      const message: WebSocketMessage = {
        type: isCreator ? MessageType.Created : MessageType.Invited,
        body: link
      }
      conn.ws.send(JSON.stringify(message))
    }
  })
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
      uuid: connectionUuid,
      ws,
      conference: req.params.conference,
      participantUuid: req.params.participantUuid
    })

    ws.on('close', () => {
      connections.forEach((connection, index) => {
        if (connection.uuid === connectionUuid) {
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
