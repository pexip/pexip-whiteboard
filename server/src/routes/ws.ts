import config from 'config'
import path from 'path'
import express, { type NextFunction, type Request } from 'express'

import { checkIfParticipantIsAllowed } from '../infinity'
import { createWhiteboardLink, deleteWhiteboardLink } from '../whiteboard/whiteboard'
import { getLogger, logWsMessage } from '../logger'
import { WebsocketMessageType } from '../types/WebsocketMessageType'

import type WebSocket from 'ws'
import type { Provider } from '../types/Provider'
import type { Connection } from '../types/Connection'
import type { WebSocketMessage } from '../types/WebsocketMessage'

const logger = getLogger(path.basename(__filename))

const router = express.Router()

const connections: Connection[] = []

const wsRouter = (): any => {
  router.ws('/:conference/:participantUuid', (ws, req, next) => {
    handleNewConnection(ws, req, next)
  })
  return router
}

const handleNewConnection = (ws: WebSocket, req: Request, next: NextFunction): void => {
  const participantUuid = req.params.participantUuid
  connections.push({
    ws,
    conference: req.params.conference,
    participantUuid: req.params.participantUuid
  })
  ws.on('close', () => {
    const conn = getConnection(participantUuid)
    if (conn != null) {
      handleCloseConnection(conn)
    }
  })

  ws.on('message', (msg) => {
    const conn = getConnection(participantUuid)
    if (conn != null) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      void handleReceiveMessage(conn, msg.toString())
    }
  })
}

const getConnection = (participantUuid: string): Connection | null => {
  return connections.find((conn) => conn.participantUuid === participantUuid) ?? null
}

const handleCloseConnection = (conn: Connection): void => {
  const message = 'Disconnected'
  logWs(conn, message)
  deleteWhiteboardLink(conn.conference).catch((e) => { logWsError(conn, e) })
  removeConnection(conn)
}

const handleReceiveMessage = async (conn: Connection, msg: string): Promise<void> => {
  const msgParsed = JSON.parse(msg)
  let error = ''
  switch (msgParsed.type) {
    case WebsocketMessageType.Create: {
      try {
        const provider = msgParsed.body
        const link = await handleCreateWhiteboard(conn, provider)
        notifyWhiteboardCreated(conn, link)
      } catch (e: any) {
        error = e.message
      }
      break
    }
    default: {
      error = 'Unsupported message type'
    }
  }
  if (error !== '') {
    logWsError(conn, error)
    sendWsError(conn, error)
  }
}

const handleCreateWhiteboard = async (conn: Connection, provider: Provider): Promise<string> => {
  if (!config.has('validateInfinityConference') || config.get('validateInfinityConference')) {
    await checkIfParticipantIsAllowed(conn.conference, conn.participantUuid)
  }
  if (provider == null) {
    provider = getDefaultProvider()
  }
  const link = await createWhiteboardLink(conn, provider)
  return link
}

const notifyWhiteboardCreated = (conn: Connection, link: string): void => {
  connections.forEach((c: Connection) => {
    if (c.conference === conn.conference) {
      const isCreator = c.participantUuid === conn.participantUuid
      const type = isCreator ? WebsocketMessageType.Created : WebsocketMessageType.Invited
      const body = link
      const msg = sendWs(c, type, body)
      const logMessage = 'Message Sent'
      logWs(c, logMessage, msg)
    }
  })
}

const logWs = (conn: Connection, msg: string, body?: object): void => {
  logWsMessage({
    logger,
    connection: conn,
    message: msg,
    body
  })
}

const logWsError = (conn: Connection, msg: string): void => {
  logWsMessage({
    logger,
    level: 'error',
    connection: conn,
    message: msg
  })
}

const sendWs = (conn: Connection, type: WebsocketMessageType, body: any): object => {
  const msg: WebSocketMessage = {
    type,
    body
  }
  conn.ws.send(JSON.stringify(msg))
  return msg
}

const sendWsError = (conn: Connection, error: string): object => {
  const msg: WebSocketMessage = {
    type: WebsocketMessageType.Error,
    body: error
  }
  conn.ws.send(JSON.stringify(msg))
  return msg
}

const getDefaultProvider = (): Provider => {
  return config.get('whiteboard.defaultProvider') ?? config.get('whiteboard.providers[0].id')
}

const removeConnection = (conn: Connection): void => {
  connections.forEach((c, index) => {
    if (c.participantUuid === conn.participantUuid) {
      connections.splice(index, 1)
    }
  })
}

export { wsRouter }
