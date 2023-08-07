import path from 'path'
import { getLogger, logWs } from '../../logger'
import { deleteWhiteboardLink } from '../../whiteboard/whiteboard'
import { removeConnection } from './connections'

import type { Connection } from '../../types/Connection'

const logger = getLogger(path.basename(__filename))

const handleCloseConnection = (conn: Connection): void => {
  logWs({
    logger,
    connection: conn,
    message: 'Disconnected'
  })
  deleteWhiteboardLink(conn.conference).catch((e) => {
    logWs({
      logger,
      level: 'error',
      connection: conn,
      message: e
    })
  })
  removeConnection(conn)
}

export { handleCloseConnection }
