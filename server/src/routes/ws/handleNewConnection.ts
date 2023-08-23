import path from 'path'
import { getLogger, logWs } from '../../logger'
import { addConnection, getConnectionByParticipant } from '../../connections/connections'
import { handleCloseConnection } from './handleCloseConnection'
import { handleReceiveMessage } from './handleReceiveMessage'

import type { Connection } from '../../connections/Connection'
import type { WebSocket } from 'ws'
import type { Request } from 'express'
import { getWhiteboardLink } from '../../whiteboard/whiteboard'
import { sendMessage } from './sendMessage'
import { WebsocketMessageType } from '../../types/WebSocketMessageType'

const logger = getLogger(path.basename(__filename))

export const handleNewConnection = (ws: WebSocket, req: Request): void => {
  const participantUuid = req.params.participantUuid
  const newConnection: Connection = {
    ws,
    conference: req.params.conference,
    participantUuid: req.params.participantUuid
  }
  addConnection(newConnection)
  logWs({
    logger,
    connection: newConnection,
    message: 'Connected'
  })
  const link = getWhiteboardLink(req.params.conference)
  if (link != null) {
    const msg = sendMessage(newConnection, WebsocketMessageType.Invited, link)
    logWs({
      logger,
      connection: newConnection,
      message: 'Message Sent',
      body: msg
    })
  }
  ws.on('close', () => {
    const conn = getConnectionByParticipant(participantUuid)
    if (conn != null) {
      handleCloseConnection(conn)
    }
  })

  ws.on('message', (msg) => {
    const conn = getConnectionByParticipant(participantUuid)
    if (conn != null) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      void handleReceiveMessage(conn, msg.toString())
    }
  })
}
