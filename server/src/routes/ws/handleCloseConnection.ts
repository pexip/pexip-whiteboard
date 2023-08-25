import path from 'path'
import { getLogger, logWs } from '../../logger'
import { deleteWhiteboardLink, getWhiteboardLink } from '../../whiteboard/whiteboard'
import { getConnections, removeConnection } from '../../connections/connections'

import type { Connection } from '../../connections/Connection'

const logger = getLogger(path.basename(__filename))

const handleCloseConnection = (conn: Connection): void => {
  logWs({
    logger,
    connection: conn,
    message: 'Disconnected'
  })
  // If it's the last user, we delete the whiteboard
  const connections = getConnections()
  const participantsNumber = connections.filter((connection) => connection.conference === conn.conference).length
  if (participantsNumber === 1) {
    logger.info(`The last participant from conference "${conn.conference}" left.`)
    logger.info(`Removing whiteboard for "${conn.conference}"...`)
    if (getWhiteboardLink(conn.conference) != null) {
      deleteWhiteboardLink(conn.conference).then(() => {
        logger.info(`The whiteboard for "${conn.conference}" was removed.`)
      }).catch((e) => {
        logWs({
          logger,
          level: 'error',
          connection: conn,
          message: e?.message
        })
      })
    } else {
      logger.info(`The conference "${conn.conference}" doesn't have a whiteboard.`)
    }
  }
  removeConnection(conn)
}

export { handleCloseConnection }
