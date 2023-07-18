import express from 'express'
import { getParticipants } from '../modules/infinity'
import type { InfinityParticipant } from '../modules/infinity'
import { v4 as uuidv4 } from 'uuid'
import type WebSocket from 'ws'

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
  let participants: InfinityParticipant[] = []
  try {
    participants = await getParticipants(connection.conference)
  } catch (error: any) {
    throw new Error('Cannot create the whiteboard')
  }
  const participant = participants.find((participant) => participant.call_uuid === connection.participantUuid)
  if (participant == null) {
    throw new Error(`Participant ${connection.participantUuid} cannot be found in conference ${connection.conference}`)
  }
  if (participant.role !== 'chair') {
    throw new Error(`Participant ${connection.participantUuid} doesn't have enough permissions`)
  }
  // TODO: Create the whiteboard
  console.log('continue')
}

const sendError = (ws: WebSocket, error: string): void => {
  const response: WebSocketMessage = {
    type: MessageType.Error,
    body: error
  }
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
        const response: WebSocketMessage = {
          type: MessageType.Error,
          body: 'Cannot find the connection'
        }
        ws.send(JSON.stringify(response))
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const msgParsed = JSON.parse(msg.toString())
      switch (msgParsed.type) {
        case MessageType.Create: {
          handleCreate(connection)
            .then(() => {
              ws.send('OK')
            })
            .catch((error) => {
              console.error(error)
              const response: WebSocketMessage = {
                type: MessageType.Error,
                body: error.toString()
              }
              ws.send(JSON.stringify(response))
            })
          break
        }
        default: {
          const response: WebSocketMessage = {
            type: MessageType.Error,
            body: 'Unsupported message type'
          }
          ws.send(JSON.stringify(response))
        }
      }
    })
    next()
  })
  return router
}

export default WsRouter
