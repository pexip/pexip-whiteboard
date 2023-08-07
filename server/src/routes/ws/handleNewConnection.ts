import path from 'path'
import { getLogger, logWs } from '../../logger'
import { addConnection, getConnectionByParticipant } from './connections'
import { handleCloseConnection } from './handleCloseConnection'
import { handleReceiveMessage } from './handleReceiveMessage'

import type { Connection } from '../../types/Connection'
import type { WebSocket } from 'ws'
import type { Request } from 'express'

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
